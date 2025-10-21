
// ==================== BIẾN GLOBAL PHÂN TRANG ====================
let currentPage = 1;
let pageSize = 20;
let totalRecords = 0;
let totalPages = 0;
let allData = []; // Lưu toàn bộ dữ liệu

function formatDateTime(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${dd}-${MM}-${yyyy} ${HH}:${mm}`;
}

function updateDateTime() {
    var now = new Date();
    var formatted = formatDateTime(now);
    $("#info-datetime", window.parent.document).text(formatted);
}

$(document).on("click", "#example tbody tr", function (e) {
    // Xóa class active trước đó
    $("#example tbody tr").removeClass("table-active");
    $(this).addClass("table-active");
    var noiThucHien = $(this).find("td:eq(9)").text().trim();

    const phongBuongSelect = document.querySelector(".tom-select-test")?.tomselect;
    if (phongBuongSelect) {
        const found = listDanToc.find(x =>
            x.ten.trim().toLowerCase() === noiThucHien.toLowerCase()
        );

        if (found) {
            phongBuongSelect.setValue(found.id, true);
        } else {
            phongBuongSelect.clear();
        }
    }

    var tenBN = $(this).find("td:eq(2)").text().trim();
    var namSinh = $(this).find("td:eq(3)").text().trim();
    var gioiTinh = $(this).find("td:eq(4)").text().trim();
    var bacSi = $(this).find("td:eq(10)").text().trim();
    var tendichvu = $(this).find("td:eq(7)").text().trim();

    selectedIdVaoVien = $(this).data("idvaovien");
    selectedIdChiDinhChiTiet = $(this).data("idchidinhct");
    window.IDPhieuTTPT = $(this).data("idphieu");
    maChanDoanVao_0301 = $(this).data("machandoanvao");
    tenChanDoanVao_0301 = $(this).data("tenchandoanvao");

    const btnXoa = document.getElementById("btnXoaPhieuTTPT");
    if (btnXoa) {
        btnXoa.disabled = !window.IDPhieuTTPT; 
        btnXoa.classList.toggle("btn-secondary", !window.IDPhieuTTPT);
        btnXoa.classList.toggle("btn-danger", !!window.IDPhieuTTPT);
    }

    window.MaKhoa = $(this).data("makhoa");
    window.yhct = $(this).data("yhct");
    window.IDKhoa = $(this).data("idkhoa");
    window.idPhongThucHien_0301 = $(this).data("idphongthuchien0301");
    window.tendichvu0301 = $(this).data("tendichvu0301");
    console.log("Ten dich vu =", window.tendichvu0301);
    $("#info-tenbn", window.parent.document).text(tenBN);
    $("#info-namsinh", window.parent.document).text(namSinh + " - " + gioiTinh);
    $("#info-bacsi", window.parent.document).text(bacSi);
    $("#info-tendichvu", window.parent.document).text(tendichvu);

    const activeTab = $('a[data-bs-toggle="tab"].active').attr("href");
    console.log("📑 Tab hiện tại khi chọn bệnh nhân:", activeTab);

    if (activeTab !== "#tabs-danhsach-7" && typeof loadGlobalSoPhieu === 'function') {
        loadGlobalSoPhieu(true);
    }

    if (e.detail === 2) {
        const thongTinTab = $('a[href="#tabs-thongtin-7"]');
        if (thongTinTab.length) {

            setTimeout(() => thongTinTab.tab('show'), 100);
            loadGlobalSoPhieu(true);
        } else {
            console.warn("⚠️ Không tìm thấy tab Thông tin (#tabs-thongtin-7)");
        }
    }
});


$(document).ready(function () {
    updateDateTime();
    setInterval(updateDateTime, 60000);
});

// ==================== Load dữ liệu cho TomSelect ====================
let listDanToc = [];
$.getJSON("dist/data/json/DM_PhongBuong.json", dataDanToc => {
    const idcnHienTai = _idcn;

    listDanToc = dataDanToc
        .filter(n => (n.active === true || n.active === 1) && n.idcn === idcnHienTai)
        .map(n => ({
            ...n,
            alias: n.viettat?.trim() !== "" ?
                n.viettat.toUpperCase() :
                n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
        }));

    configCb([{
        className: ".tom-select-test",
        placeholder: "-- Phòng khám --",
        dieuKien: function (response) { return response.filter(x => x.id); }
    }], listDanToc);
});

function configCb(configs, dataSource) {
    configs.forEach(cfg => {
        let result = cfg.dieuKien ? cfg.dieuKien(dataSource) : dataSource;
        new TomSelect(cfg.className, {
            options: result,
            valueField: "id",
            labelField: "ten",
            searchField: ["ten", "alias"],
            placeholder: cfg.placeholder,
            maxItems: 1,
            render: {
                option: (data, escape) => `<div style="display:flex; justify-content:space-between; width:100%;">
                        <span>${escape(data.ten)}</span>
                        <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.viettat || "")}</span>
                    </div>`,
                item: (data, escape) => `<div style="display:flex; justify-content:space-between; width:100%;">
                        <span>${escape(data.ten)}</span>
                        <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.viettat || "")}</span>
                    </div>`
            }
        });
    });
}

// ==================== Date Picker ====================
$(function () {
    $('#txtDateTime').datepicker({
        format: "dd-mm-yyyy",
        language: "vi",
        autoclose: true,
        todayHighlight: true,
        weekStart: 1,
        defaultViewDate: 'today'
        
        
    });
    $('#txtDateTime').datepicker('setDate', new Date());
    $('#txtDateTime').inputmask('99-99-9999', { placeholder: 'dd-mm-yyyy' });
});
function tinhSoPhut(batDau, ketThuc) {
    if (!batDau || !ketThuc) return "";

    const start = new Date(batDau);
    const end = new Date(ketThuc);

    if (isNaN(start) || isNaN(end)) return "";

    const diffMs = end - start;
    const diffMinutes = Math.floor(diffMs / 60000);

    return diffMinutes >= 0 ? diffMinutes + " phút" : "";
}

// ==================== PHÂN TRANG ====================
function renderTable(data, page = 1, size = 10) {
    const tbody = $("#tbodyData");
    tbody.empty();

    if (!data || data.length === 0) {
        tbody.append('<tr><td colspan="13" class="text-center">Không có dữ liệu</td></tr>');
        return;
    }

    const start = (page - 1) * size;
    const pageData = data.slice(start, start + size);

    pageData.forEach((item, index) => {

        const ngayGioEncoded = encodeURIComponent(item.ngayGioChiDinh || "");
        const maChanDoanEncoded = encodeURIComponent(item.maChanDoanVao || 'Z00');
        const tenChanDoanEncoded = encodeURIComponent(
            item.tenChanDoanVao ||
            'Khám tổng quát và kiểm tra sức khỏe cho những người không có điều gì than phiền về sức khỏe hoặc những người đã có chẩn đoán'
        );
        tbody.append(`
            <tr
            data-idvaovien="${item.idVaoVien || ''}" 
            data-yhct="${item.yHocCoTruyen}" 
            data-idkhoa="${item.idKhoa || 0}" 
            data-idchidinhct="${item.idChiDinhChiTiet || ''}" 
            data-idphieu="${item.idPhieuTTPT || 0}" 
            data-makhoa="${item.maKhoa || ''}" 
            data-ngaygiochidinh="${ngayGioEncoded}" 
            data-machandoanvao="${maChanDoanEncoded}" 
            data-tenchandoanvao="${tenChanDoanEncoded}" 
            data-idphongthuchien0301="${item.idPhongThucHien || 0}"
            data-tendichvu0301="${item.dichVuKyThuat || ''}
            
            ">
                <td class="text-center">${start + index + 1}</td>
                <td class="text-center">${item.maBenhNhan || ""}</td>
                <td>${item.tenBenhNhan || ""}</td>
                <td class="text-center">${item.namSinh || ""}</td>
                <td class="text-center">${item.gioiTinh || ""}</td>
                <td class="text-center">${item.khan ? 'Có' : 'Không'}</td>
                <td>${item.nhomDichVuKyThuat || ""}</td>
                <td class="text-ellipsis" title="${item.dichVuKyThuat || ""}">
                    ${item.dichVuKyThuat || ""}
                </td>
                <td class="text-center">  ${tinhSoPhut(item.batDauThuThuat, item.ketThucThuThuat)}</td>
                <td>${item.noiThucHien || ""}</td>
                <td>${item.bacSiChiDinh || ""}</td>
                <td>${item.noiChiDinh || ""}</td>
                
            </tr>
        `);
    });

    updatePaginationInfo(data.length, page, size);
    renderPagination(data.length, page, size);
}
//<td>${item.dichVuKyThuat || ""}</td>
function updatePaginationInfo(totalRecords, currentPage, pageSize) {
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);
    $("#pageInfo").text(`Hiển thị ${startRecord}-${endRecord} của ${totalRecords} bản ghi`);
}

function renderPagination(totalRecords, currentPage, pageSize) {
    totalPages = Math.ceil(totalRecords / pageSize);
    const pagination = $("#pagination");
    pagination.empty();

    const prevDisabled = currentPage === 1 ? "disabled" : "";
    pagination.append(`<li class="page-item ${prevDisabled}"><a class="page-link" href="#" data-page="${currentPage - 1}">‹</a></li>`);

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage ? "active" : "";
        pagination.append(`<li class="page-item ${active}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
    }

    const nextDisabled = currentPage === totalPages ? "disabled" : "";
    pagination.append(`<li class="page-item ${nextDisabled}"><a class="page-link" href="#" data-page="${currentPage + 1}">›</a></li>`);
}

