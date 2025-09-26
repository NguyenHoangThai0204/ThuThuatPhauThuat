
//// ==================== BIẾN GLOBAL PHÂN TRANG ====================
//let currentPage = 1;
//let pageSize = 10;
//let totalRecords = 0;
//let totalPages = 0;
//let isInitialLoad = true;


//function formatDateTime(date) {
//    const dd = String(date.getDate()).padStart(2, '0');
//    const MM = String(date.getMonth() + 1).padStart(2, '0');
//    const yyyy = date.getFullYear();
//    const HH = String(date.getHours()).padStart(2, '0');
//    const mm = String(date.getMinutes()).padStart(2, '0');
//    return `${dd}-${MM}-${yyyy} ${HH}:${mm}`;
//}

//function updateDateTime() {
//    var now = new Date();
//    var formatted = formatDateTime(now);
//    $("#info-datetime", window.parent.document).text(formatted);
//}

//$(document).on("click", "#example tbody tr", function () {
//    var tenBN = $(this).find("td:eq(2)").text().trim();
//    var namSinh = $(this).find("td:eq(3)").text().trim();
//    var gioiTinh = $(this).find("td:eq(4)").text().trim();

//    var bacSi = $(this).find("td:eq(10)").text().trim();

//    $("#info-tenbn", window.parent.document).text(tenBN);
//    $("#info-namsinh", window.parent.document).text(namSinh + " - " + gioiTinh);
//    $("#info-bacsi", window.parent.document).text(bacSi);
//    updateDateTime();

//    $("#example tbody tr").removeClass("table-active");
//    $(this).addClass("table-active");
//});

//$(document).ready(function () {
//    updateDateTime();
//    setInterval(updateDateTime, 60000);
//});

//let listDanToc = [];

//// đọc JSON bằng jQuery
//$.getJSON("dist/data/json/DM_PhongBuong.json", dataDanToc => {

//    listDanToc = dataDanToc
//        .filter(n => n.active === true || n.active === 1) // chỉ lấy active
//        .map(n => ({
//            ...n,
//            alias: n.viettat?.trim() !== ""
//                ? n.viettat.toUpperCase()
//                : n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
//        }));


//    // config cho TomSelect
//    const configs = [
//        {
//            className: ".tom-select-test",
//            placeholder: "-- Phòng khám --",
//            dieuKien: function (response) {
//                return response.filter(x => x.ma); // lọc điều kiện tuỳ ý
//            }
//        }
//    ];

//    configCb(configs, listDanToc);
//});

//function configCb(configs, dataSource) {
//    configs.forEach(cfg => {
//        let result = cfg.dieuKien ? cfg.dieuKien(dataSource) : dataSource;


//        new TomSelect(cfg.className, {
//            options: result,
//            valueField: "ma",
//            labelField: "ten",
//            searchField: ["ten", "alias"],
//            placeholder: cfg.placeholder,
//            maxItems: 1,
//            render: {
//                option: function (data, escape) {
//                    return `
//                             <div style="display:flex; justify-content:space-between; width:100%;">
//                                 <span>${escape(data.ten)}</span>
//                                 <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.viettat || "")}</span>
//                             </div>`;
//                },
//                item: function (data, escape) {
//                    return `
//                             <div style="display:flex; justify-content:space-between; width:100%;">
//                                 <span>${escape(data.ten)}</span>
//                                 <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.viettat || "")}</span>
//                             </div>`;
//                }
//            }
//        });
//    });
//}
//$(function () {
//    $('#txtDateTime').datepicker({
//        format: "dd-mm-yyyy",
//        language: "vi",
//        autoclose: true,
//        todayHighlight: true,
//        weekStart: 1
//    });

//    $('#txtDateTime').inputmask('99-99-9999', { placeholder: 'dd-mm-yyyy' });
//});

//$(document).ready(function () {
//    console.log("Script J0302DanhSach.js chạy rồi!");

