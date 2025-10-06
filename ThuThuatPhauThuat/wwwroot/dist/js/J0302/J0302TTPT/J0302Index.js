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
function loadGlobalSoPhieu(forceReload = false) {
    if ($('#global-so-phieu-container').length === 0) {
        $('.tab-content').before('<div id="global-so-phieu-container"></div>');
    } else {
        $('#global-so-phieu-container').show();
    }

    // 🔥 QUAN TRỌNG: Nếu đã có dữ liệu global và không bắt buộc reload thì KHÔNG load từ server
    if (!forceReload && window.soPhieuGlobalData.soPhieu && $('#global-so-phieu-container').html().trim() !== '') {
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
            khoiTaoJSChoTab(0);
            attachSoPhieuChangeEvents();
            setTimeout(() => {
                applySoPhieuGlobalData();
            }, 100);
        })
        .fail(function () {
            console.warn("⚠️ Không thể load số phiếu");
        });
}


//function loadGlobalSoPhieu(forceReload = false) {
//    if ($('#global-so-phieu-container').length === 0) {
//        $('.tab-content').before('<div id="global-so-phieu-container"></div>');
//    } else {
//        $('#global-so-phieu-container').show();
//    }

//    // 🔥 QUAN TRỌNG: Chỉ load từ server khi:
//    // 1. Force reload = true HOẶC
//    // 2. Chưa có dữ liệu global HOẶC  
//    // 3. Bệnh nhân thay đổi HOẶC
//    // 4. Container trống VÀ chưa có global data
//    const shouldLoadFromServer = forceReload ||
//        !window.soPhieuGlobalData.soPhieu ||
//        selectedIdVaoVien !== currentPatientContext.idVaoVien ||
//        ($('#global-so-phieu-container').is(':empty') && !window.soPhieuGlobalData.soPhieu);

//    if (shouldLoadFromServer) {
//        console.log("🔄 Load số phiếu từ server");
//        // Load nội dung số phiếu từ server
//        $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
//            tabIndex: 0,
//            idVaoVien: selectedIdVaoVien,
//            idcn: window._idcn,
//            idChiDinhChiTiet: selectedIdChiDinhChiTiet
//        })
//            .done(function (html) {
//                $('#global-so-phieu-container').html(html);
//                khoiTaoJSChoTab(0);
//                attachSoPhieuChangeEvents();

//                // 🔥 CẬP NHẬT GLOBAL STATE TỪ DỮ LIỆU SERVER (chỉ khi force reload hoặc chưa có data)
//                if (forceReload || !window.soPhieuGlobalData.soPhieu) {
//                    setTimeout(() => {
//                        updateSoPhieuGlobalDataFromServer();
//                    }, 100);
//                } else {
//                    // Nếu đã có global data, áp dụng ngược lại form
//                    setTimeout(() => {
//                        applySoPhieuGlobalData();
//                    }, 100);
//                }
//            })
//            .fail(function () {
//                console.warn("⚠️ Không thể load số phiếu");
//            });
//    } else {
//        console.log("📦 Dùng dữ liệu global hiện có");
//        // Nếu container trống nhưng có global data → tạo form từ global data
//        if ($('#global-so-phieu-container').is(':empty') && window.soPhieuGlobalData.soPhieu) {
//            createSoPhieuFormFromGlobalData();
//        } else {
//            // Chỉ cần khởi tạo lại JS và áp dụng dữ liệu global
//            khoiTaoJSChoTab(0);
//            attachSoPhieuChangeEvents();
//            applySoPhieuGlobalData();
//        }
//    }
//}
//// 🔄 CẬP NHẬT GLOBAL STATE TỪ SERVER (sau khi load từ DB)
//function updateSoPhieuGlobalDataFromServer() {
//    window.soPhieuGlobalData = {
//        soPhieu: $('#soPhieu').val() || '',
//        idNguonBenh: getSelectedNguonBenh(),
//        batDauThuThuat: $('.txtDateTimeBatDauThuThuat-0').val() || '',
//        ketThucThuThuat: $('.txtDateTimeKetThucThuThuat-0').val() || '',
//        thoiGianKhoa: $('.txtDateTimeThoiGianKhoa-0').val() || '',
//        nguoiKhoa: $('#nguoiKhoa').val() || ''
//    };
//    console.log("📦 Updated global data from server:", window.soPhieuGlobalData);
//}
//// 🔄 TẠO FORM SỐ PHIẾU TỪ GLOBAL DATA (khi container trống)
//function createSoPhieuFormFromGlobalData() {
//    console.log("🔄 Tạo form số phiếu từ global data");

