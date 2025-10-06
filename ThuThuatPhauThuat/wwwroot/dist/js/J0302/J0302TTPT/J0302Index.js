//var selectedIdVaoVien = null;
//var selectedIdChiDinhChiTiet = null;
//var tabLoaded = {};
//window.IDPhieuTTPT = 0;
//var currentTabIndex = 0; // 👉 giữ tab hiện tại
//window.yhct = false;
//window.IDKhoa = 0;
//window.MaKhoa = "";


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

//// 🔄 HÀM LOAD LẠI PHẦN SỐ PHIẾU
//function reloadSoPhieuSection() {
//    //console.log("🔄 Load lại phần số phiếu...");

//    // Xác định tab hiện tại đang active
//    var currentTab = $('a[data-bs-toggle="tab"].active').attr("href");
//    var tabNumber = 0;

//    if (currentTab === "#tabs-thongtin-7") tabNumber = 2;
//    else if (currentTab === "#tabs-trinhtu-7") tabNumber = 3;
//    else if (currentTab === "#tabs-ekip-7") tabNumber = 4;
//    else if (currentTab === "#tabs-thuoc-7") tabNumber = 5;

//    if (tabNumber > 0) {
//        // Tìm phần số phiếu trong tab hiện tại
//        var $soPhieuSection = $(currentTab).find('.so-phieu-section, .p-2.bg-azure-lt, [class*="so-phieu"]').first();

//        if ($soPhieuSection.length > 0) {
//            // Load lại phần số phiếu
//            $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
//                tabIndex: tabNumber,
//                idVaoVien: selectedIdVaoVien,
//                idcn: window._idcn,
//                idChiDinhChiTiet: selectedIdChiDinhChiTiet
//            })
//                .done(function (html) {
//                    $soPhieuSection.replaceWith(html);
//                    //console.log("✅ Đã load lại số phiếu thành công");

//                    // Khởi tạo lại JS cho phần số phiếu mới
//                    khoiTaoJSChoTab(tabNumber);
//                })
//                .fail(function () {
//                    console.warn("⚠️ Không thể load lại số phiếu");
//                });
//        } else {
//            // Nếu không tìm thấy phần số phiếu cụ thể, load lại toàn bộ tab
//            reloadCurrentTab();
//        }
//    }
//}

//// 🔄 HÀM LOAD LẠI TOÀN BỘ TAB HIỆN TẠI
//function reloadCurrentTab() {
//    var currentTab = $('a[data-bs-toggle="tab"].active').attr("href");
//    var tabNumber = 0;

//    if (currentTab === "#tabs-thongtin-7") tabNumber = 2;
//    else if (currentTab === "#tabs-trinhtu-7") tabNumber = 3;
//    else if (currentTab === "#tabs-ekip-7") tabNumber = 4;
//    else if (currentTab === "#tabs-thuoc-7") tabNumber = 5;

//    if (tabNumber > 0) {
//        //console.log("🔄 Load lại toàn bộ tab", tabNumber);

//        // Bản đồ URL
//        var urlMap = {
//            2: "/thu_thuat_phau_thuat/thong_tin",
//            3: "/thu_thuat_phau_thuat/trinh_tu",
//            4: "/thu_thuat_phau_thuat/ekip",
//            5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
//        };

//        // Load lại tab
//        $(currentTab).load(urlMap[tabNumber], function () {
//            // Load lại phần số phiếu
//            $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
//                tabIndex: tabNumber,
//                idVaoVien: selectedIdVaoVien,
//                idcn: window._idcn,
//                idChiDinhChiTiet: selectedIdChiDinhChiTiet
//            })
//                .done(function (html) {
//                    $(currentTab).prepend(html);

//                    // Khởi tạo lại JS
//                    khoiTaoJSChoTab(tabNumber);

//                    if (tabNumber === 2) {
//                        initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
//                    } else if (tabNumber === 4) {
//                        khoiTaoJSChoTab(tabNumber);
//                        initEkipTab();
//                    } else if (tabNumber === 3) {
//                        khoiTaoJSChoTab(tabNumber);
//                    }
//                });
//        });
//    }
//}

//// 🔄 HÀM CẬP NHẬT DANH SÁCH SAU KHI LƯU
//function updateDanhSachAfterSave() {

