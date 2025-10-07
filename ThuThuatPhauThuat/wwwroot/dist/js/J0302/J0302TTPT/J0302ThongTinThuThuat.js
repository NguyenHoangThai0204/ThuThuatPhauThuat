if (typeof icdData === "undefined") {
    var icdData = [];
}
if (typeof selectedICDs === "undefined") {
    var selectedICDs = {
        vao_khoa: [],
        truoc_thuat: [],
        sau_thuat: [],
    }
}
if (typeof allDataThongTin === "undefined") {
    var allDataThongTin = {
        taiBienBienChung: [],
        viTriThucHien: [],
        cheDoThuThuat: [],
        tuVong: [],
        phongBuong: [],
        phanLoai: [],
        thietBi: [],
        voCam: [],


    };
}
function resetThongTinState() {
    allDataThongTin = {
        taiBienBienChung: [],
        viTriThucHien: [],
        cheDoThuThuat: [],
        tuVong: [],
        phongBuong: [],
        phanLoai: [],
        thietBi: [],
        voCam: [],
    };
    icdData = [];
    selectedICDs = {
        vao_khoa: [],
        truoc_thuat: [],
        sau_thuat: [],
    };
}

function toIsoDate(dateString) {
    if (!dateString) return null;

    // Kiểm tra xem đã là định dạng yyyy-mm-dd chưa (vì input type="date" trả về yyyy-mm-dd)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
    }

    // Nếu là định dạng dd-mm-yyyy, chuyển đổi
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
    }

    return null; // Trả về null nếu không phải định dạng hợp lệ
}


function normalizeICDData(data) {
    if (!Array.isArray(data)) {
        console.error("ICD data is not an array:", data);
        return [];
    }
    return data.map(item => ({
        ma: item.ma,
        ten: item.ten,
        alias: item.viettat || "",
        id: item.id !== undefined ? item.id : item.ma, // Đảm bảo luôn có id
        active: item.active !== undefined ? item.active : true,
    }));
}

async function loadICDData() {
    try {
        const response = await fetch("dist/data/json/DM_ICD.json")
        const data = await response.json()
        icdData = normalizeICDData(data)
    } catch (error) {
        console.error("[v0] Error loading ICD data:", error)
        icdData = [
            { id: "A00_id", ma: "A00", ten: "Tả" },
            { id: "A01_id", ma: "A01", ten: "Sốt thương hàn và sốt phó thương hàn" },
            { id: "A02_id", ma: "A02", ten: "Nhiễm trùng Salmonella khác" },
            { id: "B00_id", ma: "B00", ten: "Nhiễm trùng do virus herpes simplex" },
            { id: "C00_id", ma: "C00", ten: "Ung thư môi" },
            { id: "C01_id", ma: "C01", ten: "Ung thư lưỡi" },
        ]
    }
}

function loadInitialOptions(tomSelectInstance, isYhct = false) {
    if (!tomSelectInstance) return;

    const yhctParam = isYhct ? `?yhct=true` : '';

    // Gọi API đã được viết ở C#
    $.ajax({
        url: `/thu_thuat_phau_thuat/thong-tin/init-icd${yhctParam}`,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (Array.isArray(response)) {
                console.log("loadInitialOptions =  ", response);
                response.forEach(icd => {
                    tomSelectInstance.addOption(icd);
                });
            }
        },
        error: function (err) {
            console.error("Lỗi khi tải 50 ICD ban đầu:", err);
        }
    });
}
// Định nghĩa hàm này ở file J0302ThongTinThuThuat.js
function initTomSelect(elementId, initialValue, isYhct = false) {
    // Tìm element bằng ID (vì className không ổn định cho TomSelect)
    const $select = $(`#${elementId}`);

    if ($select.length === 0) return null; // Thoát nếu không tìm thấy element

    // Nếu đã khởi tạo, hủy trước
    if ($select[0].tomselect) {
        $select[0].tomselect.destroy();
    }

    const tomSelectInstance = new window.TomSelect($select[0], {
        // QUAN TRỌNG: Sử dụng 'ma' (mã ICD) làm valueField để đồng bộ với API search
        valueField: 'id',
        labelField: 'ten',
        searchField: ['ma', 'ten', 'viettat'],

        // Cấu hình AJAX để tìm kiếm
        load: function (query, callback) {
            const yhctParam = isYhct ? `&yhct=true` : '';

            if (!query.length || query.length < 2) {

                $.ajax({
                    url: `/thu_thuat_phau_thuat/thong-tin/search-icd?query=${encodeURIComponent('a0')}&limit=50${yhctParam}`,
                    type: 'GET',
                    dataType: 'json',
                    success: function (response) {
                        callback(response);
                    },
                    error: function () {
                        console.error("Lỗi khi tìm kiếm ICD từ API:", elementId);
                        callback();
                    }
                });
                callback();
            }


            $.ajax({
                url: `/thu_thuat_phau_thuat/thong-tin/search-icd?query=${encodeURIComponent(query)}&limit=50${yhctParam}`,
                type: 'GET',
                dataType: 'json',
                success: function (response) {
                    callback(response);
                },
                error: function () {
                    console.error("Lỗi khi tìm kiếm ICD từ API:", elementId);
                    callback();
                }
            });
        },

    });

   

    return tomSelectInstance;
}


