function toggleSaveButton() {
    var activeTab = $('.tab-pane.active').attr('id');
    if (activeTab === 'tabs-danhsach-7') {
        $('#floating-save-btn').hide();
    } else {
        $('#floating-save-btn').show();
    }
}

function getSelectedImagesForSave() {
    // Kiểm tra xem window.getSelectedImages có tồn tại không
    if (typeof window.getSelectedImages !== 'function') {
        console.warn('window.getSelectedImages chưa được khởi tạo');
        return [];
    }

    var anhTruongTrinhSaveToServer = [];
    var selectedImages = window.getSelectedImages();

    if (selectedImages && selectedImages.length > 0) {
        selectedImages.forEach(item => {
            anhTruongTrinhSaveToServer.push({
                URL: item.ftpUrl,
                TenAnh: item.name
            });
        });
    }

    return anhTruongTrinhSaveToServer;
}

function saveTrinhTu(suppressToastr = false) {
    if (!window.IDPhieuTTPT || window.IDPhieuTTPT === 0) {
        if (!suppressToastr) toastr.warning('Vui lòng tạo phiếu trước khi lưu trình tự');
        return;
    }

    // Kiểm tra xem confirmTempImages có tồn tại không
    const confirmPromise = typeof window.confirmTempImages === 'function'
        ? window.confirmTempImages()
        : Promise.resolve();

    confirmPromise.then(() => {
        var thongTinLuocDo = $('#editorDiagram').html();
        console.log('Thông tin lược đồ:', thongTinLuocDo);

        var formData = {
            IDPhieuTTPT: window.IDPhieuTTPT,
            TrinhTu: $('#editorContent').html(),
            KetLuan: $('.editor-summary').val(),
            ThongTinLuocDo: thongTinLuocDo,
            AnhTruongTrinhSaveToServer: getSelectedImagesForSave()
        };

        console.log('Dữ liệu gửi đi:', formData);

        $.ajax({
            url: '/thu_thuat_phau_thuat/trinh-tu/save',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                console.log('Phản hồi từ server:', response);
                if (response.success) {
                    if (!suppressToastr) {
                        toastr.success(response.message);
                    }
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Lỗi AJAX:', error);
                toastr.error('Lỗi khi lưu trình tự: ' + error);
            }
        });
    }).catch(error => {
        console.error('Lỗi confirm temp images:', error);
        if (!suppressToastr) {
            toastr.error('Lỗi xác nhận ảnh tạm');
        }
    });
}

window.saveTrinhTu = saveTrinhTu;