// ==================== XỬ LÝ SỰ KIỆN PHÂN TRANG ====================
$(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const page = parseInt($(this).data("page"));
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable(allData, currentPage, pageSize);
        
    }
});

$(document).on("change", "#pageSizeSelect", function () {
    pageSize = parseInt($(this).val());
    currentPage = 1;
    renderTable(allData, currentPage, pageSize);
});

// ==================== TÌM KIẾM REAL-TIME (TÙY CHỌN) ====================
// Nếu muốn tìm kiếm real-time khi nhập
//$(document).on("input", ".txtds", function (e) {
//    // Debounce để tránh gọi API liên tục
//    clearTimeout(window.searchTimeout);
//    window.searchTimeout = setTimeout(function () {
//        $("#btnSearchNangCao").click();
//    }, 500);
//});



// ==================== LỌC DANH SÁCH (CẢ THƯỜNG VÀ NÂNG CAO) có real time ====================
function filterDanhSach(isAdvanced = false) {
    $('#loadingSpinner').show();
    $('.table-wrapper').css('opacity', '0.5');

    // 🏥 Lấy giá trị từ TomSelect
    const phongBuongSelect = document.querySelector(".tom-select-test")?.tomselect;
    let idPhongBuong = 0;

    if (phongBuongSelect) {
        idPhongBuong = phongBuongSelect.getValue();

        // Nếu TomSelect chưa có value (id), ta dựa theo tên hiển thị để tìm lại id
        if (!idPhongBuong || idPhongBuong === "0" || idPhongBuong === "") {
            const tenHienThi = phongBuongSelect.getItem()?.textContent?.trim()?.toLowerCase() || "";

            if (tenHienThi) {
                const found = listDanToc.find(x =>
                    x.ten.trim().toLowerCase() === tenHienThi &&
                    x.idcn === _idcn
                );
                if (found) {
                    idPhongBuong = found.id;
                    console.log("🔁 Đã tìm lại ID phòng từ tên:", tenHienThi, "→", idPhongBuong);
                } else {
                    console.warn("⚠️ Không tìm thấy phòng tương ứng:", tenHienThi);
                }
            }
        }
    }

    const filterParams = {
        IdChiNhanh: _idcn,
        Ngay: $("#txtDateTime").val().trim(),
        IdPhongBuong: idPhongBuong || 0,
        TrangThai: $("input[name='statusGroup']:checked").val() || 0
    };

    if (isAdvanced) {
        Object.assign(filterParams, {
            MaVaoVien: $("#txtMaVaoVienDS").val().trim(),
            MaBenhNhan: $("#txtMaBenhNhanDS").val().trim(),
            TenBenhNhan: $("#txtTenBnDS").val().trim(),
            CCCD: $("#txtCCCDDS").val().trim(),
            MaThe: $("#txtMaTheDS").val().trim(),
            SoDienThoai: $("#txtSDTDS").val().trim()
        });
    }

    $.post("/thu_thuat_phau_thuat/loc_danh_sach", filterParams, function (response) {
        if (response && response.success && Array.isArray(response.data?.data)) {
            allData = response.data.data;
        } else {
            allData = [];
        }
        currentPage = 1;
        renderTable(allData, currentPage, pageSize);
    }).fail(function () {
        allData = [];
        renderTable(allData, currentPage, pageSize);
    }).always(function () {
        $('#loadingSpinner').hide();
        $('.table-wrapper').css('opacity', '1');
    });
}

