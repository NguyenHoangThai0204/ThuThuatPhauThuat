function toggleSaveButton() {
    var activeTab = $('.tab-pane.active').attr('id');
    if (activeTab === 'tabs-danhsach-7') {
        $('#floating-save-btn').hide();
    } else {
        $('#floating-save-btn').show();
    }
}

function normalizeFontSize(htmlContent) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Loại bỏ tất cả style font-size cũ
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
        el.style.fontSize = '14pt';
    });

    return tempDiv.innerHTML;
}

function getSelectedImagesForSave() {
    // CHỈ lấy ảnh từ phần phiếu để gửi lên server
    var anhTruongTrinhSaveToServer = [];

    // Sử dụng window.imagesFromPhieu để đảm bảo truy cập đúng
    const images = window.imagesFromPhieu || [];

    document.querySelectorAll('.phieu-image-item').forEach(item => {
        const id = item.dataset.imageId;
        const img = images.find(i => i.id === id);
        if (img) {
            anhTruongTrinhSaveToServer.push({
                URL: img.ftpUrl,
                TenAnh: img.name
            });
        }
    });

    return anhTruongTrinhSaveToServer;
}

function saveTrinhTu(suppressToastr = false) {
    if (!window.IDPhieuTTPT || window.IDPhieuTTPT === 0) {
        if (!suppressToastr) toastr.warning('Vui lòng tạo phiếu trước khi lưu trình tự');
        return;
    }

    const confirmPromise = typeof window.confirmTempImages === 'function'
        ? window.confirmTempImages()
        : Promise.resolve();

    confirmPromise.then(() => {
        var thongTinLuocDo = normalizeFontSize($('#editorDiagram').html());
        var trinhTu = normalizeFontSize($('#editorContent').html());

        var formData = {
            IDPhieuTTPT: window.IDPhieuTTPT,
            TrinhTu: trinhTu,
            KetLuan: $('.editor-summary').val(),
            ThongTinLuocDo: thongTinLuocDo,
            AnhTruongTrinhSaveToServer: getSelectedImagesForSave()
        };
        console.log("formData", formData);

        $.ajax({
            url: '/thu_thuat_phau_thuat/trinh-tu/save',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                if (response.success) {
                    if (!suppressToastr) {
                        toastr.success(response.message);
                    }
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