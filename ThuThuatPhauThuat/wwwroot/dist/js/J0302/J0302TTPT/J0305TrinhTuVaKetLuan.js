function toggleSaveButton() {
    var activeTab = $('.tab-pane.active').attr('id');
    if (activeTab === 'tabs-danhsach-7') {
        $('#floating-save-btn').hide();
    } else {
        $('#floating-save-btn').show();
        //console.log('J0305FloatingActionBtn.js đã được load');
    }
}

function getUploadedImages() {
    var images = [];
    $('.image-item').each(function () {
        var imageId = $(this).data('image-id');
        var imageName = $(this).find('.fw-bold').text();
        var imageSrc = $(this).find('img').attr('src');
        images.push({
            id: imageId,
            name: imageName,
            src: imageSrc
        });
    });
    console.log('Uploaded images:', images);
    return images;
}

function saveTrinhTu($btn, originalText) {
    console.log('=== BẮT ĐẦU SAVE TRÌNH TỰ ===');

    var content = $('#editorContent').html();
    var summary = $('.editor-summary').val();

    console.log('Content:', content);
    console.log('Summary:', summary);

    var formData = {
        IDPhieuTTPT: 1,
        TrinhTu: content,
        KetLuan: summary,
        DanhSachHinhAnh: getUploadedImages()
    };

    console.log('Form data:', formData);

    $.ajax({
        url: '/thu_thuat_phau_thuat/trinh-tu/save',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        beforeSend: function () {
            console.log('AJAX beforeSend - Đang gửi request...');
        },
        success: function (response) {
            console.log('AJAX Success - Response:', response);
            if (response.success) {
                toastr.success(response.message);
            } else {
                toastr.error(response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', {
                status: status,
                error: error,
                responseText: xhr.responseText,
                statusCode: xhr.status
            });
            toastr.error('Lỗi khi lưu trình tự: ' + error);
        },
        complete: function () {
            console.log('AJAX Complete - Kết thúc request');
            $btn.prop('disabled', false).html(originalText);
        }
    });
}