// ==================== GỌI KHI NHẤN NÚT ====================
$(document).on("click", "#btnLocDanhSachTTPT", function (e) {
    e.preventDefault();
    filterDanhSach(false);
});
$(document).on("click", "#btnSearchNangCao", function (e) {
    e.preventDefault();
    filterDanhSach(true);
});

// ==================== GỌI TỰ ĐỘNG KHI NGƯỜI DÙNG THAY ĐỔI ====================
// Khi chọn ngày
$(document).on("change", "#txtDateTime", function () {
    filterDanhSach(false);
});

// Khi chọn phòng (TomSelect)
$(document).on("change", ".tom-select-test", function () {
    filterDanhSach(false);
});

// Khi đổi radio trạng thái
$(document).on("change", "input[name='statusGroup']", function () {
    filterDanhSach(false);
});

//$(document).on("click", "#btnLocDanhSachTTPT, #btnSearchNangCao", function (e) {
//    e.preventDefault();
//    $('#loadingSpinner').show();
//    $('.table-wrapper').css('opacity', '0.5');
//    const isAdvancedSearch = $(this).attr('id') === 'btnSearchNangCao';

//    // Tham số lọc cơ bản
//    const filterParams = {
//        IdChiNhanh: _idcn,
//        Ngay: $("#txtDateTime").val().trim(),
//        IdPhongBuong: $(".tom-select-test").val() || 0,
//        TrangThai: $("input[name='statusGroup']:checked").val() || 0
//    };

//    // Nếu là tìm kiếm nâng cao, thêm các tham số bổ sung
//    if (isAdvancedSearch) {
//        Object.assign(filterParams, {
//            MaVaoVien: $("#txtMaVaoVienDS").val().trim(),
//            MaBenhNhan: $("#txtMaBenhNhanDS").val().trim(),
//            TenBenhNhan: $("#txtTenBnDS").val().trim(),
//            CCCD: $("#txtCCCDDS").val().trim(),
//            MaThe: $("#txtMaTheDS").val().trim(),
//            SoDienThoai: $("#txtSDTDS").val().trim()
//        });
//    }

//    $.post("/thu_thuat_phau_thuat/loc_danh_sach", filterParams, function (response) {
//        if (response && response.success && Array.isArray(response.data?.data)) {
//            allData = response.data.data;
//        } else {
//            allData = [];
//        }
//        currentPage = 1;
//        renderTable(allData, currentPage, pageSize);
//    }).fail(function () {
//        allData = [];
//        renderTable(allData, currentPage, pageSize);
//    }).always(function () {   // <- luôn chạy dù thành công hay thất bại
//        $('#loadingSpinner').hide();
//        $('.table-wrapper').css('opacity', '1');
//    });
//});













