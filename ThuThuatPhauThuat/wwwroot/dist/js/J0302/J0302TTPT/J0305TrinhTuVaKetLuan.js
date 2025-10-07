function toggleSaveButton() {
    var activeTab = $('.tab-pane.active').attr('id');
    if (activeTab === 'tabs-danhsach-7') {
        $('#floating-save-btn').hide();
    } else {
        $('#floating-save-btn').show();
    }
}

function getSelectedImagesForSave() {
    //return window.getSelectedImages ? window.getSelectedImages() : [];
    var anhTruongTrinhSaveToServer = [];
    window.getSelectedImages().forEach(item => {
        anhTruongTrinhSaveToServer.push({
            URL: item.ftpUrl,
            TenAnh: item.name
        });
    });
    return anhTruongTrinhSaveToServer;
}

function saveTrinhTu() {
    // Nếu chưa có phiếu, tạo phiếu trước
    if (!window.IDPhieuTTPT || window.IDPhieuTTPT === 0) {
        toastr.warning('Vui lòng tạo phiếu trước khi lưu trình tự');
        return;
    }
    confirmTempImages().then(() => {
        var formData = {
            IDPhieuTTPT: window.IDPhieuTTPT,
            TrinhTu: $('#editorContent').html(),
            KetLuan: $('.editor-summary').val(),
            ThongTinLuocDo: $('#editorDiagram').html(),
            AnhTruongTrinhSaveToServer: getSelectedImagesForSave()
        };

        $.ajax({
            url: '/thu_thuat_phau_thuat/trinh-tu/save',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                if (response.success) {
                    toastr.success(response.message);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                toastr.error('Lỗi khi lưu trình tự: ' + error);
            }
        });
    });
}

window.saveTrinhTu = saveTrinhTu;