//    // Lấy lại các tham số filter hiện tại
//    const currentFilter = {
//        IdChiNhanh: _idcn,
//        Ngay: $("#txtDateTime").val().trim(),
//        IdPhongBuong: $(".tom-select-test").val() || 0,
//        TrangThai: $("input[name='statusGroup']:checked").val() || 0
//    };

//    // Gọi API lấy dữ liệu mới nhất
//    $.post("/thu_thuat_phau_thuat/loc_danh_sach", currentFilter, function (response) {
//        if (response && response.success && Array.isArray(response.data?.data)) {
//            allData = response.data.data;

//            // Giữ nguyên trang hiện tại và render lại
//            renderTable(allData, currentPage, pageSize);

//            // Highlight dòng vừa được cập nhật
//            highlightUpdatedRow();
//        }
//    }).fail(function () {
//        console.warn("⚠️ Không thể cập nhật danh sách");
//    });
//}

//// 🎯 HIGHLIGHT DÒNG VỪA ĐƯỢC CẬP NHẬT
//function highlightUpdatedRow() {
//    if (!selectedIdVaoVien || !selectedIdChiDinhChiTiet) return;

//    // Tìm dòng có idVaoVien và idChiDinhChiTiet trùng
//    const $targetRow = $(`#example tbody tr[data-idvaovien="${selectedIdVaoVien}"][data-idchidinhct="${selectedIdChiDinhChiTiet}"]`);

//    if ($targetRow.length > 0) {
//        // Bỏ highlight tất cả các dòng
//        $("#example tbody tr").removeClass("table-active");

//        // Highlight dòng vừa cập nhật
//        $targetRow.addClass("table-active");

//        // Thêm hiệu ứng flash để người dùng dễ nhận biết
//        $targetRow.addClass("flash-update");
//        setTimeout(() => {
//            $targetRow.removeClass("flash-update");
//        }, 2000);

//        //console.log("🎯 Đã highlight dòng vừa cập nhật");
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
//            //console.log("🔄 Load nội dung tab", tabNumber);

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
//                                khoiTaoJSChoTab(tabNumber);

//                                initEkipTab();
//                            } else if (tabNumber === 3) {
//                                khoiTaoJSChoTab(tabNumber);
//                            }

//                            tabLoaded[tabKey] = true;
//                        }, 80); // delay nhẹ cho browser render xong
//                    });
//            });
//        } else {
//            khoiTaoJSChoTab(tabNumber);
//        }
//    });

//    // 👉 Save
//    $(document).on('click', '#btn_saveIndex', async function (e) {
//        e.preventDefault();
//        e.stopPropagation();


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


//        try {
//            if (!IDPhieuTTPT || IDPhieuTTPT === 0) {
//                let res = await $.ajax({
//                    url: '/thu_thuat_phau_thuat/create-phieu',
//                    type: 'POST',
//                    contentType: 'application/json',
//                    data: JSON.stringify(data)
//                });
//                if (res.success) {
//                    window.IDPhieuTTPT = res.idPhieuTTPT;
//                    toastr.success("Tạo phiếu thành công");

//                    reloadSoPhieuSection();

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
//                toastr.success("Cập nhật phiếu thành công");

//                // 🔄 CẬP NHẬT DANH SÁCH SAU KHI CHỈNH SỬA
//                updateDanhSachAfterSave();
//            }

//            // Gọi các hàm save khác
//            if (typeof handleSaveThongTin === 'function') handleSaveThongTin();
//            if (typeof saveTrinhTu === 'function') saveTrinhTu();
//            if (typeof handleSaveEkip === 'function') handleSaveEkip();

//        } catch (error) {
//            console.error("❌ Lỗi khi lưu:", error);
//            toastr.error("Lỗi khi lưu dữ liệu");
//        } finally {
//            setLoading($btn, false);
//        }
//    });

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

//// Thêm CSS cho hiệu ứng flash
//const style = document.createElement('style');
//style.textContent = `
//    .flash-update {
//        animation: flashUpdate 2s ease-in-out;
//    }
//    @keyframes flashUpdate {
//        0% { background-color: transparent; }
//        50% { background-color: #d4edda; }
//        100% { background-color: transparent; }
//    }
//`;
//document.head.appendChild(style);