//    const data = [
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 2, maBN: "BN002", tenBN: "Trần Thị B", namSinh: 1990, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Máu", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS B", noiCD: "PK Ngoại" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 2, maBN: "BN002", tenBN: "Trần Thị B", namSinh: 1990, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Máu", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS B", noiCD: "PK Ngoại" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 2, maBN: "BN002", tenBN: "Trần Thị B", namSinh: 1990, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Máu", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS B", noiCD: "PK Ngoại" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 2, maBN: "BN002", tenBN: "Trần Thị B", namSinh: 1990, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Máu", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS B", noiCD: "PK Ngoại" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 2, maBN: "BN002", tenBN: "Trần Thị B", namSinh: 1990, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Máu", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS B", noiCD: "PK Ngoại" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 2, maBN: "BN002", tenBN: "Trần Thị B", namSinh: 1990, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Máu", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS B", noiCD: "PK Ngoại" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
//        { stt: 2, maBN: "BN002", tenBN: "Trần Thị B", namSinh: 1990, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Máu", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS B", noiCD: "PK Ngoại" },
//        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang Nguyễn Văn A Nguyễn Văn A", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" }];

//    const tbody = $("#tbodyData");
//    tbody.empty();
//    data.forEach(item => {
//        tbody.append(`
//            <tr>
//                <td>${item.stt}</td>
//                <td>${item.maBN}</td>
//                <td>${item.tenBN}</td>
//                <td>${item.namSinh}</td>
//                <td>${item.gioiTinh}</td>
//                <td>${item.khan}</td>
//                <td>${item.nhomDV}</td>
//                <td>${item.tenDV}</td>
//                <td>${item.thoiGian}</td>
//                <td>${item.noiTH}</td>
//                <td>${item.bacSi}</td>
//                <td>${item.noiCD}</td>
//            </tr>
//        `);
//    });
//});




// ==================== BIẾN GLOBAL PHÂN TRANG ====================
let currentPage = 1;
let pageSize = 10;
let totalRecords = 0;
let totalPages = 0;
let isInitialLoad = true;
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

$(document).on("click", "#example tbody tr", function () {
    var tenBN = $(this).find("td:eq(2)").text().trim();
    var namSinh = $(this).find("td:eq(3)").text().trim();
    var gioiTinh = $(this).find("td:eq(4)").text().trim();
    var bacSi = $(this).find("td:eq(10)").text().trim();

    $("#info-tenbn", window.parent.document).text(tenBN);
    $("#info-namsinh", window.parent.document).text(namSinh + " - " + gioiTinh);
    $("#info-bacsi", window.parent.document).text(bacSi);
    updateDateTime();

    $("#example tbody tr").removeClass("table-active");
    $(this).addClass("table-active");
});

$(document).ready(function () {
    updateDateTime();
    setInterval(updateDateTime, 60000);
});

let listDanToc = [];

// đọc JSON bằng jQuery
$.getJSON("dist/data/json/DM_PhongBuong.json", dataDanToc => {
    const idcnHienTai = _idcn; // gán giá trị idcn cần lọc

    listDanToc = dataDanToc
        .filter(n =>
            (n.active === true || n.active === 1) && n.idcn === idcnHienTai
        )
        .map(n => ({
            ...n,
            alias: n.viettat?.trim() !== ""
                ? n.viettat.toUpperCase()
                : n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
        }));

    // config cho TomSelect
    const configs = [
        {
            className: ".tom-select-test",
            placeholder: "-- Phòng khám --",
            dieuKien: function (response) {
                return response.filter(x => x.id); // lọc điều kiện tuỳ ý
            }
        }
    ];

    configCb(configs, listDanToc);
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
                option: function (data, escape) {
                    return `
                             <div style="display:flex; justify-content:space-between; width:100%;">
                                 <span>${escape(data.ten)}</span>
                                 <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.viettat || "")}</span>
                             </div>`;
                },
                item: function (data, escape) {
                    return `
                             <div style="display:flex; justify-content:space-between; width:100%;">
                                 <span>${escape(data.ten)}</span>
                                 <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.viettat || "")}</span>
                             </div>`;
                }
            }
        });
    });
}