function addICDTag(type, icdId, icdCode, icdName) {
    const displayArea = document.getElementById(`hien_thi_icd_${type}`)

    if (selectedICDs[type]?.find((item) => String(item.id) === String(icdId))) {
        return
    }
    selectedICDs[type].push({ id: icdId, ma: icdCode, ten: icdName })

    const tag = document.createElement("span")
    tag.className = "icd-tag"
    const escapedIcdId = String(icdId).replace(/'/g, "\\'")

    // Gán ID vào dataset để xóa chính xác
    tag.dataset.icdId = escapedIcdId;

    tag.innerHTML = `
    ${icdCode}
    <button type="button" class="remove-btn" onclick="removeICDTag('${type}', '${escapedIcdId}')">×</button>
  `
    displayArea.appendChild(tag)
    updateICDTextArea(type)
}
function removeICDTag(type, icdId) {
    const displayArea = document.getElementById(`hien_thi_icd_${type}`)

    selectedICDs[type] = selectedICDs[type].filter((item) => String(item.id) !== icdId)

    const tags = displayArea.querySelectorAll(".icd-tag")
    tags.forEach((tag) => {
        // Xóa tag dựa trên data-icd-id
        if (tag.dataset.icdId === icdId) {
            tag.remove()
        }
    })

    updateICDTextArea(type)

}
function updateICDTextArea(type) {
    const $targetTextarea = $(`#ten_icd_${type}`);

    const content = selectedICDs[type]
        .map(item => `${item.ma}: ${item.ten}`)
        .join('; \n');

    $targetTextarea.val(content);
}
function configureICDTomSelect(yhct = false) {
    const icdConfigs = [
        {
            className: ".cbCDVaoKhoa",
            type: "vao_khoa",
            isYhct: yhct,
            maxItems: 1
        },
        {
            className: ".cbTruocThuThuat",
            type: "truoc_thuat",
            isYhct: yhct,
            maxItems: 1
        },
        {
            className: ".cbSauThuThuat",
            type: "sau_thuat",
            isYhct: yhct,
            maxItems: 1
        },
    ]

    icdConfigs.forEach((config) => {
        const element = document.querySelector(config.className);

        if (!element) return; // Thoát nếu không tìm thấy element

        // **QUAN TRỌNG:** Cần có ID trên element để initTomSelect hoạt động
        const elementId = element.id || config.type;
        if (!element.id) {
            element.id = elementId; // Gán tạm ID nếu thiếu
        }

        // Lấy giá trị ban đầu đã load từ server trong hàm loadData()
        const initialValue = selectedICDs[config.type];

        // 1. GỌI HÀM INIT CẤU HÌNH REMOTE LOADING
        const tomSelectInstance = initTomSelect(
            elementId,
            initialValue,
            config.isYhct
        );
        if (tomSelectInstance) {
            // 2. GHI ĐÈ CẤU HÌNH TÙY CHỈNH CỦA BẠN
            tomSelectInstance.settings.maxItems = config.maxItems;
            tomSelectInstance.settings.placeholder = "-- Mã ICD --";

            // Ghi đè Render (chắc chắn dùng trường 'ma' và 'ten'/'viettat' từ API)
            tomSelectInstance.settings.render = {
                option: (data, escape) => `
                    <div style="display:flex; justify-content:space-between; width:100%;">
                        <span>${escape(data.ten)}</span>
                        <span style="color:gray; font-size:12px; margin-left:10px;"><strong>${escape(data.ma || data.viettat)}</strong></span>
                    </div>`,
                item: (data, escape) => `
                    <div style="display:flex; justify-content:space-between; width:100%;">
                        <span>${escape(data.ten)}</span>
                        <span style="color:gray; font-size:12px; margin-left:10px;"><strong>${escape(data.ma || data.viettat)}</strong></span>
                    </div>`,
            };
            loadInitialOptions(tomSelectInstance, config.isYhct);
            tomSelectInstance.on('change', function (value) {



                if (!value) return;

                const selectedId = value;
                const selectedItem = this.options[selectedId];

                if (!selectedItem) {
                    return;
                }
                addICDTag(config.type, selectedItem.id, selectedItem.ma, selectedItem.ten);

                this.clear();
            });
        }
    })
}

function clearICDDisplay(type) {
    $(`.hien_thi_icd_${type}`).empty();

    selectedICDs[type] = [];

    $(`#ten_icd_${type}`).val('');
}

function normalizeData(data, tenField = 'ten', viettatField = 'viettat') {
    if (!Array.isArray(data)) {
        console.warn("normalizeData nhận dữ liệu không phải mảng:", data);
        return [];
    }

    return data
        .filter(n => n.active === true || n.active === 1)
        .map(n => {
            const ten = n[tenField]?.trim() || "";
            const viettat = n[viettatField]?.trim() || "";
            let generatedAlias = "";

            if (viettat !== "") {
                generatedAlias = viettat.toUpperCase();
            } else {
                const words = ten.split(/\s+|-|\/|\(|\)|[^\w\s]/g).filter(w => w.length > 0);

                generatedAlias = words
                    .map(w => w.charAt(0)?.toUpperCase())
                    .join("");

                generatedAlias = generatedAlias.replace(/[^A-Z0-9]/g, '');
            }

            return {
                ...n,
                alias: generatedAlias
            };
        });
}
function fetchDataAndNormalize(url, tenField = 'ten', viettatField = 'viettat', idChiNhanh = null) {
    function filterData(data) {
        if (!Array.isArray(data)) return [];

        let filtered = data.filter(n => n.active === true || n.active === 1);

        if (idChiNhanh !== null) {
            filtered = filtered.filter(n => {
                if ('idchinhanh' in n) return n.idchinhanh == idChiNhanh;
                if ('idcn' in n) return n.idcn == idChiNhanh;
                return true;
            });
        }

        return normalizeData(filtered, tenField, viettatField);
    }

    if (url.endsWith('.json')) {
        return new Promise((resolve, reject) => {
            $.getJSON(url, data => {
                resolve(filterData(data));
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.error(`Lỗi khi tải dữ liệu từ ${url}:`, textStatus, errorThrown);
                resolve([]);
            });
        });
    }

    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                resolve(filterData(data));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(`Lỗi khi gọi API ${url}:`, textStatus, errorThrown);
                resolve([]);
            }
        });
    });
}

function getTomSelectConfigs(allDataThongTin) {
    return [
        {
            className: ".cbPhongThucHien",
            placeholder: "-- Phòng thực hiện --",
            data: allDataThongTin.phongBuong || [],
        },
        {
            className: ".cbPhanLoai",
            placeholder: "-- Phân loại --",
            data: allDataThongTin.phanLoai || [],
        },
        {
            className: ".cbThietBi",
            placeholder: "-- Thiết bị --",
            data: allDataThongTin.thietBi || [],
        },
        {
            className: ".cbBienChung",
            placeholder: "-- Tai biến/biến chứng --",
            data: allDataThongTin.taiBienBienChung || [],
        },
        {
            className: ".cbCheDoThuThuat",
            placeholder: "-- Chế độ thủ thuật --",
            data: allDataThongTin.cheDoThuThuat || [],
        },
        {
            className: ".cbViTriThucHien",
            placeholder: "-- Vị trí thực hiện --",
            data: allDataThongTin.viTriThucHien || [],
        },
        {
            className: ".cbTuVong",
            placeholder: "-- Tử vong --",
            data: allDataThongTin.tuVong || [],
        },
        {
            className: ".cbPTVoCam",
            placeholder: "-- Phương thức vô cảm --",
            data: allDataThongTin.voCam,
        },
    ]
}

