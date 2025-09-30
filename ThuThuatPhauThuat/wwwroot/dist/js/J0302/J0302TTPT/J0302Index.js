
function khoiTaoJSChoTab(tabIndex) {
    $('.datetimepicker-' + tabIndex).datetimepicker({});
    $('.tom-select-' + tabIndex).each(function () {
        new TomSelect(this, {});
    });
}

var selectedIdVaoVien = null;
let selectedSoPhieu = localStorage.getItem("selectedSoPhieu") || null; // Lưu lâu dài

$(document).ready(function () {

    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach");

    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");

        var tabNumber = 0;
        if (target === "#tabs-thongtin-7") tabNumber = 2;
        else if (target === "#tabs-trinhtu-7") tabNumber = 3;
        else if (target === "#tabs-ekip-7") tabNumber = 4;
        else if (target === "#tabs-thuoc-7") tabNumber = 5;

        if (target === "#tabs-danhsach-7" && $(target).is(':empty')) {
            $(target).load("/thu_thuat_phau_thuat/danh_sach");
        }
        else if (tabNumber > 0) {
            var urlMap = {
                2: "/thu_thuat_phau_thuat/thong_tin",
                3: "/thu_thuat_phau_thuat/trinh_tu",
                4: "/thu_thuat_phau_thuat/ekip",
                5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
            };
            $(target).load(urlMap[tabNumber] + "?idVaoVien=" + selectedIdVaoVien, function () {
                $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu?tabIndex=" + tabNumber + "&idVaoVien=" + selectedIdVaoVien + "&idcn=" + window._idcn, function (html) {
                    $(target).prepend(html);
                    khoiTaoJSChoTab(tabNumber);

                    const idVaoVien = document.getElementById("hiddenIdVaoVien")?.value;
                    const idChiNhanh = window._idcn;

                    // Lấy số phiếu từ localStorage hoặc mặc định lấy số phiếu đầu tiên
                    let soPhieu = selectedSoPhieu;
                    if (!soPhieu) {
                        const firstOption = $(`.thuThuat__soPhieu-tom-select-${tabNumber} option:first`).val();
                        soPhieu = firstOption || null;
                        selectedSoPhieu = soPhieu;
                        localStorage.setItem("selectedSoPhieu", soPhieu);
                    }

                    $(`.thuThuat__soPhieu-tom-select-${tabNumber}`).val(soPhieu).trigger("change");

                    loadData(idVaoVien, idChiNhanh, soPhieu);

                    if (tabNumber === 2) {
                        initThongTinTab(idChiNhanh)
                            .then(() => loadData(idVaoVien, idChiNhanh, soPhieu))
                            .catch(err => console.error("Lỗi khởi tạo TomSelect tab 2:", err));
                    }

                    if (tabNumber === 3) {
                        initThongTinTab(idChiNhanh)
                            .then(() => loadData(idVaoVien, idChiNhanh, soPhieu))
                            .catch(err => console.error("Lỗi khởi tạo TomSelect tab 3:", err));
                    }

                    document.addEventListener("soPhieuChanged", function (e) {
                        if (parseInt(e.detail.tabIndex) === tabNumber) {
                            selectedSoPhieu = e.detail.soPhieu;
                            localStorage.setItem("selectedSoPhieu", selectedSoPhieu);
                            loadData(idVaoVien, idChiNhanh, selectedSoPhieu);
                        }
                    });
                });
            });
        }
    });

    // Khi đổi số phiếu
    $(document).on("change", "[class*='thuThuat__soPhieu-tom-select-']", function () {
        let tabIndex = this.className.match(/thuThuat__soPhieu-tom-select-(\d+)/)[1];
        let opt = $(this).find("option:selected");
        selectedSoPhieu = opt.val();
        localStorage.setItem("selectedSoPhieu", selectedSoPhieu);

        $(".thuThuat__nhomMau-" + tabIndex).text(opt.data("nhommau"));
        $(".thuThuat__yeuToRh-" + tabIndex).text(opt.data("yeutorh"));
        $(".txtDateTimeBatDauThuThuat-" + tabIndex).val(opt.data("batdau"));
        $(".txtDateTimeKetThucThuThuat-" + tabIndex).val(opt.data("ketthuc"));
        $(".thuThuat__nguonBenh-" + tabIndex).val(opt.data("idnguonbenh"));

        const event = new CustomEvent("soPhieuChanged", {
            detail: { tabIndex: parseInt(tabIndex), soPhieu: opt.val() }
        });
        document.dispatchEvent(event);
    });
});




//function khoiTaoJSChoTab(tabIndex) {
//    $('.datetimepicker-' + tabIndex).datetimepicker({});
//    $('.tom-select-' + tabIndex).each(function () {
//        new TomSelect(this, {});
//    });
//}

//$(document).ready(function () {
//    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach");

//    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
//        var target = $(e.target).attr("href");

//        var tabNumber = 0;
//        if (target === "#tabs-thongtin-7") tabNumber = 2;
//        else if (target === "#tabs-trinhtu-7") tabNumber = 3;
//        else if (target === "#tabs-ekip-7") tabNumber = 4;
//        else if (target === "#tabs-thuoc-7") tabNumber = 5;

//        if (target === "#tabs-danhsach-7" && $(target).is(':empty')) {
//            $(target).load("/thu_thuat_phau_thuat/danh_sach");
//        }
//        else if (tabNumber > 0 && $(target).is(':empty')) {
//            var urlMap = {
//                2: "/thu_thuat_phau_thuat/thong_tin",
//                3: "/thu_thuat_phau_thuat/trinh_tu",
//                4: "/thu_thuat_phau_thuat/ekip",
//                5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
//            };
//            $(target).load(urlMap[tabNumber], function () {
//                $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu?tabIndex=" + tabNumber, function (html) {
//                    $(target).prepend(html);
//                    khoiTaoJSChoTab(tabNumber);
//                });
//            });
//        }
//    });
//});