//toastr.options = {
//    "closeButton": true,
//    "progressBar": true,
//    "positionClass": "toast-top-right",
//    "timeOut": "2000"
//};
var selectedIdVaoVien = null;
var selectedIdChiDinhChiTiet = null;
var tabLoaded = {};
window.IDPhieuTTPT = 0;
var currentTabIndex = 0;
window.yhct = false;
window.IDKhoa = 0;
window.MaKhoa = "";

// 🔄 BIẾN TOÀN CỤC LƯU TRẠNG THÁI SỐ PHIẾU
window.soPhieuGlobalData = {
    soPhieu: '',
    idNguonBenh: null,
    batDauThuThuat: '',
    ketThucThuThuat: '',
    thoiGianKhoa: '',
    nguoiKhoa: ''
};

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

// 🔄 HÀM LOAD PHẦN SỐ PHIẾU GLOBAL
// 🔄 HÀM LOAD PHẦN SỐ PHIẾU GLOBAL - CHỈ LOAD KHI CHƯA CÓ DỮ LIỆU
function loadGlobalSoPhieu(forceReload = false) {
    console.log("🔄 Loading global số phiếu...", { forceReload, hasData: !!window.soPhieuGlobalData.soPhieu });

    // Đảm bảo container tồn tại và hiển thị
    if ($('#global-so-phieu-container').length === 0) {
        $('.tab-content').before('<div id="global-so-phieu-container" class="mb-3"></div>');
    } else {
        $('#global-so-phieu-container').show();
    }

    // 🔥 QUAN TRỌNG: Nếu đã có dữ liệu global và không bắt buộc reload thì KHÔNG load từ server
    if (!forceReload && window.soPhieuGlobalData.soPhieu && $('#global-so-phieu-container').html().trim() !== '') {
        console.log("📦 Đã có dữ liệu, không load lại từ server");
        // Chỉ cần hiển thị container và khởi tạo lại JS
        khoiTaoJSChoTab(0);
        attachSoPhieuChangeEvents();
        return;
    }

    // Load nội dung số phiếu từ server
    $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
        tabIndex: 0,
        idVaoVien: selectedIdVaoVien,
        idcn: window._idcn,
        idChiDinhChiTiet: selectedIdChiDinhChiTiet
    })
        .done(function (html) {
            $('#global-so-phieu-container').html(html);
            console.log("✅ Đã load global số phiếu từ server");

            // Khởi tạo JS cho phần số phiếu
            khoiTaoJSChoTab(0);

            // Gắn sự kiện theo dõi thay đổi
            attachSoPhieuChangeEvents();

            // 🔥 CẬP NHẬT LẠI GIÁ TRỊ TỪ GLOBAL DATA (nếu có)
            setTimeout(() => {
                applySoPhieuGlobalData();
            }, 100);
        })
        .fail(function () {
            console.warn("⚠️ Không thể load số phiếu");
        });
}
// 🔄 ÁP DỤNG DỮ LIỆU TỪ GLOBAL STATE VÀO FORM
function applySoPhieuGlobalData() {
    if (!window.soPhieuGlobalData.soPhieu) return;

    console.log("🔄 Áp dụng global data vào form:", window.soPhieuGlobalData);

    const data = window.soPhieuGlobalData;

    // Áp dụng cho các input
    $('#soPhieu').val(data.soPhieu);
    $('.txtDateTimeBatDauThuThuat-0').val(data.batDauThuThuat);
    $('.txtDateTimeKetThucThuThuat-0').val(data.ketThucThuThuat);
    $('.txtDateTimeThoiGianKhoa-0').val(data.thoiGianKhoa);
    $('#nguoiKhoa').val(data.nguoiKhoa);

    // Áp dụng cho nguồn bệnh (TomSelect)
    if (data.idNguonBenh) {
        const selector = '.thuThuat__nguonBenh-tom-select-0';
        const tomSelectInstance = document.querySelector(selector)?.tomselect;
        if (tomSelectInstance) {
            tomSelectInstance.setValue(data.idNguonBenh, true);
        }
    }
}
// 🔄 THEO DÕI THAY ĐỔI TRÊN FORM SỐ PHIẾU
function attachSoPhieuChangeEvents() {
    // Theo dõi thay đổi trên các input
    $('#soPhieu, #nguoiKhoa').on('change input', function () {
        updateSoPhieuGlobalData();
    });

    // Theo dõi thay đổi datetime picker
    $('.txtDateTimeBatDauThuThuat-0, .txtDateTimeKetThucThuThuat-0, .txtDateTimeThoiGianKhoa-0').on('dp.change', function () {
        updateSoPhieuGlobalData();
    });

    // Theo dõi thay đổi TomSelect
    $('.thuThuat__nguonBenh-tom-select-0').on('change', function () {
        updateSoPhieuGlobalData();
    });
}

