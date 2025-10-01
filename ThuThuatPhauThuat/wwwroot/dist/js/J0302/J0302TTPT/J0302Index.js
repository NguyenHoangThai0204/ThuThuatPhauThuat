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
// Hàm format ngày giờ theo local (yyyy-MM-ddTHH:mm:ss)
function formatLocalDateTime(str) {
    if (!str) return null;
    const parts = str.split(/[- :]/);
    // parts = [dd, MM, yyyy, HH, mm]
    if (parts.length < 5) return null;

    const d = new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4]);

    return d.getFullYear() + "-" +
        ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
        ("0" + d.getDate()).slice(-2) + "T" +
        ("0" + d.getHours()).slice(-2) + ":" +
        ("0" + d.getMinutes()).slice(-2) + ":00";
}
// Khi thu thập dữ liệu để lưu

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
        var data = {
            SoPhieu: $('#soPhieu').val(),
            IDNguonBenh: $('.thuThuat__nguonBenh-tom-select-0').val(),
            BatDauThuThuat: formatLocalDateTime($('.txtDateTimeBatDauThuThuat-0').val()),
            KetThucThuThuat: formatLocalDateTime($('.txtDateTimeKetThucThuThuat-0').val()),
            ThoiGianKhoa: formatLocalDateTime($('.txtDateTimeThoiGianKhoa-0').val()),
            NhomMau: $('#nhomMau').val(),
            YeuToRh: $('#yeuToRh').val(),
            IDVaoVien: selectedIdVaoVien,
            IDChiDinhChiTiet: selectedIdChiDinhChiTiet,
            NguoiKhoa: $('#nguoiKhoa').val()
        };
        if (!IDPhieuTTPT || IDPhieuTTPT === 0) {
            // Thu thập dữ liệu từ form
            
            $.ajax({
                url: '/thu_thuat_phau_thuat/create-phieu',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (res) {
                    if (res.success) {
                        IDPhieuTTPT = res.idPhieuTTPT;
                    }
                }
            });
        } else {
            
            data.IDPhieuTTPT = IDPhieuTTPT; // Gắn ID để server biết update
            console.log(data);
            $.ajax({
                url: '/thu_thuat_phau_thuat/update-phieu',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (res) {
                    if (res.success) {
                        console.log("✅ Cập nhật phiếu thành công, ID =", IDPhieuTTPT);
                    } else {
                        console.error("❌ Cập nhật phiếu thất bại:", res.message);
                    }
                },
                error: function (xhr) {
                    console.error("❌ Lỗi server khi cập nhật phiếu!", xhr.responseText);
                }
            });
        }


        if (typeof handleSaveThongTin === 'function') {
            handleSaveThongTin();
        }
        //if (typeof handleSaveTrinhTu === 'function') {
        //    handleSaveTrinhTu();
        //}
        if (typeof handleSaveEkip === 'function') {
            handleSaveEkip();
        }
        ////if (typeof handleSaveThuocVatTu === 'function') {
        //    handleSaveThuocVatTu();
        //}
    });
});
