//function khoiTaoJSChoTab(tabIndex) {
//    $('.datetimepicker-' + tabIndex).datetimepicker({});

//    $('.tom-select-' + tabIndex).each(function () {
//        if (!$(this).data('tomselect')) {
//            new TomSelect(this, {});
//        }
//    });
//}

function khoiTaoJSChoTab(tabIndex) {
    // Khởi tạo datetimepicker
    $('.datetimepicker-' + tabIndex).each(function () {
        if (!$(this).data("DateTimePicker")) {
            $(this).datetimepicker({});
        }
    });

    // Khởi tạo TomSelect
    $('.tom-select-' + tabIndex).each(function () {

        if (this && !this.tomselect) {
            try {
                new TomSelect(this, {});
            } catch (e) {
                console.error('Lỗi khởi tạo TomSelect:', e);
            }
        }
    });
}


var selectedIdVaoVien = null;
var selectedIdChiDinhChiTiet = null;
var tabLoaded = {};

$(document).ready(function () {
    // Load tab danh sách mặc định
    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach");

    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
        var tabNumber = 0;

        if (target === "#tabs-thongtin-7") tabNumber = 2;
        else if (target === "#tabs-trinhtu-7") tabNumber = 3;
        else if (target === "#tabs-ekip-7") tabNumber = 4;
        else if (target === "#tabs-thuoc-7") tabNumber = 5;
        khoiTaoJSChoTab(tabNumber); // Khởi tạo lại JS cho tab
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

            var tabKey = tabNumber + '_' + selectedIdVaoVien + '_' + selectedIdChiDinhChiTiet;

            if (!tabLoaded[tabKey] || tabNumber === 2) {
                // Luôn load lại tab 2 khi có ID mới
                $(target).load(urlMap[tabNumber], function () {
                    $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
                        tabIndex: tabNumber,
                        idVaoVien: selectedIdVaoVien,
                        idcn: window._idcn,
                        idChiDinhChiTiet: selectedIdChiDinhChiTiet
                    }, function (html) {
                        $(target).prepend(html);
                        khoiTaoJSChoTab(tabNumber); // Khởi tạo lại JS cho tab

                        tabLoaded[tabKey] = true;

                        // Gọi loadData ngay sau khi dữ liệu đã được set
                        if (tabNumber === 2 ) {
                            //khoiTaoJSChoTab(tabNumber); // Khởi tạo lại JS cho tab
                            initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
                        }
                    });
                });
            } else {
                // Nếu tab đã load trước đó → chỉ khởi tạo JS
                khoiTaoJSChoTab(tabNumber);

                if (tabNumber === 2 && selectedIdVaoVien && selectedIdChiDinhChiTiet && window._idcn) {
                    khoiTaoJSChoTab(tabNumber); // Khởi tạo lại JS cho tab
                    loadData(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
                }
            }
        }
    });
});


//function khoiTaoJSChoTab(tabIndex) {
//    $('.datetimepicker-' + tabIndex).datetimepicker({});

//    $('.tom-select-' + tabIndex).each(function () {
//        if (!$(this).data('tomselect')) { // tránh khởi tạo lại nếu đã tồn tại
//            new TomSelect(this, {});
//        }
//    });
//}

//var selectedIdVaoVien = null;
//var selectedIdChiDinhChiTiet = null;

//// Lưu trạng thái tab đã load
//var tabLoaded = {};

//$(document).ready(function () {

//    // Load danh sách ban đầu
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
//        else if (tabNumber > 0) {
//            var urlMap = {
//                2: "/thu_thuat_phau_thuat/thong_tin",
//                3: "/thu_thuat_phau_thuat/trinh_tu",
//                4: "/thu_thuat_phau_thuat/ekip",
//                5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
//            };


//            // Chỉ load tab nếu chưa load lần nào
//            if (!tabLoaded[tabNumber]) {
//                $(target).load(urlMap[tabNumber], function () {
//                    $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
//                        tabIndex: tabNumber,
//                        idVaoVien: selectedIdVaoVien,
//                        idcn: window._idcn,
//                        idChiDinhChiTiet: selectedIdChiDinhChiTiet
//                    }, function (html) {
//                        $(target).prepend(html);
//                        khoiTaoJSChoTab(tabNumber);
//                        tabLoaded[tabNumber] = true; // đánh dấu tab đã load
//                    });
//                });
//            } else {
//                // Nếu đã load, chỉ cần khởi tạo lại JS nếu cần
//                khoiTaoJSChoTab(tabNumber);
//            }
//        }
//    });
//});



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