// 🔄 CẬP NHẬT DỮ LIỆU SỐ PHIẾU GLOBAL
function updateSoPhieuGlobalData() {
    window.soPhieuGlobalData = {
        soPhieu: $('#soPhieu').val() || '',
        idNguonBenh: getSelectedNguonBenh(),
        batDauThuThuat: $('.txtDateTimeBatDauThuThuat-0').val() || '',
        ketThucThuThuat: $('.txtDateTimeKetThucThuThuat-0').val() || '',
        thoiGianKhoa: $('.txtDateTimeThoiGianKhoa-0').val() || '',
        nguoiKhoa: $('#nguoiKhoa').val() || ''
    };
    console.log("📦 Updated global data:", window.soPhieuGlobalData);
}

// 🔄 LẤY GIÁ TRỊ NGUỒN BỆNH
function getSelectedNguonBenh() {
    const selector = '.thuThuat__nguonBenh-tom-select-0';
    const tomSelectInstance = document.querySelector(selector)?.tomselect;
    return tomSelectInstance ? tomSelectInstance.getValue() : '';
}

// 🔄 HÀM LOAD LẠI PHẦN SỐ PHIẾU
function reloadSoPhieuSection() {
    loadGlobalSoPhieu();
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
        var urlMap = {
            2: "/thu_thuat_phau_thuat/thong_tin",
            3: "/thu_thuat_phau_thuat/trinh_tu",
            4: "/thu_thuat_phau_thuat/ekip",
            5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
        };

        // Load lại tab
        $(currentTab).load(urlMap[tabNumber], function () {
            khoiTaoJSChoTab(tabNumber);

            if (tabNumber === 2) {
                initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
            } else if (tabNumber === 4) {
                initEkipTab();
            }
        });
    }
}

// 🔄 CẬP NHẬT DANH SÁCH SAU KHI LƯU
function updateDanhSachAfterSave() {
    const currentFilter = {
        IdChiNhanh: _idcn,
        Ngay: $("#txtDateTime").val().trim(),
        IdPhongBuong: $(".tom-select-test").val() || 0,
        TrangThai: $("input[name='statusGroup']:checked").val() || 0
    };

    $.post("/thu_thuat_phau_thuat/loc_danh_sach", currentFilter, function (response) {
        if (response && response.success && Array.isArray(response.data?.data)) {
            allData = response.data.data;
            renderTable(allData, currentPage, pageSize);
            highlightUpdatedRow();
        }
    }).fail(function () {
        console.warn("⚠️ Không thể cập nhật danh sách");
    });
}

// 🎯 HIGHLIGHT DÒNG VỪA ĐƯỢC CẬP NHẬT
function highlightUpdatedRow() {
    if (!selectedIdVaoVien || !selectedIdChiDinhChiTiet) return;

    const $targetRow = $(`#example tbody tr[data-idvaovien="${selectedIdVaoVien}"][data-idchidinhct="${selectedIdChiDinhChiTiet}"]`);

    if ($targetRow.length > 0) {
        $("#example tbody tr").removeClass("table-active");
        $targetRow.addClass("table-active");
        $targetRow.addClass("flash-update");
        setTimeout(() => {
            $targetRow.removeClass("flash-update");
        }, 2000);
    }
}

