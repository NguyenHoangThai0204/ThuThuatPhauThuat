
function formatDateTime(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${dd}-${MM}-${yyyy} ${HH}:${mm}`;
}

function updateDateTime() {
    var now = new Date();
    var formatted = formatDateTime(now);
    $("#info-datetime").text(formatted);
}

function khoiTaoJSChoTab(tabNumber) {
    console.log("-> Khởi tạo JS cho Tab số: " + tabNumber);

    switch (tabNumber) {
        
        case 1:
            if (typeof initDanhSachTab === 'function') initDanhSachTab();
            break;

       
        case 2:
            if (typeof initThongTinTab === 'function') initThongTinTab();
            break;

        case 4:
            if (typeof initEkipTab === 'function') {
                initEkipTab();
            } else {
                console.error("Lỗi: Không tìm thấy hàm initEkipTab. Đảm bảo J0302Ekip.js đã được load.");
            }
            break;

        default:
            break;
    }
}



$(document).ready(function () {
    $("#tabs-danhsach-7").load("/thu_thuat_phau_thuat/danh_sach", function () {
        khoiTaoJSChoTab(1); 
    });

    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href"); 

        var tabNumber = 0;
        if (target === "#tabs-danhsach-7") tabNumber = 1;
        else if (target === "#tabs-thongtin-7") tabNumber = 2;
        else if (target === "#tabs-trinhtu-7") tabNumber = 3;
        else if (target === "#tabs-ekip-7") tabNumber = 4;
        else if (target === "#tabs-thuoc-7") tabNumber = 5;

        
        if (tabNumber > 0 && $(target).is(':empty')) {
            var urlMap = {
                1: "/thu_thuat_phau_thuat/danh_sach",
                2: "/thu_thuat_phau_thuat/thong_tin",
                3: "/thu_thuat_phau_thuat/trinh_tu",
                4: "/thu_thuat_phau_thuat/ekip",
                5: "/thu_thuat_phau_thuat/ghi_nhan_thuoc_vat_tu"
            };

          
            $(target).load(urlMap[tabNumber], function () {

             
                $.get("/thu_thuat_phau_thuat/thong_tin_so_phieu?tabIndex=" + tabNumber, function (html) {
                    $(target).prepend(html);

                 
                    khoiTaoJSChoTab(tabNumber);
                });
            });
        }
    });

});