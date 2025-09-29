// J0305FloatingActionBtn.js

$(document).ready(function () {
    function toggleSaveButton() {
        var activeTab = $('.tab-pane.active').attr('id');
        if (activeTab === 'tabs-danhsach-7') {
            $('#floating-save-btn').hide();
        } else {
            $('#floating-save-btn').show();
        }
    }
    toggleSaveButton();
    // Khi đổi tab
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', toggleSaveButton);

    $('#btnFloatingSave').on('click', function () {
        // Bắt sự kiện submit form tại đây
    });
});