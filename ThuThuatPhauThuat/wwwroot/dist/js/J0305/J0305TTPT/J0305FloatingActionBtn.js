$(document).ready(function () {

    /************************* ĐỊNH NGHĨA CÁC FUNCTION TRƯỚC *************************/
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

    function saveThongTin() {
        console.log('=== SAVE THÔNG TIN ===');
    }

    function saveEkip() {
        console.log('=== SAVE EKIP ===');
    }

    function saveThuocVatTu() {
        console.log('=== SAVE THUỐC VẬT TƯ ===');
    }

    /************************* SAU ĐÓ MỚI GÁN EVENT *************************/

    toggleSaveButton();

    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', toggleSaveButton);

    $(document).on('click', '#btnFloatingSave', function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('=== CLICK NÚT LƯU ===');

        var $btn = $(this);
        var originalText = $btn.html();

        $btn.prop('disabled', true).html('<i class="ti ti-loader me-1"></i> Đang lưu...');

        var activeTab = $('.tab-pane.active').attr('id');
        console.log('Active tab:', activeTab);

        switch (activeTab) {
            case 'tabs-thongtin-7':
                console.log('→ Gọi saveThongTin()');
                saveThongTin();
                break;
            case 'tabs-trinhtu-7':
                console.log('→ Gọi saveTrinhTu()');
                saveTrinhTu($btn, originalText);
                break;
            case 'tabs-ekip-7':
                console.log('→ Gọi saveEkip()');
                saveEkip();
                break;
            case 'tabs-thuoc-7':
                console.log('→ Gọi saveThuocVatTu()');
                saveThuocVatTu();
                break;
            default:
                console.log('→ Tab không xác định!');
                $btn.prop('disabled', false).html(originalText);
        }
    });
});