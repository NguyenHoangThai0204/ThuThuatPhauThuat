var selectedIdVaoVien = null;
var selectedIdChiDinhChiTiet = null;
var tabLoaded = {};
window.IDPhieuTTPT = 0;
var currentTabIndex = 0; // 👉 giữ tab hiện tại

function khoiTaoJSChoTab(tabIndex) {
    // Khởi tạo datetimepicker
    $('.datetimepicker-' + tabIndex).each(function () {
        if (!$(this).data("DateTimePicker")) {
            $(this).datetimepicker({});
        }
    });

    // Khởi tạo TomSelect chung
    $('.tom-select-' + tabIndex).each(function () {
        if (this && !this.tomselect) {
            try {
                new TomSelect(this, {});
            } catch (e) {
                console.error('Lỗi khởi tạo TomSelect:', e);
            }
        }
    });

    // 👉 Nếu tab có chứa nguồn bệnh thì gọi initNguonBenh
    if ($(`.thuThuat__nguonBenh-tom-select-${tabIndex}`).length) {
        fetchNguonBenhData().then(() => {
            initNguonBenhTomSelect(tabIndex);
        });
    }
}

function formatLocalDateTime(str) {
    if (!str) return null;
    const parts = str.split(/[- :]/);
    if (parts.length < 5) return null;

    const d = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);
    return d.getFullYear() + "-" +
        ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
        ("0" + d.getDate()).slice(-2) + "T" +
        ("0" + d.getHours()).slice(-2) + ":" +
        ("0" + d.getMinutes()).slice(-2) + ":00";
}

var currentPatientContext = {
    idVaoVien: null,
    idChiNhanh: null,
    idChiDinhChiTiet: null
};

function isNewPatientSelection() {
    var isNew = (currentPatientContext.idVaoVien !== selectedIdVaoVien ||
        currentPatientContext.idChiNhanh !== window._idcn ||
        currentPatientContext.idChiDinhChiTiet !== selectedIdChiDinhChiTiet);

    if (isNew) {
        currentPatientContext.idVaoVien = selectedIdVaoVien;
        currentPatientContext.idChiNhanh = window._idcn;
        currentPatientContext.idChiDinhChiTiet = selectedIdChiDinhChiTiet;
        tabLoaded = {}; // reset
    }

    return isNew;
}

function setLoading($btn, isLoading, loadingText) {
    if (isLoading) {
        $btn.data("original-html", $btn.html());
        $btn.prop("disabled", true).html(`
            <span class="spinner-border"></span> ${loadingText}
        `);
    } else {
        $btn.prop("disabled", false).html($btn.data("original-html"));
    }
}

// 🔄 HÀM LOAD LẠI PHẦN SỐ PHIẾU
function reloadSoPhieuSection() {
    console.log("🔄 Load lại phần số phiếu...");

    // Xác định tab hiện tại đang active
    var currentTab = $('a[data-bs-toggle="tab"].active').attr("href");
    var tabNumber = 0;

    if (currentTab === "#tabs-thongtin-7") tabNumber = 2;
    else if (currentTab === "#tabs-trinhtu-7") tabNumber = 3;
    else if (currentTab === "#tabs-ekip-7") tabNumber = 4;
    else if (currentTab === "#tabs-thuoc-7") tabNumber = 5;

    if (tabNumber > 0) {
        // Tìm phần số phiếu trong tab hiện tại
        var $soPhieuSection = $(currentTab).find('.so-phieu-section, .p-2.bg-azure-lt, [class*="so-phieu"]').first();

        if ($soPhieuSection.length > 0) {
            // Load lại phần số phiếu
            $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
                tabIndex: tabNumber,
                idVaoVien: selectedIdVaoVien,
                idcn: window._idcn,
                idChiDinhChiTiet: selectedIdChiDinhChiTiet
            })
                .done(function (html) {
                    $soPhieuSection.replaceWith(html);
                    console.log("✅ Đã load lại số phiếu thành công");

                    // Khởi tạo lại JS cho phần số phiếu mới
                    khoiTaoJSChoTab(tabNumber);
                })
                .fail(function () {
                    console.warn("⚠️ Không thể load lại số phiếu");
                });
        } else {
            // Nếu không tìm thấy phần số phiếu cụ thể, load lại toàn bộ tab
            reloadCurrentTab();
        }
    }
}

