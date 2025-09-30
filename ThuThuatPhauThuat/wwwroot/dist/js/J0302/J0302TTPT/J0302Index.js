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
var IDPhieuTTPT = null;

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
                        if (tabNumber === 2) {
                            //khoiTaoJSChoTab(tabNumber); // Khởi tạo lại JS cho tab
                            initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
                        }
                        else if (tabNumber === 4) {
                            initEkipTab();
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

    $('#btn_saveIndex').on('click', function () {
        console.log(">>> Nút Lưu Index được nhấn");

        // Gọi hàm lưu từng tab
        if (typeof handleSaveThongTin === 'function') {
            handleSaveThongTin();
        }
        //if (typeof handleSaveTrinhTu === 'function') {
        //    handleSaveTrinhTu();
        //}
        if (typeof handleSaveEkip === 'function') {
            handleSaveEkip();
        }
        //if (typeof handleSaveThuocVatTu === 'function') {
        //    handleSaveThuocVatTu();
        //}
    });
});