$(function () {
    $('#txtDateTime').datepicker({
        format: "dd-mm-yyyy",
        language: "vi",
        autoclose: true,
        todayHighlight: true,
        weekStart: 1
    });

    $('#txtDateTime').inputmask('99-99-9999', { placeholder: 'dd-mm-yyyy' });
});

// ==================== HÀM PHÂN TRANG ====================
function renderTable(data, page = 1, pageSize = 10) {
    const tbody = $("#tbodyData");
    tbody.empty();

    // Tính toán dữ liệu cho trang hiện tại
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = data.slice(startIndex, endIndex);

    // Render dữ liệu
    pageData.forEach((item, index) => {
        const stt = startIndex + index + 1;
        tbody.append(`
            <tr>
                <td>${stt}</td>
                <td>${item.maBN}</td>
                <td>${item.tenBN}</td>
                <td>${item.namSinh}</td>
                <td>${item.gioiTinh}</td>
                <td>${item.khan}</td>
                <td>${item.nhomDV}</td>
                <td>${item.tenDV}</td>
                <td>${item.thoiGian}</td>
                <td>${item.noiTH}</td>
                <td>${item.bacSi}</td>
                <td>${item.noiCD}</td>
            </tr>
        `);
    });

    // Cập nhật thông tin phân trang
    updatePaginationInfo(data.length, page, pageSize);

    // Render phân trang
    renderPagination(data.length, page, pageSize);
}

function updatePaginationInfo(totalRecords, currentPage, pageSize) {
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);
    $("#pageInfo").text(`Hiển thị ${startRecord}-${endRecord} của ${totalRecords} bản ghi`);
}

function renderPagination(totalRecords, currentPage, pageSize) {
    const totalPages = Math.ceil(totalRecords / pageSize);
    const pagination = $("#pagination");
    pagination.empty();

    // Nút Previous
    const prevDisabled = currentPage === 1 ? "disabled" : "";
    pagination.append(`
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">‹</a>
        </li>
    `);

    // Các nút trang
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Điều chỉnh nếu vượt quá giới hạn
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const active = i === currentPage ? "active" : "";
        pagination.append(`
            <li class="page-item ${active}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `);
    }

    // Nút Next
    const nextDisabled = currentPage === totalPages ? "disabled" : "";
    pagination.append(`
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">›</a>
        </li>
    `);
}

// ==================== SỰ KIỆN PHÂN TRANG ====================
$(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const page = parseInt($(this).data("page"));
    if (!isNaN(page) && page >= 1 && page <= Math.ceil(allData.length / pageSize)) {
        currentPage = page;
        renderTable(allData, currentPage, pageSize);
    }
});

// Sự kiện thay đổi số bản ghi mỗi trang
$(document).on("change", "#pageSizeSelect", function () {
    pageSize = parseInt($(this).val());
    currentPage = 1; // Reset về trang đầu tiên
    renderTable(allData, currentPage, pageSize);
});



$(document).on("click", "#btnLocDanhSachTTPT", function (e) {
    e.preventDefault();

    // Lấy ngày
    const ngay = $("#txtDateTime").val().trim();

    // Lấy phòng khám (TomSelect lưu value trong input)
    const phongKham = $(".tom-select-test").val();

    // Lấy radio được chọn
    const status = $("input[name='statusGroup']:checked").val();

    // Gom thành object
    const filterParams = {
        ngay: ngay,
        idPhongBuong: phongKham,
        status: status
    };

    console.log("Filter:", filterParams);

    // 👉 ở đây bạn có thể gọi AJAX để gửi đi
    $.post("/thu_thuat_phau_thuat/loc_danh_sach", filterParams, function (res) {
         allData = res;  // giả sử backend trả về data
         currentPage = 1;
         renderTable(allData, currentPage, pageSize);
     });

});