function processICDLoading(type, idChanDoanStr, maChanDoanStr, tenChanDoanStr) {
    // 1. Kiểm tra dữ liệu đầu vào
    if (!idChanDoanStr || !maChanDoanStr || !tenChanDoanStr) {
        console.warn(`[ICD Load] Thiếu dữ liệu load cho loại: ${type}`);
        return;
    }

    // 2. Chuẩn bị (Reset State)
    selectedICDs[type] = [];
    const displayArea = document.getElementById(`hien_thi_icd_${type}`);
    if (displayArea) {
        displayArea.innerHTML = '';
    }

    // 3. Phân tách chuỗi thành mảng
    const ids = idChanDoanStr.split(';').map(s => s.trim()).filter(s => s.length > 0);
    const codes = maChanDoanStr.split(';').map(s => s.trim()).filter(s => s.length > 0);
    const names = tenChanDoanStr.split(';').map(s => s.trim()).filter(s => s.length > 0);

    // Kiểm tra số lượng phần tử phải bằng nhau
    if (ids.length !== codes.length || ids.length !== names.length) {
        console.error(`[ICD Load] Lỗi đồng bộ: Số lượng ID (${ids.length}), Mã (${codes.length}), và Tên (${names.length}) không khớp cho loại: ${type}. Bỏ qua load.`, { ids, codes, names });
        return;
    }

    // 4. Lặp và gọi addICDTag
    ids.forEach((id, index) => {
        const ma = codes[index];
        const ten = names[index];

        let finalName = ten;
        if (finalName.startsWith(ma + ':')) {
            finalName = finalName.substring(ma.length + 1).trim();
        }

        // Gọi hàm addICDTag để tạo tag và cập nhật selectedICDs
        addICDTag(type, id, ma, finalName);

        // Log để kiểm tra:
        //console.log(`[ICD Load] Đã thêm: ${type} - ID: ${id}, Mã: ${ma}, Tên: ${finalName}`);
    });
}
function bindDataToForm(data) {
    if (!data) return;

    // Bind dữ liệu vào các trường
    processICDLoading('vao_khoa', data.idChanDoanVao, data.maChanDoanVao, data.tenChanDoanVao);
    processICDLoading('truoc_thuat', data.idChanDoanTruoc, data.maChanDoanTruoc, data.tenChanDoanTruoc);
    processICDLoading('sau_thuat', data.idChanDoanSau, data.maChanDoanSau, data.tenChanDoanSau);

    document.getElementById('can_thiep_thu_thuat').value = data.canThiepThuThuat || '';
    document.getElementById('so_lan_mo_lai').value = data.soLanMoLai || '';
    document.getElementById('ly_do_mo_lai').value = data.lyDoMoLai || '';
    document.getElementById('dan_luu').value = data.danLuu || '';
    document.getElementById('ngay_rut_ong_dan_luu').value =
        moment(data.ngayRutOngDanLuu || new Date()).format("DD-MM-YYYY HH:mm:ss");

    document.getElementById('ngay_cat_chi').value =
        moment(data.ngayCatChi || new Date()).format("DD-MM-YYYY HH:mm:ss");

    //document.getElementById('ngay_rut_ong_dan_luu').value = formatDate(data.ngayRutOngDanLuu);
    //document.getElementById('ngay_cat_chi').value = formatDate(data.ngayCatChi);

    document.getElementById('khac').value = data.khac || '';
    document.getElementById('ma_fna').value = data.maFNA || '';
    document.getElementById('tien_can').value = data.tienCan || '';
    document.getElementById('ket_qua_xet_nghiem').value = data.ketQuaXNFNAGBP || '';
    document.getElementById('chi_dinh_vi_tri_ton_thuong_fna').value = data.chiDinhViTriTonThuongFNA || '';
    document.getElementById('yeu_cau_xet_nghiem').value = data.yeuCauXetNghiem || '';

    if (data.idPhongThucHien) {
        const phongSelect = document.querySelector(".cbPhongThucHien")?.tomselect;
        if (phongSelect) phongSelect.setValue(String(data.idPhongThucHien));
    }

    if (data.idThietBi) {
        const thietBiSelect = document.querySelector(".cbThietBi")?.tomselect;
        if (thietBiSelect) thietBiSelect.setValue(String(data.idThietBi));
    }

    if (data.idLoaiTTPT) {
        const plSelect = document.querySelector(".cbPhanLoai")?.tomselect;
        if (plSelect) plSelect.setValue(String(data.idLoaiTTPT));
    }
    if (data.idTaiBienBienChung) {
        const plSelect = document.querySelector(".cbBienChung")?.tomselect;
        if (plSelect) plSelect.setValue(String(data.idTaiBienBienChung));
    }
    if (data.idCheDoThuThuat) {
        const plSelect = document.querySelector(".cbCheDoThuThuat")?.tomselect;
        if (plSelect) plSelect.setValue(String(data.idCheDoThuThuat));
    }
    if (data.idViTriThucHien) {
        const plSelect = document.querySelector(".cbViTriThucHien")?.tomselect;
        if (plSelect) plSelect.setValue(String(data.idViTriThucHien));
    }
    if (data.idTuVong) {
        const plSelect = document.querySelector(".cbTuVong")?.tomselect;
        if (plSelect) plSelect.setValue(String(data.idTuVong));
    }
    if (data.idPhuongPhapVoCam) {
        const plSelect = document.querySelector(".cbPTVoCam")?.tomselect;
        if (plSelect) plSelect.setValue(data.idPhuongPhapVoCam);
    }
}


var isFormDirty = false;

function markFormAsDirty() {
    isFormDirty = true;
}

function markFormAsClean() {
    isFormDirty = false;
}

// Gắn sự kiện cho các input
function attachDirtyListeners() {
    $('input, select, textarea').on('change input', function () {
        markFormAsDirty();
    });
}

// Gọi sau khi bind data hoặc init form
function initFormState() {
    markFormAsClean();
    attachDirtyListeners();
}