// 🔄 HÀM LOAD LẠI TOÀN BỘ TAB HIỆN TẠI
function reloadCurrentTab() {
    var currentTab = $('a[data-bs-toggle="tab"].active').attr("href");
    var tabNumber = 0;

    if (currentTab === "#tabs-thongtin-7") tabNumber = 2;
    else if (currentTab === "#tabs-trinhtu-7") tabNumber = 3;
    else if (currentTab === "#tabs-ekip-7") tabNumber = 4;
    else if (currentTab === "#tabs-thuoc-7") tabNumber = 5;

    if (tabNumber > 0) {
        console.log("🔄 Load lại toàn bộ tab", tabNumber);

        // Bản đồ URL
        var urlMap = {
            2: "/thu_thuat_phau_thuat/thong_tin",
            3: "/thu_thuat_phau_thuat/trinh_tu",
            4: "/thu_thuat_phau_thuat/ekip",
            5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
        };

        // Load lại tab
        $(currentTab).load(urlMap[tabNumber], function () {
            // Load lại phần số phiếu
            $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
                tabIndex: tabNumber,
                idVaoVien: selectedIdVaoVien,
                idcn: window._idcn,
                idChiDinhChiTiet: selectedIdChiDinhChiTiet
            })
                .done(function (html) {
                    $(currentTab).prepend(html);
                    console.log("✅ Đã load lại toàn bộ tab thành công");

                    // Khởi tạo lại JS
                    khoiTaoJSChoTab(tabNumber);

                    if (tabNumber === 2) {
                        initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
                    } else if (tabNumber === 4) {
                        initEkipTab();
                    }
                });
        });
    }
}

// 🔄 HÀM CẬP NHẬT DANH SÁCH SAU KHI LƯU
function updateDanhSachAfterSave() {
    console.log("🔄 Cập nhật danh sách sau khi lưu...");

    // Lấy lại các tham số filter hiện tại
    const currentFilter = {
        IdChiNhanh: _idcn,
        Ngay: $("#txtDateTime").val().trim(),
        IdPhongBuong: $(".tom-select-test").val() || 0,
        TrangThai: $("input[name='statusGroup']:checked").val() || 0
    };

    // Gọi API lấy dữ liệu mới nhất
    $.post("/thu_thuat_phau_thuat/loc_danh_sach", currentFilter, function (response) {
        if (response && response.success && Array.isArray(response.data?.data)) {
            allData = response.data.data;

            // Giữ nguyên trang hiện tại và render lại
            renderTable(allData, currentPage, pageSize);

            // Highlight dòng vừa được cập nhật
            highlightUpdatedRow();

            console.log("✅ Đã cập nhật danh sách thành công");
        }
    }).fail(function () {
        console.warn("⚠️ Không thể cập nhật danh sách");
    });
}

// 🎯 HIGHLIGHT DÒNG VỪA ĐƯỢC CẬP NHẬT
function highlightUpdatedRow() {
    if (!selectedIdVaoVien || !selectedIdChiDinhChiTiet) return;

    // Tìm dòng có idVaoVien và idChiDinhChiTiet trùng
    const $targetRow = $(`#example tbody tr[data-idvaovien="${selectedIdVaoVien}"][data-idchidinhct="${selectedIdChiDinhChiTiet}"]`);

    if ($targetRow.length > 0) {
        // Bỏ highlight tất cả các dòng
        $("#example tbody tr").removeClass("table-active");

        // Highlight dòng vừa cập nhật
        $targetRow.addClass("table-active");

        // Thêm hiệu ứng flash để người dùng dễ nhận biết
        $targetRow.addClass("flash-update");
        setTimeout(() => {
            $targetRow.removeClass("flash-update");
        }, 2000);

        console.log("🎯 Đã highlight dòng vừa cập nhật");
    }
}

