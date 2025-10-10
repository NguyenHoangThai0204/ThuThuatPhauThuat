var selectedIdVaoVien = null;
var selectedIdChiDinhChiTiet = null;
var tabLoaded = {};
window.IDPhieuTTPT = 0;
var currentTabIndex = 0;
window.yhct = false;
window.IDKhoa = 0;
window.MaKhoa = "";

function resetPatientSelection() {
    selectedIdVaoVien = null;
    selectedIdChiDinhChiTiet = null;
    window.IDPhieuTTPT = 0;
    currentPatientContext.idVaoVien = null;
    currentPatientContext.idChiDinhChiTiet = null;
    tabLoaded = {};

    // Reset UI info
    $("#info-tenbn", window.parent.document).text("");
    $("#info-namsinh", window.parent.document).text("");
    $("#info-bacsi", window.parent.document).text("");
    $("#info-tendichvu", window.parent.document).text("");

    console.log("🔄 Đã reset toàn bộ state chọn bệnh nhân");
}

function loadGlobalSoPhieu(forceReload = false) {
    if ($('#global-so-phieu-container').length === 0) {
        $('.tab-content').before('<div id="global-so-phieu-container"></div>');
    } else {
        $('#global-so-phieu-container').show();
    }

    // ✅ LUÔN LOAD KHI CÓ BỆNH NHÂN MỚI HOẶC FORCE RELOAD
    const hasNewPatient = selectedIdVaoVien &&
        (selectedIdVaoVien !== currentPatientContext.idVaoVien ||
            selectedIdChiDinhChiTiet !== currentPatientContext.idChiDinhChiTiet);

    if (forceReload || hasNewPatient || !window.soPhieuGlobalData.soPhieu || $('#global-so-phieu-container').html().trim() === '') {

        console.log("🔄 Loading global số phiếu:", {
            forceReload,
            hasNewPatient,
            currentPatient: currentPatientContext,
            newPatient: { selectedIdVaoVien, selectedIdChiDinhChiTiet }
        });

        $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
            tabIndex: 0,
            idVaoVien: selectedIdVaoVien,
            idcn: window._idcn,
            idChiDinhChiTiet: selectedIdChiDinhChiTiet
        })
            .done(function (html) {
                $('#global-so-phieu-container').html(html);
                khoiTaoJSChoTab(0);
                attachSoPhieuChangeEvents();

                // Load dữ liệu phiếu từ DB
                if (selectedIdVaoVien && selectedIdChiDinhChiTiet) {
                    $.getJSON('/thu_thuat_phau_thuat/get-phieu-by-vaovien', {
                        idVaoVien: selectedIdVaoVien,
                        idChiDinhChiTiet: selectedIdChiDinhChiTiet
                    })
                        .done(function (res) {
                            if (res && res.success && res.data) {
                                window.soPhieuGlobalData = {
                                    soPhieu: res.data.SoPhieu || '',
                                    idNguonBenh: res.data.IDNguonBenh || null,
                                    batDauThuThuat: res.data.BatDauThuThuat || '',
                                    ketThucThuThuat: res.data.KetThucThuThuat || '',
                                    thoiGianKhoa: res.data.ThoiGianKhoa || '',
                                    nguoiKhoa: res.data.NguoiKhoa || ''
                                };
                                applySoPhieuGlobalData();
                            } else {
                                // Nếu không có phiếu, reset data
                                window.soPhieuGlobalData = {
                                    soPhieu: '',
                                    idNguonBenh: null,
                                    batDauThuThuat: '',
                                    ketThucThuThuat: '',
                                    thoiGianKhoa: '',
                                    nguoiKhoa: ''
                                };
                                applySoPhieuGlobalData();
                            }
                        })
                        .fail(() => {
                            console.warn("⚠️ Không thể load số phiếu");
                            applySoPhieuGlobalData();
                        });
                }
            })
            .fail(function () {
                console.warn("⚠️ Không thể load số phiếu");
            });
    } else {
        khoiTaoJSChoTab(0);
        attachSoPhieuChangeEvents();
    }
}


// BIẾN TOÀN CỤC LƯU TRẠNG THÁI SỐ PHIẾU
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

    // Nếu tab có chứa nguồn bệnh thì gọi initNguonBenh
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
//function loadGlobalSoPhieu(forceReload = false) {
//    if ($('#global-so-phieu-container').length === 0) {
//        $('.tab-content').before('<div id="global-so-phieu-container"></div>');
//    } else {
//        $('#global-so-phieu-container').show();
//    }

//    // Nếu không cần reload, chỉ gắn lại event và init
//    if (!forceReload && window.soPhieuGlobalData.soPhieu && $('#global-so-phieu-container').html().trim() !== '') {
//        khoiTaoJSChoTab(0);
//        attachSoPhieuChangeEvents(); // luôn gọi lại
//        return;
//    }