// Kiểm tra trước khi load lại data
function shouldPreventDataReload() {
    if (isFormDirty) {
        return confirm('Bạn có thay đổi chưa lưu. Tiếp tục sẽ mất dữ liệu. Tiếp tục?');
    }
    return true;
}
function loadData(idVaoVien, idChiNhanh, idChiDinhChiTiet) {
    // Kiểm tra xem có nên ngăn load data không
    if (!shouldPreventDataReload()) {
        return; // Người dùng chọn hủy
    }

    if (idVaoVien && idChiNhanh && idChiDinhChiTiet) {
        fetch(`/thu_thuat_phau_thuat/get_thong_tin_chi_tiet?idVaoVien=${idVaoVien}&idChiNhanh=${idChiNhanh}&idChiDinhChiTiet=${idChiDinhChiTiet}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    bindDataToForm(data.data);
                    markFormAsClean(); // Đánh dấu form sạch sau khi load data
                } else {
                    console.error("Lỗi khi tải dữ liệu:", data.message);
                }
            })
            .catch(error => console.error("Lỗi:", error));
    }
}
async function initThongTinTab(idVaoVien, idChiNhanh, idChiDinhChiTiet) {

    resetThongTinState();
    const shouldLoadData = (idVaoVien !== null && idChiNhanh !== null && idChiDinhChiTiet !== null &&
        isNewPatientSelection()); 
    const dataPromises = {
        phongBuong: fetchDataAndNormalize("dist/data/json/DM_PhongBuong.json", 'ten', 'viettat', _idcn),
        phanLoai: fetchDataAndNormalize("dist/data/json/DM_LoaiThuThuatPhauThuat.json", 'ten', 'viettat', _idcn),
        viTriThucHien: fetchDataAndNormalize("/ViTriThucHien/List", 'ten', 'viettat', _idcn),
        taiBienBienChung: fetchDataAndNormalize("/TaiBienBienChung/List", 'ten', 'viettat', _idcn),
        cheDoThuThuat: fetchDataAndNormalize("/CheDoThuThuat/List", 'ten', 'viettat', _idcn),
        thietBi: fetchDataAndNormalize("dist/data/json/CLS_DanhMucMayCls.json", 'ten', 'viettat', _idcn),
        tuVong: fetchDataAndNormalize("/TuVong/List", 'ten', 'viettat', _idcn),
        voCam: fetchDataAndNormalize("dist/data/json/DM_PhuongPhapVoCam.json", 'ten', 'viettat', _idcn),


    };

    const results = await Promise.all(Object.values(dataPromises));
    if (shouldLoadData) {
        loadData(idVaoVien, idChiNhanh, idChiDinhChiTiet);
    }
    if (idVaoVien !== null && idChiNhanh !== null && idChiDinhChiTiet !== null) {
        loadData(idVaoVien, idChiNhanh, idChiDinhChiTiet)
    }

    const keys = Object.keys(dataPromises);
    keys.forEach((key, index) => {
        allDataThongTin[key] = results[index];
    });

    let yhct = window.yhct;
    configureICDTomSelect(yhct);


    const configs = getTomSelectConfigs(allDataThongTin);
    configCbThongTin(configs);
    $('#btn_saveThongTin').on('click', handleSaveThongTin);

}
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return '';

    const dd = String(d.getDate()).padStart(2, '0');
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${MM}-${yyyy}`;
}

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
    $("#info-datetime", window.parent.document).text(formatted);
}
function loadData(idVaoVien, idChiNhanh, idChiDinhChiTiet) {
    if (idVaoVien && idChiNhanh && idChiDinhChiTiet) {
        fetch(`/thu_thuat_phau_thuat/get_thong_tin_chi_tiet?idVaoVien=${idVaoVien}&idChiNhanh=${idChiNhanh}&idChiDinhChiTiet=${idChiDinhChiTiet}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    //console.log("data = ", data.data);
                    bindDataToForm(data.data);
                } else {
                    console.error("Lỗi khi tải dữ liệu:", data.message);
                }
            })
            .catch(error => console.error("Lỗi:", error));
    }
}
function configCbThongTin(configs) {
    configs.forEach((cfg) => {
        const element = document.querySelector(cfg.className);
        if (element && !element.tomselect) {
            const tomSelectInstance = new window.TomSelect(cfg.className, {
                options: cfg.data,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "alias"],
                placeholder: cfg.placeholder,
                dropdownDirection: 'auto',
                //dropdownParent: 'body',
                maxItems: 1,
                render: {
                    option: (data, escape) => `
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span>${escape(data.ten)}</span>
                            <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.alias || "")}</span>
                        </div>`,
                    item: (data, escape) => `
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span>${escape(data.ten)}</span>
                            <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.alias || "")}</span>
                        </div>`,
                },
                no_results: function (data, escape) {
                    return `<div class="no-results" style="padding:6px 10px;color:#999;">
                                Không tìm thấy "${escape(data.input)}"
                            </div>`;
                },
            });

            tomSelectInstance.on('dropdown_open', () => {
                const rect = tomSelectInstance.control.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const dropdown = tomSelectInstance.dropdown;
                const needed = dropdown.offsetHeight || 200;

                if (spaceBelow < needed) {
                    dropdown.classList.add('ts-dropdown-up');
                } else {
                    dropdown.classList.remove('ts-dropdown-up');
                }
            });
        }
    });
}


// ================= XU LY MODAL ========================
// Cập nhật hàm openModal hiện có
function openModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));

    switch (modalId) {
        case 'tuVongModal':
            loadTableData(modalId, allDataThongTin.tuVong, 'tuVong');
            break;
        case 'bienChungModal':
            loadTableData(modalId, allDataThongTin.taiBienBienChung, 'bienChung');
            break;
        case 'cheDoThuThuatModal':
            loadTableData(modalId, allDataThongTin.cheDoThuThuat, 'cheDoThuThuat');
            break;
        case 'viTriThucHienModal':
            loadTableData(modalId, allDataThongTin.viTriThucHien, 'viTriThucHien');
            break;
    }

    modal.show();
}
function createTableRow(stt, item, type) {
    const id = item.id !== undefined ? String(item.id) : String(item.ma);
    const ma = item.ma || '';
    const ten = item.ten || '';

    const editFunctionName = `edit${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const deleteFunctionName = `delete${type.charAt(0).toUpperCase() + type.slice(1)}`;

    return `
        <tr>
            <th scope="row">${stt}</th>
            <td>${ma}</td>
            <td>${ten}</td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-warning me-2" onclick="${editFunctionName}('${id}', '${ma}', '${ten}')">
                    <i class="bi bi-pencil"></i> Sửa
                </button>
                <button type="button" class="btn btn-sm btn-danger" onclick="${deleteFunctionName}('${id}')">
                    <i class="bi bi-trash"></i> Xóa
                </button>
            </td>
        </tr>
    `;
}