$(document).ready(async function () {
    // Load tab danh sách mặc định
    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach");

    // Khi chuyển tab
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
        var tabNumber = 0;

        if (target === "#tabs-thongtin-7") tabNumber = 2;
        else if (target === "#tabs-trinhtu-7") tabNumber = 3;
        else if (target === "#tabs-ekip-7") tabNumber = 4;
        else if (target === "#tabs-thuoc-7") tabNumber = 5;

        currentTabIndex = tabNumber;

        if (target === "#tabs-danhsach-7" && $(target).is(':empty')) {
            window.IDPhieuTTPT = 0;
            $(target).load("/thu_thuat_phau_thuat/danh_sach");
            return;
        }

        if (tabNumber <= 0) return;

        // Bản đồ URL
        var urlMap = {
            2: "/thu_thuat_phau_thuat/thong_tin",
            3: "/thu_thuat_phau_thuat/trinh_tu",
            4: "/thu_thuat_phau_thuat/ekip",
            5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
        };

        var tabKey = `${tabNumber}_${selectedIdVaoVien}_${selectedIdChiDinhChiTiet}`;
        var shouldLoad = isNewPatientSelection() || !tabLoaded[tabKey];

        if (shouldLoad) {
            console.log("🔄 Load nội dung tab", tabNumber);

            // Bước 1: load phần chính của tab
            $(target).load(urlMap[tabNumber], function () {

                // Bước 2: gọi AJAX lấy thông tin số phiếu
                $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
                    tabIndex: tabNumber,
                    idVaoVien: selectedIdVaoVien,
                    idcn: window._idcn,
                    idChiDinhChiTiet: selectedIdChiDinhChiTiet
                })
                    .done(function (html) {
                        $(target).prepend(html);
                    })
                    .always(function () {
                        // 👉 chỉ khởi tạo sau khi cả hai phần trên hoàn tất
                        setTimeout(function () {
                            khoiTaoJSChoTab(tabNumber);

                            if (tabNumber === 2) {
                                initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
                            } else if (tabNumber === 4) {
                                initEkipTab();
                            }

                            tabLoaded[tabKey] = true;
                        }, 80); // delay nhẹ cho browser render xong
                    });
            });
        } else {
            console.log("✅ Tab đã có dữ liệu, chỉ khởi tạo lại:", tabNumber);
            khoiTaoJSChoTab(tabNumber);
        }
    });

    // 👉 Save
    $(document).on('click', '#btn_saveIndex', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log("👉 Nút Lưu click, currentTabIndex:", currentTabIndex);

        var $btn = $(this);
        setLoading($btn, true, "Đang lưu...");

        // 👇 SỬA: Dùng tabIndex = 0 thay vì currentTabIndex (vì form số phiếu luôn ở tab 0)
        var selectedNguonBenh = $('.thuThuat__nguonBenh-tom-select-0').val();

        var data = {
            SoPhieu: $('#soPhieu').val(),
            IDNguonBenh: selectedNguonBenh,
            BatDauThuThuat: formatLocalDateTime($('.txtDateTimeBatDauThuThuat-0').val()),
            KetThucThuThuat: formatLocalDateTime($('.txtDateTimeKetThucThuThuat-0').val()),
            ThoiGianKhoa: formatLocalDateTime($('.txtDateTimeThoiGianKhoa-0').val()),
            NhomMau: $('#nhomMau').val(),
            YeuToRh: $('#yeuToRh').val(),
            IDVaoVien: selectedIdVaoVien,
            IDChiDinhChiTiet: selectedIdChiDinhChiTiet,
            NguoiKhoa: $('#nguoiKhoa').val()
        };

        console.log("📦 Data gửi đi:", data);

        try {
            if (!IDPhieuTTPT || IDPhieuTTPT === 0) {
                let res = await $.ajax({
                    url: '/thu_thuat_phau_thuat/create-phieu',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data)
                });
                console.log("✅ Create result:", res);
                if (res.success) {
                    window.IDPhieuTTPT = res.idPhieuTTPT;
                    toastr.success("Tạo phiếu thành công");

                    // 🔄 LOAD LẠI PHẦN SỐ PHIẾU ĐỂ HIỂN THỊ THÔNG TIN MỚI
                    reloadSoPhieuSection();

                    // 🔄 CẬP NHẬT DANH SÁCH SAU KHI TẠO MỚI
                    updateDanhSachAfterSave();
                }
            } else {
                data.IDPhieuTTPT = IDPhieuTTPT;
                await $.ajax({
                    url: '/thu_thuat_phau_thuat/update-phieu',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(data)
                });
                console.log("✅ Update phiếu thành công");
                toastr.success("Cập nhật phiếu thành công");

                // 🔄 CẬP NHẬT DANH SÁCH SAU KHI CHỈNH SỬA
                updateDanhSachAfterSave();
            }

            // Gọi các hàm save khác
            if (typeof handleSaveThongTin === 'function') handleSaveThongTin();
            if (typeof saveTrinhTu === 'function') saveTrinhTu();
            if (typeof handleSaveEkip === 'function') handleSaveEkip();

        } catch (error) {
            console.error("❌ Lỗi khi lưu:", error);
            toastr.error("Lỗi khi lưu dữ liệu");
        } finally {
            setLoading($btn, false);
        }
    });

    // 👉 Export PDF
    $(document).on('click', '#btn_pdfIndex', function () {
        var $btn = $(this);
        var data = {
            IDVaoVien: selectedIdVaoVien,
            IDChiDinhChiTiet: selectedIdChiDinhChiTiet,
            IDChiNhanh: _idcn
        };

        if (selectedIdChiDinhChiTiet && selectedIdVaoVien && IDPhieuTTPT) {
            setLoading($btn, true, "Đang tạo...");

            fetch("/thu_thuat_phau_thuat/xuat-pdf-bang-html", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/pdf" },
                body: JSON.stringify(data)
            })
                .then(res => {
                    if (!res.ok) throw new Error("Export PDF thất bại");
                    return res.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "ThuThuatPhauThuat.pdf";
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toastr.success("Xuất PDF thành công");
                })
                .catch(err => {
                    console.error("Lỗi export PDF:", err);
                    toastr.error("Xuất PDF thất bại");
                })
                .finally(() => {
                    setLoading($btn, false);
                });
        } else {
            toastr.error("Vui lòng tạo số phiếu trước khi xuất PDF");
        }
    });
});