// ==================== DỮ LIỆU MẪU VÀ KHỞI TẠO ====================
$(document).ready(function () {
    console.log("Script J0302DanhSach.js chạy rồi!");

    // Dữ liệu mẫu
    allData = [
        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
        { stt: 2, maBN: "BN002", tenBN: "Trần Thị B", namSinh: 1990, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Máu", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS B", noiCD: "PK Ngoại" },
        { stt: 3, maBN: "BN003", tenBN: "Lê Văn C", namSinh: 1978, gioiTinh: "Nam", khan: "Có", nhomDV: "PT", tenDV: "Phẫu thuật", thoiGian: "26-09-2025", noiTH: "Khoa PT", bacSi: "BS C", noiCD: "PK Ngoại" },
        { stt: 4, maBN: "BN004", tenBN: "Phạm Thị D", namSinh: 1995, gioiTinh: "Nữ", khan: "Không", nhomDV: "CDHA", tenDV: "CT Scan", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS D", noiCD: "PK Nội" },
        { stt: 5, maBN: "BN005", tenBN: "Hoàng Văn E", namSinh: 1982, gioiTinh: "Nam", khan: "Có", nhomDV: "XN", tenDV: "Sinh hóa", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS E", noiCD: "PK Nội" },
        { stt: 6, maBN: "BN006", tenBN: "Vũ Thị F", namSinh: 1992, gioiTinh: "Nữ", khan: "Không", nhomDV: "PT", tenDV: "Nội soi", thoiGian: "26-09-2025", noiTH: "Khoa PT", bacSi: "BS F", noiCD: "PK Ngoại" },
        { stt: 7, maBN: "BN007", tenBN: "Đặng Văn G", namSinh: 1975, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "MRI", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS G", noiCD: "PK Nội" },
        { stt: 8, maBN: "BN008", tenBN: "Bùi Thị H", namSinh: 1988, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Huyết học", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS H", noiCD: "PK Ngoại" },
        { stt: 9, maBN: "BN009", tenBN: "Ngô Văn I", namSinh: 1993, gioiTinh: "Nam", khan: "Có", nhomDV: "PT", tenDV: "Tiểu phẫu", thoiGian: "26-09-2025", noiTH: "Khoa PT", bacSi: "BS I", noiCD: "PK Nội" },
        { stt: 10, maBN: "BN010", tenBN: "Đỗ Thị K", namSinh: 1980, gioiTinh: "Nữ", khan: "Không", nhomDV: "CDHA", tenDV: "Siêu âm", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS K", noiCD: "PK Ngoại" },
        { stt: 11, maBN: "BN011", tenBN: "Trịnh Văn L", namSinh: 1970, gioiTinh: "Nam", khan: "Có", nhomDV: "XN", tenDV: "Vi sinh", thoiGian: "27-09-2025", noiTH: "Khoa XN", bacSi: "BS L", noiCD: "PK Nội" },
        { stt: 12, maBN: "BN012", tenBN: "Lương Thị M", namSinh: 1998, gioiTinh: "Nữ", khan: "Không", nhomDV: "PT", tenDV: "Gây mê", thoiGian: "27-09-2025", noiTH: "Khoa PT", bacSi: "BS M", noiCD: "PK Ngoại" },
        { stt: 1, maBN: "BN001", tenBN: "Nguyễn Văn A", namSinh: 1985, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "X-quang", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS A", noiCD: "PK Nội" },
        { stt: 2, maBN: "BN002", tenBN: "Trần Thị B", namSinh: 1990, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Máu", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS B", noiCD: "PK Ngoại" },
        { stt: 3, maBN: "BN003", tenBN: "Lê Văn C", namSinh: 1978, gioiTinh: "Nam", khan: "Có", nhomDV: "PT", tenDV: "Phẫu thuật", thoiGian: "26-09-2025", noiTH: "Khoa PT", bacSi: "BS C", noiCD: "PK Ngoại" },
        { stt: 4, maBN: "BN004", tenBN: "Phạm Thị D", namSinh: 1995, gioiTinh: "Nữ", khan: "Không", nhomDV: "CDHA", tenDV: "CT Scan", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS D", noiCD: "PK Nội" },
        { stt: 5, maBN: "BN005", tenBN: "Hoàng Văn E", namSinh: 1982, gioiTinh: "Nam", khan: "Có", nhomDV: "XN", tenDV: "Sinh hóa", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS E", noiCD: "PK Nội" },
        { stt: 6, maBN: "BN006", tenBN: "Vũ Thị F", namSinh: 1992, gioiTinh: "Nữ", khan: "Không", nhomDV: "PT", tenDV: "Nội soi", thoiGian: "26-09-2025", noiTH: "Khoa PT", bacSi: "BS F", noiCD: "PK Ngoại" },
        { stt: 7, maBN: "BN007", tenBN: "Đặng Văn G", namSinh: 1975, gioiTinh: "Nam", khan: "Có", nhomDV: "CDHA", tenDV: "MRI", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS G", noiCD: "PK Nội" },
        { stt: 8, maBN: "BN008", tenBN: "Bùi Thị H", namSinh: 1988, gioiTinh: "Nữ", khan: "Không", nhomDV: "XN", tenDV: "Huyết học", thoiGian: "26-09-2025", noiTH: "Khoa XN", bacSi: "BS H", noiCD: "PK Ngoại" },
        { stt: 9, maBN: "BN009", tenBN: "Ngô Văn I", namSinh: 1993, gioiTinh: "Nam", khan: "Có", nhomDV: "PT", tenDV: "Tiểu phẫu", thoiGian: "26-09-2025", noiTH: "Khoa PT", bacSi: "BS I", noiCD: "PK Nội" },
        { stt: 10, maBN: "BN010", tenBN: "Đỗ Thị K", namSinh: 1980, gioiTinh: "Nữ", khan: "Không", nhomDV: "CDHA", tenDV: "Siêu âm", thoiGian: "26-09-2025", noiTH: "Khoa CĐHA", bacSi: "BS K", noiCD: "PK Ngoại" },
        { stt: 11, maBN: "BN011", tenBN: "Trịnh Văn L", namSinh: 1970, gioiTinh: "Nam", khan: "Có", nhomDV: "XN", tenDV: "Vi sinh", thoiGian: "27-09-2025", noiTH: "Khoa XN", bacSi: "BS L", noiCD: "PK Nội" },
        { stt: 12, maBN: "BN012", tenBN: "Lương Thị M", namSinh: 1998, gioiTinh: "Nữ", khan: "Không", nhomDV: "PT", tenDV: "Gây mê", thoiGian: "27-09-2025", noiTH: "Khoa PT", bacSi: "BS M", noiCD: "PK Ngoại" }
    ];

    // Khởi tạo bảng với phân trang
    renderTable(allData, currentPage, pageSize);

    // Sự kiện tìm kiếm nâng cao
    $("#btnSearchNangCao").on("click", function () {
        // Lọc dữ liệu dựa trên các điều kiện tìm kiếm
        const filteredData = filterData(allData);
        currentPage = 1;
        renderTable(filteredData, currentPage, pageSize);
    });
});

// Hàm lọc dữ liệu (cần triển khai logic lọc thực tế)
function filterData(data) {
    // Lấy giá trị từ các ô tìm kiếm
    const maVaoVien = $("#txtMaVaoVienDS").val().toLowerCase();
    const maBenhNhan = $("#txtMaBenhNhanDS").val().toLowerCase();
    const tenBN = $("#txtTenBnDS").val().toLowerCase();
    const cccd = $("#txtCCCDDS").val().toLowerCase();
    const maThe = $("#txtMaTheDS").val().toLowerCase();
    const sdt = $("#txtSDTDS").val().toLowerCase();

    // Lọc dữ liệu (ví dụ đơn giản)
    return data.filter(item => {
        const matchMaBN = !maBenhNhan || item.maBN.toLowerCase().includes(maBenhNhan);
        const matchTenBN = !tenBN || item.tenBN.toLowerCase().includes(tenBN);

        return matchMaBN && matchTenBN;
        // Thêm các điều kiện lọc khác tùy theo nhu cầu
    });
}
