$(document).ready(function () {
    // load Danh sách mặc định
    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach");

    // khi click tab thì load nội dung
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
        if (target === "#tabs-danhsach-7" && $(target).is(':empty')) {
            $(target).load("/thu_thuat_phau_thuat/danh_sach");
        }
        else if (target === "#tabs-thongtin-7" && $(target).is(':empty')) {
            $(target).load("/thu_thuat_phau_thuat/thong_tin");
        }
        else if (target === "#tabs-trinhtu-7" && $(target).is(':empty')) {
            $(target).load("/thu_thuat_phau_thuat/trinh_tu");
        }
        else if (target === "#tabs-ekip-7" && $(target).is(':empty')) {
            $(target).load("/thu_thuat_phau_thuat/ekip");
        }
        else if (target === "#tabs-thuoc-7" && $(target).is(':empty')) {
            $(target).load("/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu");
        }
    });
});