// Thêm CSS cho hiệu ứng flash
const style = document.createElement('style');
style.textContent = `
    .flash-update {
        animation: flashUpdate 2s ease-in-out;
    }
    @keyframes flashUpdate {
        0% { background-color: transparent; }
        50% { background-color: #d4edda; }
        100% { background-color: transparent; }
    }
`;
document.head.appendChild(style);

toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "timeOut": "2000"
};




//var selectedIdVaoVien = null;
//var selectedIdChiDinhChiTiet = null;
//var tabLoaded = {};
//window.IDPhieuTTPT = 0;
//var currentTabIndex = 0; // 👉 giữ tab hiện tại

//function khoiTaoJSChoTab(tabIndex) {
//    // Khởi tạo datetimepicker
//    $('.datetimepicker-' + tabIndex).each(function () {
//        if (!$(this).data("DateTimePicker")) {
//            $(this).datetimepicker({});
//        }
//    });

//    // Khởi tạo TomSelect chung
//    $('.tom-select-' + tabIndex).each(function () {
//        if (this && !this.tomselect) {
//            try {
//                new TomSelect(this, {});
//            } catch (e) {
//                console.error('Lỗi khởi tạo TomSelect:', e);
//            }
//        }
//    });

//    // 👉 Nếu tab có chứa nguồn bệnh thì gọi initNguonBenh
//    if ($(`.thuThuat__nguonBenh-tom-select-${tabIndex}`).length) {
//        fetchNguonBenhData().then(() => {
//            initNguonBenhTomSelect(tabIndex);
//        });
//    }
//}

