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
$(document).ready(function () {
    $('#example').DataTable({
        scrollX: true,
        paging: false,
        searching: false,
        info: false
    });
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