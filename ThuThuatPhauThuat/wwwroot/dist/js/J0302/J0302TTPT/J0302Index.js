


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
window.IDPhieuTTPT = 0;
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

var currentPatientContext = {
    idVaoVien: null,
    idChiNhanh: null,
    idChiDinhChiTiet: null
};

// Hàm kiểm tra xem có phải đang chọn bệnh nhân mới không
function isNewPatientSelection() {
    var isNew = (currentPatientContext.idVaoVien !== selectedIdVaoVien ||
        currentPatientContext.idChiNhanh !== window._idcn ||
        currentPatientContext.idChiDinhChiTiet !== selectedIdChiDinhChiTiet);

    if (isNew) {
        // Cập nhật context hiện tại
        currentPatientContext.idVaoVien = selectedIdVaoVien;
        currentPatientContext.idChiNhanh = window._idcn;
        currentPatientContext.idChiDinhChiTiet = selectedIdChiDinhChiTiet;

        // Reset trạng thái loaded tabs khi chọn bệnh nhân mới
        tabLoaded = {};
    }

    return isNew;
}
$(document).ready( async function () {
    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach");

    //$('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
    //    var target = $(e.target).attr("href");
    //    var tabNumber = 0;

    //    if (target === "#tabs-thongtin-7") tabNumber = 2;
    //    else if (target === "#tabs-trinhtu-7") tabNumber = 3;
    //    else if (target === "#tabs-ekip-7") tabNumber = 4;
    //    else if (target === "#tabs-thuoc-7") tabNumber = 5;
    //    khoiTaoJSChoTab(tabNumber);
    //    if (target === "#tabs-danhsach-7" && $(target).is(':empty')) {
    //        $(target).load("/thu_thuat_phau_thuat/danh_sach");
    //    }
    //    else if (tabNumber > 0) {
    //        var urlMap = {
    //            2: "/thu_thuat_phau_thuat/thong_tin",
    //            3: "/thu_thuat_phau_thuat/trinh_tu",
    //            4: "/thu_thuat_phau_thuat/ekip",
    //            5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
    //        };

    //        var tabKey = tabNumber + '_' + selectedIdVaoVien + '_' + selectedIdChiDinhChiTiet;

    //        if (!tabLoaded[tabKey] || tabNumber === 2 || tabNumber === 4 || tabNumber === 3) {
    //            // Luôn load lại tab 2 khi có ID mới
    //             $(target).load(urlMap[tabNumber], function () {
    //                 $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
    //                    tabIndex: tabNumber,
    //                    idVaoVien: selectedIdVaoVien,
    //                    idcn: window._idcn,
    //                    idChiDinhChiTiet: selectedIdChiDinhChiTiet
    //                }, function (html) {
    //                    $(target).prepend(html);
    //                    khoiTaoJSChoTab(tabNumber);

    //                    tabLoaded[tabKey] = true;

    //                    if (tabNumber === 2) {
    //                        initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
    //                    }
    //                    else if (tabNumber === 4) {
    //                        initEkipTab();
    //                    } else if (tabNumber === 3) {
    //                        loadTrinhTuVaKetLuanWithFocus(window.IDPhieuTTPT);
    //                    }
    //                });
    //            });
    //        } else {
    //            khoiTaoJSChoTab(tabNumber);

    //            if (tabNumber === 2 && selectedIdVaoVien && selectedIdChiDinhChiTiet && window._idcn) {
    //                khoiTaoJSChoTab(tabNumber);
    //                loadData(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
    //            }
              
    //        }
    //    }
    //});
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

            var tabKey = tabNumber + '_' + selectedIdVaoVien + '_' + selectedIdChiDinhChiTiet;

            // CHỈ load lại khi chưa từng load hoặc khi ID thay đổi
            var shouldLoad = !tabLoaded[tabKey] ||
                (tabNumber === 2 && isNewPatientSelection()); // Thêm điều kiện kiểm tra ID mới

            if (shouldLoad) {
                $(target).load(urlMap[tabNumber], function () {
                    $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu", {
                        tabIndex: tabNumber,
                        idVaoVien: selectedIdVaoVien,
                        idcn: window._idcn,
                        idChiDinhChiTiet: selectedIdChiDinhChiTiet
                    }, function (html) {
                        $(target).prepend(html);
                        khoiTaoJSChoTab(tabNumber);

                        tabLoaded[tabKey] = true;

                        if (tabNumber === 2) {
                            initThongTinTab(selectedIdVaoVien, window._idcn, selectedIdChiDinhChiTiet);
                        }
                        else if (tabNumber === 4) {
                            initEkipTab();
                        }
                    });
                });
            } else {
                // Đã load rồi, chỉ cần khởi tạo JS
                khoiTaoJSChoTab(tabNumber);
            }
        }
    });
    $('#btn_saveIndex').on('click', async function () {
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
            let res = await $.ajax({
                url: '/thu_thuat_phau_thuat/create-phieu',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
            if (res.success) {
                window.IDPhieuTTPT = res.idPhieuTTPT;
            }
        } else {
            data.IDPhieuTTPT = IDPhieuTTPT;
            await $.ajax({
                url: '/thu_thuat_phau_thuat/update-phieu',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });
        }


        if (typeof handleSaveThongTin === 'function') {
            handleSaveThongTin();
        }
        if (typeof saveTrinhTu === 'function') {
            saveTrinhTu();
        }
        if (typeof handleSaveEkip === 'function') {
            handleSaveEkip();
        }
        ////if (typeof handleSaveThuocVatTu === 'function') {
        //    handleSaveThuocVatTu();
        //}

    });

    $('#btn_pdfIndex').on('click', function () {
        var data = {
            IDVaoVien: selectedIdVaoVien,
            IDChiDinhChiTiet: selectedIdChiDinhChiTiet,
            IDChiNhanh: _idcn
        };

        if (selectedIdChiDinhChiTiet && selectedIdVaoVien && IDPhieuTTPT) {

            fetch("/thu_thuat_phau_thuat/xuat-pdf-bang-html", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/pdf"
                },
                body: JSON.stringify(data)
            })
                .then(res => {
                    if (!res.ok) throw new Error("Export PDF thất bại");
                    return res.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "ThuThuatPhauThuat.pdf";
                    a.click();
                    window.URL.revokeObjectURL(url);
                    toastr.success("Xuất PDF thành công");
                })
                .catch(err => {
                    console.error("Lỗi export PDF:", err);
                    toastr.error("Xuất PDF thất bại");
                });

        } else {
            toastr.error("Vui lòng tạo số phiếu trước khi xuất PDF");
        }
    });

  
});
toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "timeOut": "2000"
};