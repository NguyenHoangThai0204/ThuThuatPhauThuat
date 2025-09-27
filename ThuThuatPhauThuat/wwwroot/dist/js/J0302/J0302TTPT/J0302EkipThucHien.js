const sampleDataEkip = {
    nhanVien: [
        { ma: "NV01", ten: "Nguyễn Văn A", alias: "NVA" },
        { ma: "NV03", ten: "Trần Thị B", alias: "TTB" },
    ],
    vaiTro: [
        { ma: "TB01", ten: "Vai trò 1", alias: "VT1" },
        { ma: "TB02", ten: "Vai trò 2", alias: "VT2" },
    ]
};

const configsEkip = [
    { className: ".cbNhanVien", placeholder: "-- Tên nhân viên --", data: sampleDataEkip.nhanVien },
    { className: ".cbVaiTro", placeholder: "-- Vai trò --", data: sampleDataEkip.vaiTro }
];

function configCbEkip(configs) {
    configs.forEach(cfg => {
        var elements = $(cfg.className); 
        elements.each(function () {
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
    });
}
function handleAddEkipClick(e) {
    e.preventDefault();
    console.log("Xử lý Thêm Ekip: Gọi AJAX POST...");

}

function handleEditEkipClick() {
    var ekipId = $(this).data('ekip-id');
    console.log("Xử lý Chỉnh sửa Ekip ID: " + ekipId);
}

function handleDeleteEkipClick() {
    var ekipId = $(this).data('ekip-id');
    if (confirm("Bạn có chắc chắn muốn xóa Ekip ID " + ekipId + "?")) {
        console.log("Xử lý Xóa Ekip ID: " + ekipId);
    }
}
function initEkipTab() {
    console.log("-> Bắt đầu khởi tạo Tab Ekip.");

    $('.cbNhanVien, .cbVaiTro').each(function () {
        if (this.tomselect) {
            console.log("Phát hiện và hủy TomSelect cũ.");
            this.tomselect.destroy();
        }
    });
    configCbEkip(configsEkip);
    $("#btn_ghiChu").off('click').on('click', handleAddEkipClick);

    var $ekipPane = $("#tabs-ekip-7");
    $ekipPane.off('click', '.btn-edit').on('click', '.btn-edit', handleEditEkipClick);
    $ekipPane.off('click', '.btn-delete').on('click', '.btn-delete', handleDeleteEkipClick);

    console.log("-> Khởi tạo Tab Ekip hoàn tất. Dữ liệu mẫu đã được nạp.");
}
initEkipTab();