$(document).ready(async function () {
    // Load tab danh sách mặc định
    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach");

    // 🔄 TẠO CONTAINER SỐ PHIẾU NGAY TỪ ĐẦU (nhưng ẩn vì đang ở tab danh sách)
    if ($('#global-so-phieu-container').length === 0) {
        $('.tab-content').before('<div id="global-so-phieu-container" class="mb-3" style="display: none;"></div>');
    } else {
        $('#global-so-phieu-container').hide();
    }

    // Khi chuyển tab
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
        var tabNumber = 0;

        if (target === "#tabs-thongtin-7") tabNumber = 2;
        else if (target === "#tabs-trinhtu-7") tabNumber = 3;
        else if (target === "#tabs-ekip-7") tabNumber = 4;
        else if (target === "#tabs-thuoc-7") tabNumber = 5;

        currentTabIndex = tabNumber;

        // 🔄 XỬ LÝ HIỂN THỊ SỐ PHIẾU
        if (target === "#tabs-danhsach-7") {
            // ẨN số phiếu khi ở tab danh sách
            $('#global-so-phieu-container').hide();
        } else {
            // HIỆN số phiếu khi ở các tab khác và LOAD NẾU CHƯA CÓ NỘI DUNG
            $('#global-so-phieu-container').show();

            // 🔥 QUAN TRỌNG: Load số phiếu nếu container trống hoặc chưa có dữ liệu
            if ($('#global-so-phieu-container').is(':empty') ||
                !$('#soPhieu').length ||
                selectedIdVaoVien !== currentPatientContext.idVaoVien) {
                console.log("🔄 Load số phiếu vì container trống hoặc bệnh nhân thay đổi");
                loadGlobalSoPhieu();
            }
        }

        if (target === "#tabs-danhsach-7" && $(target).is(':empty')) {
            window.IDPhieuTTPT = 0;
            $(target).load("/thu_thuat_phau_thuat/danh_sach");
            return;
        }

        if (tabNumber <= 0) return;

        var urlMap = {
            2: "/thu_thuat_phau_thuat/thong_tin",
            3: "/thu_thuat_phau_thuat/trinh_tu",
            4: "/thu_thuat_phau_thuat/ekip",
            5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
        };

        var tabKey = `${tabNumber}_${selectedIdVaoVien}_${selectedIdChiDinhChiTiet}`;
        var shouldLoad = isNewPatientSelection() || !tabLoaded[tabKey];

        if (shouldLoad) {
            $(target).load(urlMap[tabNumber], function () {
                setTimeout(function () {
                    khoiTaoJSChoTab(tabNumber);

                    if (tabNumber === 2) {
                        initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
                    } else if (tabNumber === 4) {
                        initEkipTab();
                    }

                    tabLoaded[tabKey] = true;
                }, 80);
            });
        } else {
            khoiTaoJSChoTab(tabNumber);
        }
    });

    // 👉 Save (giữ nguyên)
    $(document).on('click', '#btn_saveIndex', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        var $btn = $(this);
        setLoading($btn, true, "Đang lưu...");

        // 🔄 CẬP NHẬT DỮ LIỆU GLOBAL TRƯỚC KHI LƯU
        updateSoPhieuGlobalData();

        var data = {
            SoPhieu: window.soPhieuGlobalData.soPhieu,
            IDNguonBenh: window.soPhieuGlobalData.idNguonBenh,
            BatDauThuThuat: formatLocalDateTime(window.soPhieuGlobalData.batDauThuThuat),
            KetThucThuThuat: formatLocalDateTime(window.soPhieuGlobalData.ketThucThuThuat),
            ThoiGianKhoa: formatLocalDateTime(window.soPhieuGlobalData.thoiGianKhoa),
            NhomMau: $('#nhomMau').val(),
            YeuToRh: $('#yeuToRh').val(),
            IDVaoVien: selectedIdVaoVien,
            IDChiDinhChiTiet: selectedIdChiDinhChiTiet,
            NguoiKhoa: window.soPhieuGlobalData.nguoiKhoa
        };

        try {
            if (!IDPhieuTTPT || IDPhieuTTPT === 0) {
                let res = await $.ajax({
                    url: '/thu_thuat_phau_thuat/create-phieu',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data)
                });
                if (res.success) {
                    window.IDPhieuTTPT = res.idPhieuTTPT;
                    toastr.success("Tạo phiếu thành công");
                    reloadSoPhieuSection();
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
                toastr.success("Cập nhật phiếu thành công");
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

    // 👉 Export PDF (giữ nguyên)
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
    
    /* Style cho global số phiếu container */
    #global-so-phieu-container {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #dee2e6;
        margin-bottom: 20px;
    }
`;
document.head.appendChild(style);

toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "timeOut": "2000"
};


