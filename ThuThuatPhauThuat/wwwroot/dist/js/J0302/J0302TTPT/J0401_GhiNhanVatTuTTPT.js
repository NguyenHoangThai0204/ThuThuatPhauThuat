document.addEventListener("DOMContentLoaded", function () {
    console.log("load");

    const dataTop = [
        {
            className: ".cbGioiTinh",
            placeholder: "-- Giới tính --",
            action: "DM_GioiTinh",
            callback: function () { },
        },
    ];

    configCbTop(dataTop, function () {
    });
});