function loadTableData(modalId, dataArray, dataKey) {
    const tableBodyId = `${modalId.replace('Modal', 'TableBody')}`;
    const tableBody = document.getElementById(tableBodyId);

    if (!tableBody) {
        console.error(`Không tìm thấy table body với ID: ${tableBodyId}`);
        return;
    }

    tableBody.innerHTML = ''; 

    if (Array.isArray(dataArray)) {
        dataArray.forEach((item, index) => {
            const row = createTableRow(index + 1, item, dataKey);
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    }
}
function resetModalForm(modalId, defaultTitle) {
    const formId = modalId.replace('Modal', 'Form');
    const idFieldId = modalId.replace('Modal', 'Id');
    const titleId = modalId.replace('Modal', 'Label');
    const cancelBtnId = modalId.replace('Modal', 'CancelBtn');

    const formElement = document.getElementById(formId);
    if (formElement) {
        formElement.reset();
    }

    const idField = document.getElementById(idFieldId);
    if (idField) {
        idField.value = '';
    }

    const titleElement = document.getElementById(titleId);
    if (titleElement && defaultTitle) {
        titleElement.textContent = defaultTitle;
    }

    const cancelBtn = document.getElementById(cancelBtnId);
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
}

// TU VONG
function resetTuVongForm() {
    resetModalForm('tuVongModal', "Thêm/Chỉnh sửa tử vong");
}
function editTuVong(id, ma, ten) {
    document.getElementById('tuVongId').value = id;
    document.getElementById('tuVongMa').value = ma;
    document.getElementById('tuVongTen').value = ten;

    document.getElementById('tuVongModalLabel').textContent = "Chỉnh sửa danh mục tử vong";
    const cancelBtn = document.getElementById('tuVongCancelBtn');
    if (cancelBtn) {
        cancelBtn.style.display = 'block';
    }
    const formElement = document.getElementById('tuVongForm');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
    }
}
function updateTuVongTableAndSelect(newData) {
    allDataThongTin.tuVong = newData;

    refreshTomSelect('.cbTuVong', allDataThongTin.tuVong);

    loadTableData('tuVongModal', allDataThongTin.tuVong, 'tuVong');
}
async function saveTuVong() {
    const id = document.getElementById('tuVongId').value;
    const ma = document.getElementById('tuVongMa').value;
    const ten = document.getElementById('tuVongTen').value;
    const isEditing = id !== null && id !== '';

    if (!ma) {
        toastr.error('Vui lòng nhập đầy đủ mã mục tử vong!', "Thông báo");
        document.getElementById('tuVongMa').focus();
        return;
    }
    if (!ten) {
        toastr.error('Vui lòng nhập đầy đủ tên mục tử vong!', "Thông báo");
        document.getElementById('tuVongTen').focus();
        return;
    }

    const dataToSend = {
        ID: isEditing ? parseInt(id) : 0,
        Ma: ma,
        Ten: ten,
        Active: true
    };

    const endpoint = isEditing ? `/TuVong/Update/${id}` : '/TuVong/Create';
    const method = isEditing ? 'PUT' : 'POST';
    const successMessage = isEditing ? "Cập nhật mục tử vong thành công" : "Thêm mục tử vong thành công";

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();

        if (response.ok && result.success) {

            const newItem = {
                id: result.data.id || result.data.ID,
                ma: result.data.ma || result.data.Ma,
                ten: result.data.ten || result.data.Ten,
                alias: result.data.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
            };

            let currentData = allDataThongTin.tuVong;

            if (isEditing) {
                const index = currentData.findIndex(item => String(item.id) === String(newItem.id));
                if (index !== -1) {
                    currentData[index] = newItem;
                }
            } else {
                currentData.push(newItem);
            }

            updateTuVongTableAndSelect(currentData);
            resetTuVongForm(); 

            toastr.success(successMessage, "Thông báo");

        } else {
            const errorMessage = result.message || 'Có lỗi xảy ra khi lưu mục tử vong!';
            toastr.error(errorMessage, "Thông báo");
        }
    } catch (error) {
        console.error(`[v0] Error saving tử vong (method: ${method}):`, error);
        toastr.error('Lỗi kết nối hoặc lỗi server khi lưu thông tin.', "Thông báo");
    }
}
async function deleteTuVong(id) {
    if (!confirm(`Bạn có chắc chắn muốn VÔ HIỆU HÓA danh mục có ID: ${id} này?`)) {
        return; 
    }

    const endpoint = `/TuVong/UpdateTrangThai/${id}`;

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            toastr.success(`Đã vô hiệu hóa danh mục ID: ${id} thành công!`, "Thông báo");

            let currentData = allDataThongTin.tuVong;
            const index = currentData.findIndex(item => String(item.id || item.ID) === String(id));

            if (index !== -1) {
                currentData[index].Active = false;

                const activeData = currentData.filter(item => item.Active !== false);

                updateTuVongTableAndSelect(activeData);

            } else {
                console.warn("Không tìm thấy item trong mảng local. Cần fetch lại danh sách.");
            }

        } else {
            const errorMessage = result.message || `Lỗi khi vô hiệu hóa ID: ${id}.`;
            toastr.error(errorMessage, "Thông báo");
        }
    } catch (error) {
        console.error(`[v0] Error calling UpdateTrangThai:`, error);
        toastr.error('Lỗi kết nối hoặc lỗi server khi vô hiệu hóa danh mục.', "Thông báo");
    }
}
//BIEN CHUNG/ TAI BIEN
function resetBienChungForm() {
    resetModalForm('bienChungModal', "Thêm/Chỉnh sửa tai biến/biến chứng");
}
function updateBienChungTableAndSelect(newData) {
    allDataThongTin.taiBienBienChung = newData;
    refreshTomSelect('.cbBienChung', allDataThongTin.taiBienBienChung);
    loadTableData('bienChungModal', allDataThongTin.taiBienBienChung, 'bienChung');
}
function editBienChung(id, ma, ten) {
    document.getElementById('bienChungId').value = id;
    document.getElementById('bienChungMa').value = ma;
    document.getElementById('bienChungTen').value = ten;

    document.getElementById('bienChungModalLabel').textContent = "Chỉnh sửa Tai biến/Biến chứng";

    const cancelBtn = document.getElementById('bienChungCancelBtn');
    if (cancelBtn) {
        cancelBtn.style.display = 'block';
    }

    const formElement = document.getElementById('bienChungForm');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
    }
}
async function saveBienChung() {
    const id = document.getElementById('bienChungId').value;
    const ma = document.getElementById('bienChungMa').value;
    const ten = document.getElementById('bienChungTen').value;
    const isEditing = id !== null && id !== '';

    if (!ma) {
        toastr.error('Vui lòng nhập đầy đủ mã biến chứng!', "Thông báo");
        document.getElementById('bienChungMa').focus();
        return;
    }
    if (!ten) {
        toastr.error('Vui lòng nhập đầy đủ tên biến chứng!', "Thông báo");
        document.getElementById('bienChungTen').focus();
        return;
    }

    const dataToSend = {
        ID: isEditing ? parseInt(id) : 0,
        Ma: ma,
        Ten: ten,
        Active: true 
    };

    const endpoint = isEditing ? `/TaiBienBienChung/Update/${id}` : '/TaiBienBienChung/Create';
    const method = isEditing ? 'PUT' : 'POST';
    const successMessage = isEditing ? "Cập nhật tai biến/biến chứng thành công" : "Thêm mới tai biến/biến chứng thành công";

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();

        if (response.ok && result.success) {

            const newItem = {
                id: result.data.id || result.data.ID,
                ma: result.data.ma || result.data.Ma,
                ten: result.data.ten || result.data.Ten,
                alias: result.data.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
            };

            let currentData = allDataThongTin.taiBienBienChung;

            if (isEditing) {
                const index = currentData.findIndex(item => String(item.id) === String(newItem.id));
                if (index !== -1) {
                    currentData[index] = newItem;
                }
            } else {
                currentData.push(newItem);
            }

            updateBienChungTableAndSelect(currentData);
            resetBienChungForm();

            toastr.success(successMessage, "Thông báo");

        } else {
            const errorMessage = result.message || 'Có lỗi xảy ra khi lưu tai biến/biến chứng!';
            toastr.error(errorMessage, "Thông báo");
        }
    } catch (error) {
        console.error(`[v0] Error saving biến chứng (method: ${method}):`, error);
        toastr.error('Lỗi kết nối hoặc lỗi server khi lưu thông tin.', "Thông báo");
    }
}
async function deleteBienChung(id) {
    if (!confirm(`Bạn có chắc chắn muốn VÔ HIỆU HÓA danh mục tai biến/biến chứng ID: ${id} này?`)) {
        return;
    }

    const endpoint = `/TaiBienBienChung/UpdateTrangThai/${id}`;

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            toastr.success(`Đã vô hiệu hóa danh mục ID: ${id} thành công!`, "Thông báo");

            let currentData = allDataThongTin.taiBienBienChung;
            const index = currentData.findIndex(item => String(item.id || item.ID) === String(id));

            if (index !== -1) {
                currentData[index].Active = false;

                const activeData = currentData.filter(item => item.Active !== false);

                updateBienChungTableAndSelect(activeData);

            } else {
                console.warn("Không tìm thấy item trong mảng local. Cần fetch lại danh sách.");
            }

        } else {
            const errorMessage = result.message || `Lỗi khi vô hiệu hóa ID: ${id}.`;
            toastr.error(errorMessage, "Thông báo");
        }
    } catch (error) {
        console.error(`[v0] Error calling UpdateTrangThai:`, error);
        toastr.error('Lỗi kết nối hoặc lỗi server khi vô hiệu hóa danh mục.', "Thông báo");
    }
}

