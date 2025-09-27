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


const sampleDataThongTin = {
    phanLoai: [
        { ma: "PL01", ten: "Phẫu thuật", alias: "PT" },
        { ma: "PL02", ten: "Thủ thuật", alias: "TT" },
        { ma: "PL03", ten: "Chẩn đoán hình ảnh", alias: "CDHA" }
    ],
    thietBi: [
        { ma: "TB01", ten: "Máy nội soi", alias: "MNS" },
        { ma: "TB02", ten: "Máy siêu âm", alias: "MSA" },
        { ma: "TB03", ten: "Máy X-quang", alias: "MXQ" }
    ],
    taiBienBienChung: [
        { ma: "TBBC01", ten: "Chảy máu", alias: "CM" },
        { ma: "TBBC02", ten: "Nhiễm trùng", alias: "NT" },
        { ma: "TBBC03", ten: "Tổn thương thần kinh", alias: "TTTK" }
    ],
    cheDoThuThuat: [
        { ma: "CD01", ten: "Thông thường", alias: "TT" },
        { ma: "CD02", ten: "Khẩn cấp", alias: "KC" },
        { ma: "CD03", ten: "Cấp cứu", alias: "CC" }
    ],
    viTriThucHien: [
        { ma: "VT01", ten: "Phòng mổ", alias: "PM" },
        { ma: "VT02", ten: "Phòng tiểu phẫu", alias: "PTP" },
        { ma: "VT03", ten: "Phòng cấp cứu", alias: "PCC" }
    ],
    tuVong: [
        { ma: "TV01", ten: "Trong 24 giờ", alias: "24h" },
        { ma: "TV02", ten: "Trong 7 ngày", alias: "7N" },
        { ma: "TV03", ten: "Không tử vong", alias: "KTV" }
    ],

    voCam: [
            { ma: "TV01", ten: "Gây tê", alias: "GT" },
            { ma: "TV02", ten: "Gây mê", alias: "GM" },
            { ma: "TV03", ten: "Châm tê", alias: "CT" }
        ]
};

// Định nghĩa các cấu hình TomSelect
function getTomSelectConfigs(phongBuongData) {
    return [
        {
            className: ".cbPhongThucHien",
            placeholder: "-- Phòng thực hiện --",
            data: phongBuongData
        },
        {
            className: ".cbPhanLoai",
            placeholder: "-- Phân loại --",
            data: sampleDataThongTin.phanLoai
        },
        {
            className: ".cbThietBi",
            placeholder: "-- Thiết bị --",
            data: sampleDataThongTin.thietBi
        },
        {
            className: ".cbBienChung",
            placeholder: "-- Tai biến/biến chứng --",
            data: sampleDataThongTin.taiBienBienChung
        },
        {
            className: ".cbCheDoThuThuat",
            placeholder: "-- Chế độ thủ thuật --",
            data: sampleDataThongTin.cheDoThuThuat
        },
        {
            className: ".cbViTriThucHien",
            placeholder: "-- Vị trí thực hiện --",
            data: sampleDataThongTin.viTriThucHien
        },
        {
            className: ".cbTuVong",
            placeholder: "-- Tử vong --",
            data: sampleDataThongTin.tuVong
        },
        {
            className: ".cbPTVoCam",
            placeholder: "-- Phương thức vô cảm --",
            data: sampleDataThongTin.tuVong
        }
    ];
}

// Hàm chung để cấu hình TomSelect
function configCbThongTin(configs) {
    configs.forEach(cfg => {
        new TomSelect(cfg.className, {
            options: cfg.data,
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
                            <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.alias || "")}</span>
                        </div>`;
                },
                item: function (data, escape) {
                    return `
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span>${escape(data.ten)}</span>
                            <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.alias || "")}</span>
                        </div>`;
                }
            }
        });
    });
}


function initThongTinTab() {
    $.getJSON("dist/data/json/DM_PhongBuong.json", dataPhongBuong => {
        const listPhongBuong = dataPhongBuong
            .filter(n => n.active === true || n.active === 1)
            .map(n => ({
                ...n,
                alias: n.viettat?.trim() !== ""
                    ? n.viettat.toUpperCase()
                    : n.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
            }));

        const configs = getTomSelectConfigs(listPhongBuong);
        configCbThongTin(configs);

    });
    var $ekipPane = $("#tabs-thongtin-7");
    $ekipPane.off('click', '.btn-edit').on('click', '.btn-edit', handleEditEkipClick);
    $ekipPane.off('click', '.btn-delete').on('click', '.btn-delete', handleDeleteEkipClick);

    console.log("Khởi tạo Tab thông tin hoàn tất. Sự kiện đã được gán.");
}

initThongTinTab();