//    const data = window.soPhieuGlobalData;

//    // Tạo HTML form từ global data
//    const html = `
//        <div class="p-2 bg-azure-lt rounded-2">
//            <div class="row mt-1">
//                <!-- Số phiếu -->
//                <div class="col-12 col-md-3">
//                    <div class="d-flex align-items-center mb-2 mb-md-0">
//                        <label class="form-label fw-bold me-2" style="min-width: 100px;">Số phiếu:</label>
//                        <input class="form-control form-control-md" id="soPhieu" value="${data.soPhieu || ''}" />
//                    </div>
//                </div>

//                <!-- Nhóm máu -->
//                <div class="col-4 col-md-1">
//                    <div class="d-flex align-items-center mb-2 mb-md-0">
//                        <label class="form-label fw-bold me-2" style="min-width: 60px;">Nhóm máu:</label>
//                        <span class="form-label text-dark">${data.nhomMau || ''}</span>
//                    </div>
//                </div>

//                <!-- Bắt đầu thủ thuật -->
//                <div class="col-12 col-md-4">
//                    <div class="d-flex align-items-center mb-2 mb-md-0">
//                        <label class="form-label fw-bold me-2" style="min-width: 140px;">Bắt đầu thủ thuật:</label>
//                        <div class="input-icon w-100">
//                            <input type="text"
//                                   class="form-control form-control-md txtDateTimeBatDauThuThuat-0 text-dark"
//                                   value="${data.batDauThuThuat || ''}"
//                                   autocomplete="off">
//                            <span class="input-icon-addon">
//                                <i class="ti ti-calendar-event"></i>
//                            </span>
//                        </div>
//                    </div>
//                </div>

//                <!-- Thời gian khóa -->
//                <div class="col-12 col-md-4">
//                    <div class="d-flex align-items-center mb-2 mb-md-0">
//                        <label class="form-label fw-bold me-2" style="min-width: 140px;">Thời gian khoá</label>
//                        <div class="input-icon w-100">
//                            <input type="text"
//                                   class="form-control form-control-md txtDateTimeThoiGianKhoa-0 text-dark"
//                                   value="${data.thoiGianKhoa || ''}"
//                                   autocomplete="off">
//                            <span class="input-icon-addon">
//                                <i class="ti ti-calendar-event"></i>
//                            </span>
//                        </div>
//                    </div>
//                </div>
//            </div>

//            <div class="row mt-1">
//                <!-- Nguồn bệnh -->
//                <div class="col-12 col-md-3">
//                    <div class="d-flex align-items-center mb-2 mb-md-0">
//                        <label class="form-label fw-bold me-2" style="min-width: 100px;">Nguồn bệnh:</label>
//                        <select autocomplete="off"
//                                class="tom-select thuThuat__nguonBenh-tom-select thuThuat__nguonBenh-tom-select-0 form-select"
//                                id="cbNguonBenh_0"></select>
//                    </div>
//                </div>

//                <!-- Yếu tố Rh -->
//                <div class="col-4 col-md-1">
//                    <div class="d-flex align-items-center mb-2 mb-md-0">
//                        <label class="form-label fw-bold me-2" style="min-width: 72px;">Yếu tố Rh:</label>
//                        <span class="form-label text-dark">${data.yeuToRh || ''}</span>
//                    </div>
//                </div>

//                <!-- Kết thúc thủ thuật -->
//                <div class="col-12 col-md-4">
//                    <div class="d-flex align-items-center mb-2 mb-md-0">
//                        <label class="form-label fw-bold me-2" style="min-width: 140px;">Kết thúc thủ thuật:</label>
//                        <div class="input-icon w-100">
//                            <input type="text"
//                                   class="form-control form-control-md txtDateTimeKetThucThuThuat-0 text-dark"
//                                   value="${data.ketThucThuThuat || ''}"
//                                   autocomplete="off">
//                            <span class="input-icon-addon">
//                                <i class="ti ti-calendar-event"></i>
//                            </span>
//                        </div>
//                    </div>
//                </div>

