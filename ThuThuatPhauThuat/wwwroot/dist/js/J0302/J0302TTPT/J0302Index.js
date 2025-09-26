function khoiTaoJSChoTab(tabIndex) {
    $('.datetimepicker-' + tabIndex).datetimepicker({});
    $('.tom-select-' + tabIndex).each(function () {
        new TomSelect(this, {});
    });
}

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
        else if (tabNumber > 0 && $(target).is(':empty')) {
            var urlMap = {
                2: "/thu_thuat_phau_thuat/thong_tin",
                3: "/thu_thuat_phau_thuat/trinh_tu",
                4: "/thu_thuat_phau_thuat/ekip",
                5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
            };
            $(target).load(urlMap[tabNumber], function () {
                $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu?tabIndex=" + tabNumber, function (html) {
                    $(target).prepend(html);
                    khoiTaoJSChoTab(tabNumber);
                });
            });
        }
    });
});