//CHE DO THU THUAT
function resetCheDoThuThuatForm() {
    resetModalForm('cheDoThuThuatModal', "Thêm chế độ thủ thuật mới");
}
function updateCheDoThuThuatTableAndSelect(newData) {
    allDataThongTin.cheDoThuThuat = newData;
    refreshTomSelect('.cbCheDoThuThuat', allDataThongTin.cheDoThuThuat);
    loadTableData('cheDoThuThuatModal', allDataThongTin.cheDoThuThuat, 'cheDoThuThuat');
}
function editCheDoThuThuat(id, ma, ten) {
    document.getElementById('cheDoThuThuatId').value = id;
    document.getElementById('cheDoThuThuatMa').value = ma;
    document.getElementById('cheDoThuThuatTen').value = ten;

    document.getElementById('cheDoThuThuatModalLabel').textContent = "Chỉnh sửa chế độ thủ thuật";
    const cancelBtn = document.getElementById('cheDoThuThuatCancelBtn');
    if (cancelBtn) {
        cancelBtn.style.display = 'block';
    }
    const formElement = document.getElementById('cheDoThuThuatForm');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
    }
}
async function deleteCheDoThuThuat(id) {
    if (!confirm(`Bạn có chắc chắn muốn VÔ HIỆU HÓA danh mục chế độ thủ thuật ID: ${id} này?`)) {
        return;
    }

    const endpoint = `/CheDoThuThuat/UpdateTrangThai/${id}`;

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            toastr.success(`Đã vô hiệu hóa danh mục ID: ${id} thành công!`, "Thông báo");

            let currentData = allDataThongTin.cheDoThuThuat;
            const index = currentData.findIndex(item => String(item.id || item.ID) === String(id));

            if (index !== -1) {
                currentData[index].Active = false;

                const activeData = currentData.filter(item => item.Active !== false);

                updateCheDoThuThuatTableAndSelect(activeData);

            } else {
                console.warn("Không tìm thấy item trong mảng local. Cần fetch lại danh sách.");
            }

        } else {
            const errorMessage = result.message || `Lỗi khi vô hiệu hóa ID: ${id}.`;
            toastr.error(errorMessage, "Thông báo");
        }
    } catch (error) {
        console.error(`[v0] Error calling UpdateTrangThai:`, error);
        toastr.error('Lỗi kết nối hoặc lỗi server khi vô hiệu hóa danh mục.', "Thông báo");
    }
}
async function saveCheDoThuThuat() {
    const id = document.getElementById('cheDoThuThuatId').value;
    const ma = document.getElementById('cheDoThuThuatMa').value;
    const ten = document.getElementById('cheDoThuThuatTen').value;
    const isEditing = id !== null && id !== '';

    if (!ma) {
        toastr.error('Vui lòng nhập đầy đủ mã chế độ thủ thuật!', "Thông báo");
        document.getElementById('cheDoThuThuatMa').focus();
        return;
    }
    if (!ten) {
        toastr.error('Vui lòng nhập đầy đủ tên chế độ thủ thuật!', "Thông báo");
        document.getElementById('cheDoThuThuatTen').focus();
        return;
    }

    const dataToSend = {
        ID: isEditing ? parseInt(id) : 0,
        Ma: ma,
        Ten: ten,
        Active: true
    };

    const endpoint = isEditing ? `/CheDoThuThuat/Update/${id}` : '/CheDoThuThuat/Create';
    const method = isEditing ? 'PUT' : 'POST';
    const successMessage = isEditing ? "Cập nhật chế độ thủ thuật thành công" : "Thêm mới chế độ thủ thuật thành công";

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();

        if (response.ok && result.success) {

            const newItem = {
                id: result.data.id || result.data.ID,
                ma: result.data.ma || result.data.Ma,
                ten: result.data.ten || result.data.Ten,
                alias: result.data.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
            };

            let currentData = allDataThongTin.cheDoThuThuat;

            if (isEditing) {
                const index = currentData.findIndex(item => String(item.id) === String(newItem.id));
                if (index !== -1) {
                    currentData[index] = newItem;
                }
            } else {
                currentData.push(newItem);
            }

            updateCheDoThuThuatTableAndSelect(currentData);
            resetCheDoThuThuatForm();

            toastr.success(successMessage, "Thông báo");

        } else {
            const errorMessage = result.message || 'Có lỗi xảy ra khi lưu chế độ thủ thuật!';
            toastr.error(errorMessage, "Thông báo");
        }
    } catch (error) {
        console.error(`[v0] Error saving chế độ thủ thuật (method: ${method}):`, error);
        toastr.error('Lỗi kết nối hoặc lỗi server khi lưu thông tin.', "Thông báo");
    }
}

// VI TRI THUC HIEN
function resetViTriThucHienForm() {
    resetModalForm('viTriThucHienModal', "Thêm vị trí thực hiện mới");
}
function updateViTriThucHienTableAndSelect(newData) {
    allDataThongTin.viTriThucHien = newData;

    refreshTomSelect('.cbViTriThucHien', allDataThongTin.viTriThucHien);

    loadTableData('viTriThucHienModal', allDataThongTin.viTriThucHien, 'viTriThucHien');
}
function editViTriThucHien(id, ma, ten) {
    document.getElementById('viTriThucHienId').value = id;
    document.getElementById('viTriThucHienMa').value = ma;
    document.getElementById('viTriThucHienTen').value = ten;

    document.getElementById('viTriThucHienModalLabel').textContent = "Chỉnh sửa Vị trí Thực hiện";
    const cancelBtn = document.getElementById('viTriThucHienCancelBtn');
    if (cancelBtn) {
        cancelBtn.style.display = 'block';
    }
    const formElement = document.getElementById('viTriThucHienForm');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
    }
}
async function saveViTriThucHien() {
    const id = document.getElementById('viTriThucHienId').value;
    const ma = document.getElementById('viTriThucHienMa').value;
    const ten = document.getElementById('viTriThucHienTen').value;
    const isEditing = id !== null && id !== '';

    if (!ma) {
        toastr.error('Vui lòng nhập đầy đủ mã vị trí thực hiện!', "Thông báo");
        document.getElementById('viTriThucHienMa').focus();
        return;
    }
    if (!ten) {
        toastr.error('Vui lòng nhập đầy đủ tên vị trí thực hiện!', "Thông báo");
        document.getElementById('viTriThucHienTen').focus();
        return;
    }

    const dataToSend = {
        ID: isEditing ? parseInt(id) : 0,
        Ma: ma,
        Ten: ten,
        Active: true
    };

    const endpoint = isEditing ? `/ViTriThucHien/Update/${id}` : '/ViTriThucHien/Create';
    const method = isEditing ? 'PUT' : 'POST';
    const successMessage = isEditing ? "Cập nhật vị trí thực hiện thành công" : "Thêm vị trí thực hiện thành công";

    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });

        const result = await response.json();

        if (response.ok && result.success) {

            const newItem = {
                id: result.data.id || result.data.ID,
                ma: result.data.ma || result.data.Ma,
                ten: result.data.ten || result.data.Ten,
                alias: result.data.ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("")
            };

            let currentData = allDataThongTin.viTriThucHien;

            if (isEditing) {
                const index = currentData.findIndex(item => String(item.id) === String(newItem.id));
                if (index !== -1) {
                    currentData[index] = newItem;
                }
            } else {
                currentData.push(newItem);
            }

            updateViTriThucHienTableAndSelect(currentData);
            resetViTriThucHienForm();
            toastr.success(successMessage, "Thông báo");

        } else {
            const errorMessage = result.message || 'Có lỗi xảy ra khi lưu vị trí thực hiện!';
            toastr.error(errorMessage, "Thông báo");
        }
    } catch (error) {
        console.error(`[v0] Error saving vị trí thực hiện (method: ${method}):`, error);
        toastr.error('Lỗi kết nối hoặc lỗi server khi lưu thông tin.', "Thông báo");
    }
}
async function deleteViTriThucHien(id) {
    if (!confirm(`Bạn có chắc chắn muốn VÔ HIỆU HÓA danh mục vị trí thực hiện ID: ${id} này?`)) {
        return;
    }

    const endpoint = `/ViTriThucHien/UpdateTrangThai/${id}`;

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            toastr.success(`Đã vô hiệu hóa danh mục ID: ${id} thành công!`, "Thông báo");

            let currentData = allDataThongTin.viTriThucHien;
            const index = currentData.findIndex(item => String(item.id || item.ID) === String(id));

            if (index !== -1) {
                currentData[index].Active = false;

                const activeData = currentData.filter(item => item.Active !== false);

                updateViTriThucHienTableAndSelect(activeData);

            } else {
                console.warn("Không tìm thấy item trong mảng local. Cần fetch lại danh sách.");
            }

        } else {
            const errorMessage = result.message || `Lỗi khi vô hiệu hóa ID: ${id}.`;
            toastr.error(errorMessage, "Thông báo");
        }
    } catch (error) {
        console.error(`[v0] Error calling UpdateTrangThai:`, error);
        toastr.error('Lỗi kết nối hoặc lỗi server khi vô hiệu hóa danh mục.', "Thông báo");
    }
}