//    // Load nội dung từ server
//    $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
//        tabIndex: 0,
//        idVaoVien: selectedIdVaoVien,
//        idcn: window._idcn,
//        idChiDinhChiTiet: selectedIdChiDinhChiTiet
//    })
//        .done(function (html) {
//            $('#global-so-phieu-container').html(html);
//            khoiTaoJSChoTab(0);
//            attachSoPhieuChangeEvents(); // gắn lại event sau khi render xong
//            setTimeout(() => {
//                applySoPhieuGlobalData();
//                attachSoPhieuChangeEvents(); // gắn thêm lần nữa để chắc chắn
//            }, 100);
//        })
//        .fail(function () {
//            console.warn("⚠️ Không thể load số phiếu");
//        });
//}


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
    attachSoPhieuChangeEvents();
}
function attachSoPhieuChangeEvents() {
    $('#soPhieu, #nguoiKhoa').on('change input', function () {
        updateSoPhieuGlobalData();
    });

    $('.txtDateTimeBatDauThuThuat-0, .txtDateTimeKetThucThuThuat-0, .txtDateTimeThoiGianKhoa-0').on('dp.change', function () {
        updateSoPhieuGlobalData();
    });

    $('.thuThuat__nguonBenh-tom-select-0').on('change', function () {
        updateSoPhieuGlobalData();
    });
}

function updateSoPhieuGlobalData() {
    window.soPhieuGlobalData = {
        soPhieu: $('#soPhieu').val() || '',
        idNguonBenh: getSelectedNguonBenh(),
        batDauThuThuat: $('.txtDateTimeBatDauThuThuat-0').val() || '',
        ketThucThuThuat: $('.txtDateTimeKetThucThuThuat-0').val() || '',
        thoiGianKhoa: $('.txtDateTimeThoiGianKhoa-0').val() || '',
        nguoiKhoa: $('#nguoiKhoa').val() || ''
    };
}

function getSelectedNguonBenh() {
    const selector = '.thuThuat__nguonBenh-tom-select-0';
    const tomSelectInstance = document.querySelector(selector)?.tomselect;
    return tomSelectInstance ? tomSelectInstance.getValue() : '';
}
function reloadSoPhieuSection() {
    loadGlobalSoPhieu();
}

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
    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach");
    if ($('#global-so-phieu-container').length === 0) {
        $('.tab-content').before('<div id="global-so-phieu-container" style="display: none;"></div>');
    } else {
        $('#global-so-phieu-container').hide();
    }
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
        var tabNumber = 0;

        if (target === "#tabs-thongtin-7") tabNumber = 2;
        else if (target === "#tabs-trinhtu-7") tabNumber = 3;
        else if (target === "#tabs-ekip-7") tabNumber = 4;
        else if (target === "#tabs-thuoc-7") tabNumber = 5;

        currentTabIndex = tabNumber;

        if (target === "#tabs-danhsach-7") {
            $('#global-so-phieu-container').hide();
        } else {
            $('#global-so-phieu-container').show();

            if ($('#global-so-phieu-container').is(':empty') ||
                !$('#soPhieu').length ||
                selectedIdVaoVien !== currentPatientContext.idVaoVien) {
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

    $(document).on('click', '#btn_saveIndex', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        var $btn = $(this);
        setLoading($btn, true, "Đang lưu...");
        updateSoPhieuGlobalData();

        var idNguonBenh = window.soPhieuGlobalData.idNguonBenh;
        if (idNguonBenh === null || idNguonBenh === undefined || idNguonBenh === '' || isNaN(idNguonBenh)) {
            idNguonBenh = 1;
        }

        var data = {
            SoPhieu: $('#soPhieu').val(),
            IDNguonBenh: idNguonBenh,
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
            let saveSuccess = true;
            let saveMessage = "";

            if (!IDPhieuTTPT || IDPhieuTTPT === 0) {
                let res = await $.ajax({
                    url: '/thu_thuat_phau_thuat/create-phieu',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data)
                });
                if (res.success) {
                    window.IDPhieuTTPT = res.idPhieuTTPT;
                    saveMessage = "Tạo phiếu thành công";
                } else {
                    saveSuccess = false;
                    saveMessage = "Tạo phiếu thất bại";
                }
            } else {
                data.IDPhieuTTPT = IDPhieuTTPT;
                let res = await $.ajax({
                    url: '/thu_thuat_phau_thuat/update-phieu',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data)
                });
                saveMessage = "Cập nhật phiếu thành công";
            }

            //if (saveSuccess) {
            //    if (typeof handleSaveThongTin === 'function') await handleSaveThongTin(true); 
            //    if (typeof saveTrinhTu === 'function') await saveTrinhTu(true);
            //    if (typeof handleSaveEkip === 'function') await handleSaveEkip(true);

            //    toastr.success(saveMessage);
            //    reloadSoPhieuSection();
            //    updateDanhSachAfterSave();
            //} else {
            //    toastr.error(saveMessage);
            //}
            if (saveSuccess) {
                if (typeof handleSaveThongTin === 'function') await handleSaveThongTin(true);
                if (typeof saveTrinhTu === 'function') await saveTrinhTu(true);
                if (typeof handleSaveEkip === 'function') await handleSaveEkip(true);

                toastr.success(saveMessage);
                updateDanhSachAfterSave();

                // Chỉ reload lại thông tin phiếu nếu KHÔNG ở tab danh sách
                const activeTab = $('a[data-bs-toggle="tab"].active').attr("href");
                if (activeTab !== "#tabs-danhsach-7") {
                    reloadSoPhieuSection();
                }
            }
            else {
                toastr.error(saveMessage);
            }
        } catch (error) {
            console.error(error);
            toastr.error("Lỗi khi lưu dữ liệu");
        } finally {
            setLoading($btn, false);
        }
    });

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
        border-radius: 8px;
        border: 1px solid #dee2e6;
    }
`;
document.head.appendChild(style);

toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "timeOut": "2000"
};