//                <div class="col-12 col-md-4">
//                    <div class="d-flex align-items-center mb-2 mb-md-0">
//                        <label class="form-label fw-bold me-2" style="min-width: 140px;">Người khóa:</label>
//                        <input type="text" id="nguoiKhoa" class="form-control form-control-md text-dark" value="${data.nguoiKhoa || ''}" autocomplete="off" />
//                    </div>
//                </div>
//            </div>
//        </div>
//    `;

//    $('#global-so-phieu-container').html(html);

//    // Khởi tạo JS
//    khoiTaoJSChoTab(0);
//    attachSoPhieuChangeEvents();

//    // Áp dụng giá trị nguồn bệnh
//    if (data.idNguonBenh) {
//        setTimeout(() => {
//            const selector = '.thuThuat__nguonBenh-tom-select-0';
//            const tomSelectInstance = document.querySelector(selector)?.tomselect;
//            if (tomSelectInstance) {
//                tomSelectInstance.setValue(data.idNguonBenh, true);
//            }
//        }, 300);
//    }
//}
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
    //console.log("📦 Updated global data:", window.soPhieuGlobalData);
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
        $('.tab-content').before('<div id="global-so-phieu-container" style="display: none;"></div>');
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
                //console.log("🔄 Load số phiếu vì container trống hoặc bệnh nhân thay đổi");
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

        // 🔄 CẬP NHẬT DỮ LIỆU GLOBAL TRƯỚC KHI LƯU
        updateSoPhieuGlobalData();

        // ⚙️ Xử lý IDNguonBenh (nếu null, undefined, hoặc rỗng => mặc định = 1)
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




/* 

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

function loadGlobalSoPhieu(forceReload = false) {
    if ($('#global-so-phieu-container').length === 0) {
        $('.tab-content').before('<div id="global-so-phieu-container"></div>');
    } else {
        $('#global-so-phieu-container').show();
    }

    //// 🔥 QUAN TRỌNG: Nếu đã có dữ liệu global và không bắt buộc reload thì KHÔNG load từ server
    //if (!forceReload && window.soPhieuGlobalData.soPhieu && $('#global-so-phieu-container').html().trim() !== '') {
    //    khoiTaoJSChoTab(0);
    //    attachSoPhieuChangeEvents();
    //    return;
    //}
    if (!forceReload && $('#global-so-phieu-container').html().trim() !== '') {
        // Dù phiếu đã có, vẫn luôn áp lại dữ liệu chờ trong global
        khoiTaoJSChoTab(0);
        attachSoPhieuChangeEvents();
        setTimeout(() => applySoPhieuGlobalData(), 100);
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
            khoiTaoJSChoTab(0);
            attachSoPhieuChangeEvents();
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
    window.soPhieuGlobalData.isDirty = true;

    //console.log("📦 Updated global data:", window.soPhieuGlobalData);
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
        $('.tab-content').before('<div id="global-so-phieu-container" style="display: none;"></div>');
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
                //console.log("🔄 Load số phiếu vì container trống hoặc bệnh nhân thay đổi");
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

        // 🔄 CẬP NHẬT DỮ LIỆU GLOBAL TRƯỚC KHI LƯU
        updateSoPhieuGlobalData();

        // ⚙️ Xử lý IDNguonBenh (nếu null, undefined, hoặc rỗng => mặc định = 1)
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
                window.soPhieuGlobalData.isDirty = false;

                updateDanhSachAfterSave();
            }

            // Gọi các hàm save khác
            if (typeof handleSaveThongTin === 'function') handleSaveThongTin();
            if (typeof saveTrinhTu === 'function') saveTrinhTu();
            if (typeof handleSaveEkip === 'function') handleSaveEkip();

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

#global - so - phieu - container {
    background: #f8f9fa;
    border - radius: 8px;
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


window.addEventListener("beforeunload", function (e) {
    if (window.soPhieuGlobalData?.isDirty) {
        e.preventDefault();
        e.returnValue = "Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời trang?";
    }
});

*/