//function formatLocalDateTime(str) {
//    if (!str) return null;
//    const parts = str.split(/[- :]/);
//    if (parts.length < 5) return null;

//    const d = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);
//    return d.getFullYear() + "-" +
//        ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
//        ("0" + d.getDate()).slice(-2) + "T" +
//        ("0" + d.getHours()).slice(-2) + ":" +
//        ("0" + d.getMinutes()).slice(-2) + ":00";
//}

//var currentPatientContext = {
//    idVaoVien: null,
//    idChiNhanh: null,
//    idChiDinhChiTiet: null
//};

//function isNewPatientSelection() {
//    var isNew = (currentPatientContext.idVaoVien !== selectedIdVaoVien ||
//        currentPatientContext.idChiNhanh !== window._idcn ||
//        currentPatientContext.idChiDinhChiTiet !== selectedIdChiDinhChiTiet);

//    if (isNew) {
//        currentPatientContext.idVaoVien = selectedIdVaoVien;
//        currentPatientContext.idChiNhanh = window._idcn;
//        currentPatientContext.idChiDinhChiTiet = selectedIdChiDinhChiTiet;
//        tabLoaded = {}; // reset
//    }

//    return isNew;
//}

//function setLoading($btn, isLoading, loadingText) {
//    if (isLoading) {
//        $btn.data("original-html", $btn.html());
//        $btn.prop("disabled", true).html(`
//            <span class="spinner-border"></span> ${loadingText}
//        `);
//    } else {
//        $btn.prop("disabled", false).html($btn.data("original-html"));
//    }
//}
//$(document).ready(async function () {
//    // Load tab danh sách mặc định
//    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach");

//    // Khi chuyển tab
//    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
//        var target = $(e.target).attr("href");
//        var tabNumber = 0;

//        if (target === "#tabs-thongtin-7") tabNumber = 2;
//        else if (target === "#tabs-trinhtu-7") tabNumber = 3;
//        else if (target === "#tabs-ekip-7") tabNumber = 4;
//        else if (target === "#tabs-thuoc-7") tabNumber = 5;

//        currentTabIndex = tabNumber;

//        if (target === "#tabs-danhsach-7" && $(target).is(':empty')) {
//            window.IDPhieuTTPT = 0;
//            $(target).load("/thu_thuat_phau_thuat/danh_sach");
//            return;
//        }

//        if (tabNumber <= 0) return;

//        // Bản đồ URL
//        var urlMap = {
//            2: "/thu_thuat_phau_thuat/thong_tin",
//            3: "/thu_thuat_phau_thuat/trinh_tu",
//            4: "/thu_thuat_phau_thuat/ekip",
//            5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
//        };

//        var tabKey = `${tabNumber}_${selectedIdVaoVien}_${selectedIdChiDinhChiTiet}`;
//        var shouldLoad = isNewPatientSelection() || !tabLoaded[tabKey];

//        if (shouldLoad) {
//            console.log("🔄 Load nội dung tab", tabNumber);

//            // Bước 1: load phần chính của tab
//            $(target).load(urlMap[tabNumber], function () {

//                // Bước 2: gọi AJAX lấy thông tin số phiếu
//                $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
//                    tabIndex: tabNumber,
//                    idVaoVien: selectedIdVaoVien,
//                    idcn: window._idcn,
//                    idChiDinhChiTiet: selectedIdChiDinhChiTiet
//                })
//                    .done(function (html) {
//                        $(target).prepend(html);
//                    })
//                    .always(function () {
//                        // 👉 chỉ khởi tạo sau khi cả hai phần trên hoàn tất
//                        setTimeout(function () {
//                            khoiTaoJSChoTab(tabNumber);

//                            if (tabNumber === 2) {
//                                initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
//                            } else if (tabNumber === 4) {
//                                initEkipTab();
//                            }