document.getElementById('cheDoThuThuatModal').addEventListener('hide.bs.modal', function (e) {
    resetCheDoThuThuatForm();
    const resetFn = getResetFunction(modalId);
    if (resetFn) {
        resetFn();
    }
});
document.getElementById('bienChungModal').addEventListener('hide.bs.modal', function (e) {
    resetBienChungForm();
    const resetFn = getResetFunction(modalId);
    if (resetFn) {
        resetFn();
    }
});
document.getElementById('viTriThucHienModal').addEventListener('hide.bs.modal', function (e) {
    resetViTriThucHienForm();
    const resetFn = getResetFunction(modalId);
    if (resetFn) {
        resetFn();
    }
});
document.getElementById('tuVongModal').addEventListener('hide.bs.modal', function (e) {
    resetTuVongForm();
    const resetFn = getResetFunction(modalId);
    if (resetFn) {
        resetFn();
    }
});

function refreshTomSelect(selector, newData) {
    const tomSelectInstance = document.querySelector(selector).tomselect;
    if (tomSelectInstance) {
        tomSelectInstance.clearOptions();
        newData.forEach(item => {
            tomSelectInstance.addOption(item);
        });
        tomSelectInstance.refreshOptions(false);
    }
}

//==================== SAVE THÔNG TIN TRƯỜNG TRÌNH =======================
function validateForm() {
    $('.validation-error').removeClass('validation-error');

    const fieldsToValidate = [
        { data: selectedICDs.vao_khoa, element: '.cbCDVaoKhoa', name: 'Chẩn đoán vào khoa' },
        { data: selectedICDs.truoc_thuat, element: '.cbTruocThuThuat', name: 'Chẩn đoán trước thủ thuật' },
        { data: selectedICDs.sau_thuat, element: '.cbSauThuThuat', name: 'Chẩn đoán sau thủ thuật' },
        { data: $('.cbPhongThucHien').val(), element: '.cbPhongThucHien', name: 'Phòng thực hiện' },
        { data: $('.cbPhanLoai').val(), element: '.cbPhanLoai', name: 'Phân loại' },
        { data: $('.cbThietBi').val(), element: '.cbThietBi', name: 'Thiết bị' },
        { data: $('.cbViTriThucHien').val(), element: '.cbViTriThucHien', name: 'Vị trí thực hiện' },
        { data: $('.cbBienChung').val(), element: '.cbBienChung', name: 'Biến chứng' },
        { data: $('.cbPTVoCam').val(), element: '.cbPTVoCam', name: 'Phương pháp vô cảm' },
        { data: $('.cbCheDoThuThuat').val(), element: '.cbCheDoThuThuat', name: 'Chế độ thủ thuật' },
        { data: $('.cbTuVong').val(), element: '.cbTuVong', name: 'Tử vong' },
        { data: $('#ma_fna').val(), element: '#ma_fna', name: 'Mã FNA' },
        { data: $('#tien_can').val(), element: '#tien_can', name: 'Tiền căn' },

    ];

    let isValid = true;
    let firstErrorElement = null;
    let firstErrorName = '';

    for (const field of fieldsToValidate) {
        let isFieldInvalid = false;

        if (field.data && typeof field.data.size === 'number') {
            isFieldInvalid = field.data.size === 0;
        } else if (Array.isArray(field.data)) {
            isFieldInvalid = field.data.length === 0;
        }

        else if (!field.data) {
            isFieldInvalid = true;
        }

        if (isFieldInvalid) {
            isValid = false;
            if (!firstErrorElement) {
                firstErrorElement = $(field.element);
                firstErrorName = field.name;
            }

            const tomSelectWrapper = $(field.element).next('.ts-wrapper').length ?
                $(field.element).next('.ts-wrapper') :
                $(field.element);
            tomSelectWrapper.addClass('validation-error');

            if (field.element.includes('cbCDVaoKhoa')) {
                $('#hien_thi_icd_vao_khoa').addClass('validation-error');
            } else if (field.element.includes('cbTruocThuThuat')) {
                $('#hien_thi_icd_truoc_thuat').addClass('validation-error');
            } else if (field.element.includes('cbSauThuThuat')) {
                $('#hien_thi_icd_sau_thuat').addClass('validation-error');
            }
        }
    }

    if (!isValid) {
        if (typeof toastr !== 'undefined') {
            toastr.error(`Vui lòng nhập thông tin: ${firstErrorName}.`);
        }

        if (firstErrorElement) {
            $('html, body').animate({
                scrollTop: firstErrorElement.offset().top - 100
            }, 500);

            const inputInsideTomSelect = firstErrorElement.next('.ts-wrapper').find('input[type="select-one"]');
            if (inputInsideTomSelect.length) {
                inputInsideTomSelect.focus();
            } else {
                firstErrorElement.focus();
            }
        }
    }

    return isValid;
}
async function handleSaveThongTin() {
    //if (!validateForm()) {
    //    return;
    //}

    const idPhieuTTPT = window.IDPhieuTTPT;

    const maIcdVaoKhoaArray = selectedICDs.vao_khoa.map(item => item.ma);
    const maIcdTruocThuatArray = selectedICDs.truoc_thuat.map(item => item.ma);
    const maIcdSauThuatArray = selectedICDs.sau_thuat.map(item => item.ma);
    const idIcdVaoKhoaArray = selectedICDs.vao_khoa.map(item => item.id);
    const idIcdTruocThuatArray = selectedICDs.truoc_thuat.map(item => item.id);
    const idIcdSauThuatArray = selectedICDs.sau_thuat.map(item => item.id);

    const idIcdVaoKhoa = idIcdVaoKhoaArray.join(';');
    const idIcdTruocThuat = idIcdTruocThuatArray.join(';');
    const idIcdSauThuat = idIcdSauThuatArray.join(';');

    const maIcdVaoKhoa = maIcdVaoKhoaArray.join(';');
    const maIcdTruocThuat = maIcdTruocThuatArray.join(';');
    const maIcdSauThuat = maIcdSauThuatArray.join(';');
    const tenICDVaoKhoa = $('#ten_icd_vao_khoa').val();
    const tenICDTruoc = $('#ten_icd_truoc_thuat').val();
    const tenICDSau = $('#ten_icd_sau_thuat').val();

    const maPhongThucHien = $('.cbPhongThucHien').val();
    const maPhanLoai = $('.cbPhanLoai').val();
    const maThietBi = $('.cbThietBi').val();
    const maBienChung = $('.cbBienChung').val();
    const maCheDoThuThuat = $('.cbCheDoThuThuat').val();
    const maViTriThucHien = $('.cbViTriThucHien').val();
    const maTuVong = $('.cbTuVong').val();

    const canThiepThuThuat = $('#can_thiep_thu_thuat').val()?.trim() || null;
    const soLanMoLaiRaw = $('#so_lan_mo_lai').val();
    const soLanMoLai = soLanMoLaiRaw ? parseInt(soLanMoLaiRaw) : 0;
    const lyDoMoLai = $('#ly_do_mo_lai').val()?.trim() || null;
    const danLuu = $('#dan_luu').val()?.trim() || null;
    //const ngayRutOngDanLuu = $('#ngay_rut_ong_dan_luu').val() || null;
    //const ngayCatChi = $('#ngay_cat_chi').val() || null;
    var ngayCatChi = moment($('#ngay_cat_chi').val(), "DD-MM-YYYY HH:mm:ss");
    var ngayRutOngDanLuu = moment($('#ngay_rut_ong_dan_luu').val(), "DD-MM-YYYY HH:mm:ss");



    const khac = $('#khac').val()?.trim() || null;

    const maFna = $('#ma_fna').val()?.trim() || null;
    const tienCan = $('#tien_can').val()?.trim() || null;
    const ketQuaXetNghiem = $('#ket_qua_xet_nghiem').val()?.trim() || null;
    const chiDinhViTriTonThuongFNA = $('#chi_dinh_vi_tri_ton_thuong_fna').val()?.trim() || null;
    const yeuCauXetNghiem = $('#yeu_cau_xet_nghiem').val()?.trim() || null;

    const idPhuongPhapVoCam = $('.cbPTVoCam').val();

    const dataToSend = {
        IDPhieuTTPT: idPhieuTTPT,
        IDChanDoanVao: Array.isArray(idIcdVaoKhoa) ? idIcdVaoKhoa.join(';') : idIcdVaoKhoa,
        IDChanDoanTruoc: Array.isArray(idIcdTruocThuat) ? idIcdTruocThuat.join(';') : idIcdTruocThuat,
        IDChanDoanSau: Array.isArray(idIcdSauThuat) ? idIcdSauThuat.join(';') : idIcdSauThuat,
        MaChanDoanVao: Array.isArray(maIcdVaoKhoa) ? maIcdVaoKhoa.join(';') : maIcdVaoKhoa,
        MaChanDoanTruoc: Array.isArray(maIcdTruocThuat) ? maIcdTruocThuat.join(';') : maIcdTruocThuat,
        MaChanDoanSau: Array.isArray(maIcdSauThuat) ? maIcdSauThuat.join(';') : maIcdSauThuat,
        TenChanDoanVao: tenICDVaoKhoa,
        TenChanDoanTruoc: tenICDTruoc,
        TenChanDoanSau: tenICDSau,

        IDPhongThucHien: getValueOrNull(maPhongThucHien),
        IDLoaiTTPT: getValueOrNull(maPhanLoai),
        IDThietBi: getValueOrNull(maThietBi),
        CanThiepThuThuat: canThiepThuThuat,
        IDTaiBienBienChung: getValueOrNull(maBienChung),
        IDCheDoThuThuat: getValueOrNull(maCheDoThuThuat),
        SoLanMoLai: getValueOrNull(soLanMoLai),
        LyDoMoLai: lyDoMoLai,
        IDViTriThucHien: getValueOrNull(maViTriThucHien),
        IDTuVong: getValueOrNull(maTuVong),
        DanLuu: danLuu,
        //NgayRutOngDanLuu: toIsoDate(ngayRutOngDanLuu),
        //NgayCatChi: toIsoDate(ngayCatChi),
        NgayCatChi: ngayCatChi.isValid() ? ngayCatChi.format("YYYY-MM-DDTHH:mm:ss") : null,
        NgayRutOngDanLuu: ngayRutOngDanLuu.isValid() ? ngayRutOngDanLuu.format("YYYY-MM-DDTHH:mm:ss") : null,
        Khac: khac,

        MaFNA: maFna,
        TienCan: tienCan,
        KetQuaXNFNAGBP: ketQuaXetNghiem,
        ChiDinhViTriTonThuongFNA: chiDinhViTriTonThuongFNA,
        YeuCauXetNghiem: yeuCauXetNghiem,

        IDPhuongPhapVoCam: getValueOrNull(idPhuongPhapVoCam)
    };

    //console.log("-> Dữ liệu Thông Tin Thủ Thuật gửi đi:", dataToSend);

    $.ajax({
        url: "/thu_thuat_phau_thuat/thong-tin/save-thong-tin",
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function (response) {
            //console.log("Lưu dữ liệu Thông Tin Thủ Thuật thành công:", response);
            if (response.success) {
                if (typeof toastr !== 'undefined') {
                    toastr.success("Đã lưu thông tin thủ thuật thành công!");
                }
            } else {
                if (typeof toastr !== 'undefined') {
                    toastr.error(`Lỗi khi lưu: ${response.message || 'Lỗi server không rõ'}`);
                }
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Lỗi AJAX khi lưu Thông Tin Thủ Thuật:", { jqXHR, textStatus, errorThrown });
            if (typeof toastr !== 'undefined') {
                toastr.error("Lỗi kết nối hoặc lỗi server khi lưu thông tin.");
            }
        }
    });
}
function getValueOrNull(value) {
    if (value === "" || value === undefined || value === null) {
        return null;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return null;
    }
    return value;
}


