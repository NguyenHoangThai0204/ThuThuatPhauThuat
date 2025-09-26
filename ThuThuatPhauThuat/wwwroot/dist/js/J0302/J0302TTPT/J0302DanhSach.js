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

    listDanToc = dataDanToc
        .filter(n => n.active === true || n.active === 1) // chỉ lấy active
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
                return response.filter(x => x.ma); // lọc điều kiện tuỳ ý
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
            valueField: "ma",
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
        todayHighlight: true
    });

    $('#txtDateTime').inputmask('99-99-9999', { placeholder: 'dd-mm-yyyy' });
});


//document.addEventListener("DOMContentLoaded", function () {
//    // Dữ liệu mẫu
//    const data = [
//        {
//            stt: 1,
//            maBN: "BN001",
//            tenBN: "Nguyễn Văn A",
//            namSinh: 1985,
//            gioiTinh: "Nam",
//            khan: "Có",
//            nhomDV: "Chẩn đoán hình ảnh",
//            tenDV: "X-quang ngực",
//            thoiGian: "26-09-2025 08:30",
//            noiTH: "Khoa Chẩn đoán hình ảnh",
//            bacSi: "BS. Trần Văn B",
//            noiCD: "Phòng Khám Tổng Quát"
//        },
//        {
//            stt: 2,
//            maBN: "BN002",
//            tenBN: "Trần Thị B",
//            namSinh: 1992,
//            gioiTinh: "Nữ",
//            khan: "Không",
//            nhomDV: "Xét nghiệm",
//            tenDV: "Công thức máu",
//            thoiGian: "26-09-2025 09:15",
//            noiTH: "Khoa Xét nghiệm",
//            bacSi: "BS. Lê Văn C",
//            noiCD: "Khoa Nội Tổng Hợp"
//        },
//        {
//            stt: 3,
//            maBN: "BN003",
//            tenBN: "Phạm Văn C",
//            namSinh: 1978,
//            gioiTinh: "Nam",
//            khan: "Có",
//            nhomDV: "Thủ thuật",
//            tenDV: "Nội soi dạ dày",
//            thoiGian: "26-09-2025 10:00",
//            noiTH: "Khoa Tiêu Hóa",
//            bacSi: "BS. Nguyễn Thị D",
//            noiCD: "Phòng Khám Nội Soi"
//        }
//    ];

//    console.log(data)
//    const tbody = document.getElementById("tbodyData");
//    tbody.innerHTML = ""; // clear trước

//    data.forEach(item => {
//        const tr = document.createElement("tr");
//        tr.innerHTML = `
//            <td class="text-center">${item.stt}</td>
//            <td class="text-center">${item.maBN}</td>
//            <td>${item.tenBN}</td>
//            <td class="text-center">${item.namSinh}</td>
//            <td class="text-center">${item.gioiTinh}</td>
//            <td class="text-center">${item.khan}</td>
//            <td>${item.nhomDV}</td>
//            <td>${item.tenDV}</td>
//            <td class="text-center">${item.thoiGian}</td>
//            <td>${item.noiTH}</td>
//            <td>${item.bacSi}</td>
//            <td>${item.noiCD}</td>
//        `;
//        tbody.appendChild(tr);
//    });

//    // Nếu bạn muốn dùng DataTables
//    //$('#example').DataTable();
//});