//                            tabLoaded[tabKey] = true;
//                        }, 80); // delay nhẹ cho browser render xong
//                    });
//            });
//        } else {
//            console.log("✅ Tab đã có dữ liệu, chỉ khởi tạo lại:", tabNumber);
//            khoiTaoJSChoTab(tabNumber);
//        }
//    });

//    // 👉 Save
//    // 👉 Save - SỬA LẠI
//    $(document).on('click', '#btn_saveIndex', async function (e) {
//        e.preventDefault();
//        e.stopPropagation();

//        console.log("👉 Nút Lưu click, currentTabIndex:", currentTabIndex);

//        var $btn = $(this);
//        setLoading($btn, true, "Đang lưu...");

//        // 👇 SỬA: Dùng tabIndex = 0 thay vì currentTabIndex (vì form số phiếu luôn ở tab 0)
//        var selectedNguonBenh = $('.thuThuat__nguonBenh-tom-select-0').val();

//        var data = {
//            SoPhieu: $('#soPhieu').val(),
//            IDNguonBenh: selectedNguonBenh,
//            BatDauThuThuat: formatLocalDateTime($('.txtDateTimeBatDauThuThuat-0').val()),
//            KetThucThuThuat: formatLocalDateTime($('.txtDateTimeKetThucThuThuat-0').val()),
//            ThoiGianKhoa: formatLocalDateTime($('.txtDateTimeThoiGianKhoa-0').val()),
//            NhomMau: $('#nhomMau').val(),
//            YeuToRh: $('#yeuToRh').val(),
//            IDVaoVien: selectedIdVaoVien,
//            IDChiDinhChiTiet: selectedIdChiDinhChiTiet,
//            NguoiKhoa: $('#nguoiKhoa').val()
//        };

//        console.log("📦 Data gửi đi:", data);

//        try {
//            if (!IDPhieuTTPT || IDPhieuTTPT === 0) {
//                let res = await $.ajax({
//                    url: '/thu_thuat_phau_thuat/create-phieu',
//                    type: 'POST',
//                    contentType: 'application/json',
//                    data: JSON.stringify(data)
//                });
//                console.log("✅ Create result:", res);
//                if (res.success) {
//                    window.IDPhieuTTPT = res.idPhieuTTPT;
//                    toastr.success("Tạo phiếu thành công");

//                    // 🔄 CẬP NHẬT DANH SÁCH SAU KHI TẠO MỚI
//                    updateDanhSachAfterSave();
//                }
//            } else {
//                data.IDPhieuTTPT = IDPhieuTTPT;
//                await $.ajax({
//                    url: '/thu_thuat_phau_thuat/update-phieu',
//                    type: 'PUT',
//                    contentType: 'application/json',
//                    data: JSON.stringify(data)
//                });
//                console.log("✅ Update phiếu thành công");
//                toastr.success("Cập nhật phiếu thành công");

//                // 🔄 CẬP NHẬT DANH SÁCH SAU KHI CHỈNH SỬA
//                updateDanhSachAfterSave();
//            }

//            // Gọi các hàm save khác
//            //if (typeof handleSaveThongTin === 'function') handleSaveThongTin();
//            //if (typeof saveTrinhTu === 'function') saveTrinhTu();
//            //if (typeof handleSaveEkip === 'function') handleSaveEkip();

//        } catch (error) {
//            console.error("❌ Lỗi khi lưu:", error);
//            toastr.error("Lỗi khi lưu dữ liệu");
//        } finally {
//            setLoading($btn, false);
//        }
//    });

//    // 🔄 HÀM CẬP NHẬT DANH SÁCH SAU KHI LƯU
//    function updateDanhSachAfterSave() {
//        console.log("🔄 Cập nhật danh sách sau khi lưu...");

//        // Lấy lại các tham số filter hiện tại
//        const currentFilter = {
//            IdChiNhanh: _idcn,
//            Ngay: $("#txtDateTime").val().trim(),
//            IdPhongBuong: $(".tom-select-test").val() || 0,
//            TrangThai: $("input[name='statusGroup']:checked").val() || 0
//        };

