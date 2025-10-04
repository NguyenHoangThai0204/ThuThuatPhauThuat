function toggleSaveButton() {
    var activeTab = $('.tab-pane.active').attr('id');
    if (activeTab === 'tabs-danhsach-7') {
        $('#floating-save-btn').hide();
    } else {
        $('#floating-save-btn').show();
    }
}

function saveTrinhTu() {
    //console.log('=== BẮT ĐẦU SAVE TRÌNH TỰ ===');
    console.log("Tới rồi nè");
    var diagramInfo = $('#editorDiagram').html();
    var content = $('#editorContent').html();
    var summary = $('.editor-summary').val();

    var formData = {
        IDPhieuTTPT: window.IDPhieuTTPT,
        TrinhTu: content,
        KetLuan: summary,
        ThongTinLuocDo: diagramInfo,
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
        }
    });
}

window.saveTrinhTu = saveTrinhTu;