//        // Gọi API lấy dữ liệu mới nhất
//        $.post("/thu_thuat_phau_thuat/loc_danh_sach", currentFilter, function (response) {
//            if (response && response.success && Array.isArray(response.data?.data)) {
//                allData = response.data.data;

//                // Giữ nguyên trang hiện tại và render lại
//                renderTable(allData, currentPage, pageSize);

//                // Highlight dòng vừa được cập nhật
//                highlightUpdatedRow();

//                console.log("✅ Đã cập nhật danh sách thành công");
//            }
//        }).fail(function () {
//            console.warn("⚠️ Không thể cập nhật danh sách");
//        });
//    }

//    // 🎯 HIGHLIGHT DÒNG VỪA ĐƯỢC CẬP NHẬT
//    function highlightUpdatedRow() {
//        if (!selectedIdVaoVien || !selectedIdChiDinhChiTiet) return;

//        // Tìm dòng có idVaoVien và idChiDinhChiTiet trùng
//        const $targetRow = $(`#example tbody tr[data-idvaovien="${selectedIdVaoVien}"][data-idchidinhct="${selectedIdChiDinhChiTiet}"]`);

//        if ($targetRow.length > 0) {
//            // Bỏ highlight tất cả các dòng
//            $("#example tbody tr").removeClass("table-active");

//            // Highlight dòng vừa cập nhật
//            $targetRow.addClass("table-active");

//            // Thêm hiệu ứng flash để người dùng dễ nhận biết
//            $targetRow.addClass("flash-update");
//            setTimeout(() => {
//                $targetRow.removeClass("flash-update");
//            }, 2000);

//            console.log("🎯 Đã highlight dòng vừa cập nhật");
//        }
//    }

//    // Thêm CSS cho hiệu ứng flash
//    const style = document.createElement('style');
//    style.textContent = `
//    .flash-update {
//        animation: flashUpdate 2s ease-in-out;
//    }
//    @keyframes flashUpdate {
//        0% { background-color: transparent; }
//        50% { background-color: #d4edda; }
//        100% { background-color: transparent; }
//    }
//`;
//    document.head.appendChild(style);
   

//    // 👉 Export PDF
//    $(document).on('click', '#btn_pdfIndex', function () {
//        var $btn = $(this);
//        var data = {
//            IDVaoVien: selectedIdVaoVien,
//            IDChiDinhChiTiet: selectedIdChiDinhChiTiet,
//            IDChiNhanh: _idcn
//        };

//        if (selectedIdChiDinhChiTiet && selectedIdVaoVien && IDPhieuTTPT) {
//            setLoading($btn, true, "Đang tạo...");

//            fetch("/thu_thuat_phau_thuat/xuat-pdf-bang-html", {
//                method: "POST",
//                headers: { "Content-Type": "application/json", "Accept": "application/pdf" },
//                body: JSON.stringify(data)
//            })
//                .then(res => {
//                    if (!res.ok) throw new Error("Export PDF thất bại");
//                    return res.blob();
//                })
//                .then(blob => {
//                    const url = window.URL.createObjectURL(blob);
//                    const a = document.createElement("a");
//                    a.href = url;
//                    a.download = "ThuThuatPhauThuat.pdf";
//                    a.click();
//                    window.URL.revokeObjectURL(url);
//                    toastr.success("Xuất PDF thành công");
//                })
//                .catch(err => {
//                    console.error("Lỗi export PDF:", err);
//                    toastr.error("Xuất PDF thất bại");
//                })
//                .finally(() => {
//                    setLoading($btn, false);
//                });
//        } else {
//            toastr.error("Vui lòng tạo số phiếu trước khi xuất PDF");
//        }
//    });
//});


//toastr.options = {
//    "closeButton": true,
//    "progressBar": true,
//    "positionClass": "toast-top-right",
//    "timeOut": "2000"
//};