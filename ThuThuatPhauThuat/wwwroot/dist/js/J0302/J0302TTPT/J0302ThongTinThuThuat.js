(function () {
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


const sampleDataThongTin = {
    phanLoai: [
        { id: "PL01", ma: "PL01", ten: "Phẫu thuật", alias: "PT" },
        { id: "PL02", ma: "PL02", ten: "Thủ thuật", alias: "TT" },
        { id: "PL03", ma: "PL03", ten: "Chẩn đoán hình ảnh", alias: "CDHA" },
    ],
    thietBi: [
        { id: "TB01", ma: "TB01", ten: "Máy nội soi", alias: "MNS" },
        { id: "TB02", ma: "TB02", ten: "Máy siêu âm", alias: "MSA" },
        { id: "TB03", ma: "TB03", ten: "Máy X-quang", alias: "MXQ" },
    ],
    taiBienBienChung: [
        { id: "TBBC01", ma: "TBBC01", ten: "Chảy máu", alias: "CM" },
        { id: "TBBC02", ma: "TBBC02", ten: "Nhiễm trùng", alias: "NT" },
        { id: "TBBC03", ma: "TBBC03", ten: "Tổn thương thần kinh", alias: "TTTK" },
    ],
    cheDoThuThuat: [
        { id: "CD01", ma: "CD01", ten: "Thông thường", alias: "TT" },
        { id: "CD02", ma: "CD02", ten: "Khẩn cấp", alias: "KC" },
        { id: "CD03", ma: "CD03", ten: "Cấp cứu", alias: "CC" },
    ],
    viTriThucHien: [
        { id: "VT01", ma: "VT01", ten: "Phòng mổ", alias: "PM" },
        { id: "VT02", ma: "VT02", ten: "Phòng tiểu phẫu", alias: "PTP" },
        { id: "VT03", ma: "VT03", ten: "Phòng cấp cứu", alias: "PCC" },
    ],
    tuVong: [
        { id: 1, ma: "TV01", ten: "Trong 24 giờ", alias: "24h" },
        { id: 2, ma: "TV02", ten: "Trong 7 ngày", alias: "7N" },
        { id: 3, ma: "TV03", ten: "Không tử vong", alias: "KTV" },
    ],
    voCam: [
        { id:1, ma: "VC01", ten: "Gây tê", alias: "GT" },
        { id: 2, ma: "VC02", ten: "Gây mê", alias: "GM" },
        { id: 3, ma: "VC03", ten: "Châm tê", alias: "CT" },
    ],
}

let icdData = []

const selectedICDs = {
    vao_khoa: [],
    truoc_thuat: [],
    sau_thuat: [],
}
function normalizeICDData(data) {
    if (!Array.isArray(data)) {
        console.error("ICD data is not an array:", data);
        return [];
    }
    return data.map(item => ({
        ma: item.MaBenh,
        ten: item.TenBenh,
        alias: item.viettat || "",
        id: item.id !== undefined ? item.id : item.MaBenh, // Đảm bảo luôn có id
        active: item.active !== undefined ? item.active : true,
    }));
}
async function loadICDData() {  
    try {
        const response = await fetch("dist/data/json/DM_ICD.json")
        const data = await response.json()
        icdData = normalizeICDData(data)
        console.log("[v0] Loaded ICD data:", icdData.length, "items")
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
    console.log("selectedICDs = ", selectedICDs);
    console.log(`[v0] Added ICD tag: ${icdCode} (${icdId}) to ${type}`)
}
function processICDLoading(type, maChanDoanStr) {
    console.log("icdData = ", icdData);
    if (!maChanDoanStr) return;

    selectedICDs[type] = [];
    const displayArea = document.getElementById(`hien_thi_icd_${type}`);
    displayArea.innerHTML = '';

    const maCodes = maChanDoanStr.split(',').map(m => m.trim()).filter(m => m.length > 0);

    maCodes.forEach(code => {
        
        const icdItem = icdData.find(item => item.id == code);
        console.log("Ma ICD : id ", code, icdItem);
        if (icdItem) {
            addICDTag(type, icdItem.id, icdItem.ma, icdItem.ten);
        } else {
            console.warn(`[v0] Mã ICD không tìm thấy trong dữ liệu tra cứu: ${code}`);
        }
    });

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

    console.log(`[v0] Removed ICD tag with ID: ${icdId} from ${type}`)
}

function updateICDTextArea(type) {
    const textArea = document.getElementById(`ten_icd_${type}`)
    const diseaseNames = selectedICDs[type].map((item) => item.ten).join("; ")
    textArea.value = diseaseNames
}

function configureICDTomSelect() {
    const icdConfigs = [
        { className: ".cbCDVaoKhoa", type: "vao_khoa", displayType: "vao_khoa" },
        { className: ".cbTruocThuThuat", type: "truoc_thuat", displayType: "truoc_thuat" },
        { className: ".cbSauThuThuat", type: "sau_thuat", displayType: "sau_thuat" },
    ];

    icdConfigs.forEach((config) => {
        const element = document.querySelector(config.className);
        if (element && !element.tomselect) { 
            new window.TomSelect(element, {
                options: icdData,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "ma"],
                placeholder: "-- Mã ICD --",
                maxItems: 1,
                render: {
                    option: (data, escape) => `
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span><strong>${escape(data.ma)}</strong></span>
                        </div>`,
                    item: (data, escape) => `
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span><strong>${escape(data.ma)}</strong></span>
                        </div>`,
                },
                onChange: function (value) {
                    if (value) {
                        const selectedItem = icdData.find((item) => String(item.id) === value);
                        if (selectedItem) {
                            addICDTag(config.displayType, selectedItem.id, selectedItem.ma, selectedItem.ten);
                            this.clear();
                        }
                    }
                },
            });
        }
    });
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

/**
 * Định nghĩa cấu hình TomSelect với dữ liệu đã được tải
 * @param {object} allData - Object chứa tất cả các mảng dữ liệu đã tải
 */
function getTomSelectConfigs(allData) {
    return [
        {
            className: ".cbPhongThucHien",
            placeholder: "-- Phòng thực hiện --",
            data: allData.phongBuong || [],
        },
        {
            className: ".cbPhanLoai",
            placeholder: "-- Phân loại --",
            data: allData.phanLoai || [],
        },
        {
            className: ".cbThietBi",
            placeholder: "-- Thiết bị --",
            data: allData.thietBi || [],
        },
        {
            className: ".cbBienChung",
            placeholder: "-- Tai biến/biến chứng --",
            data: allData.taiBienBienChung || [],
        },
        {
            className: ".cbCheDoThuThuat",
            placeholder: "-- Chế độ thủ thuật --",
            data: allData.cheDoThuThuat || [],
        },
        {
            className: ".cbViTriThucHien",
            placeholder: "-- Vị trí thực hiện --",
            data: allData.viTriThucHien || [],
        },
        {
            className: ".cbTuVong",
            placeholder: "-- Tử vong --",
            data: sampleDataThongTin.tuVong,
        },
        {
            className: ".cbPTVoCam",
            placeholder: "-- Phương thức vô cảm --",
            data: sampleDataThongTin.voCam,
        },
    ]
}
$(function () {
    $('#ngay_rut_ong_dan_luu').datepicker({
        format: "dd-mm-yyyy",
        language: "vi",
        autoclose: true,
        todayHighlight: true,
        weekStart: 1,
        defaultViewDate: 'today'


    });
    $('#ngay_rut_ong_dan_luu').datepicker('setDate', new Date());
    $('#ngay_rut_ong_dan_luu').inputmask('99-99-9999', { placeholder: 'dd-mm-yyyy' });
    $('#ngay_cat_chi').datepicker({
        format: "dd-mm-yyyy",
        language: "vi",
        autoclose: true,
        todayHighlight: true,
        weekStart: 1,
        defaultViewDate: 'today'


    });
    $('#ngay_cat_chi').datepicker('setDate', new Date());
    $('#ngay_cat_chi').inputmask('99-99-9999', { placeholder: 'dd-mm-yyyy' });
});

function bindDataToForm(data) {
    if (!data) return;

    // Bind dữ liệu vào các trường
    processICDLoading('vao_khoa', data.maChanDoanVao);
    processICDLoading('truoc_thuat', data.maChanDoanTruoc);
    processICDLoading('sau_thuat', data.maChanDoanSau);

    document.getElementById('can_thiep_thu_thuat').value = data.canThiepThuThuat || '';
    document.getElementById('so_lan_mo_lai').value = data.soLanMoLai || '';
    document.getElementById('ly_do_mo_lai').value = data.lyDoMoLai || '';
    document.getElementById('dan_luu').value = data.danLuu || '';
    document.getElementById('ngay_rut_ong_dan_luu').value = formatDate(data.ngayRutOngDanLuu);
    document.getElementById('ngay_cat_chi').value = formatDate(data.ngayCatChi);
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
        if (plSelect) plSelect.setValue(String(data.idTuVong));
    }
}


function loadData(idVaoVien, idChiNhanh, soPhieu) {
    if (idVaoVien && idChiNhanh && soPhieu) {
        fetch(`/thu_thuat_phau_thuat/get_thong_tin_chi_tiet?idVaoVien=${idVaoVien}&idChiNhanh=${idChiNhanh}&idChiDinhChiTiet=${soPhieu}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    bindDataToForm(data.data);
                } else {
                    console.error("Lỗi khi tải dữ liệu:", data.message);
                }
            })
            .catch(error => console.error("Lỗi:", error));
    }
}

async function initThongTinTab(idVaoVien, idChiNhanh, idChiDinhChiTiet) {

    const dataPromises = {
        phongBuong: fetchDataAndNormalize("dist/data/json/DM_PhongBuong.json", 'ten', 'viettat', _idcn),
        phanLoai: fetchDataAndNormalize("dist/data/json/DM_LoaiThuThuatPhauThuat.json", 'ten', 'viettat', _idcn),
        viTriThucHien: fetchDataAndNormalize("/ViTriThucHien/List", 'ten', 'viettat', _idcn),
        taiBienBienChung: fetchDataAndNormalize("/TaiBienBienChung/List", 'ten', 'viettat', _idcn),
        cheDoThuThuat: fetchDataAndNormalize("/CheDoThuThuat/List", 'ten', 'viettat', _idcn),
        thietBi: fetchDataAndNormalize("dist/data/json/CLS_DanhMucMayCls.json", 'ten', 'viettat', _idcn),
    };
    await loadICDData()

    const results = await Promise.all(Object.values(dataPromises));
    if (idVaoVien !== null && idChiNhanh !== null && idChiDinhChiTiet !== null) {
        loadData(idVaoVien, idChiNhanh, idChiDinhChiTiet)
    }

    const allData = {};
    const keys = Object.keys(dataPromises);
    keys.forEach((key, index) => {
        allData[key] = results[index];
    });



    configureICDTomSelect()

    
    const configs = getTomSelectConfigs(allData);
    configCbThongTin(configs);
    $('#btn_saveThongTin').on('click', handleSaveThongTin);
    console.log("Khởi tạo Tab thông tin hoàn tất. Dữ liệu đã được tải.");

}
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d)) return ''; // tránh lỗi khi date null/undefined

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
    //console.log("Bắt đầu loadData", idVaoVien, idChiNhanh); 
    if (idVaoVien && idChiNhanh && idChiDinhChiTiet) {
        fetch(`/thu_thuat_phau_thuat/get_thong_tin_chi_tiet?idVaoVien=${idVaoVien}&idChiNhanh=${idChiNhanh}&idChiDinhChiTiet=${idChiDinhChiTiet}`)
            .then(response => response.json())
            .then(data => {
                //console.log("Dữ liệu loadData trả về", data);
                if (data.success) {
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
function openModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}
function resetModalForm(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        const formId = modalId.replace('Modal', 'Form');
        const formElement = modalElement.querySelector(`#${formId}`);

        if (formElement && typeof formElement.reset === 'function') {
            formElement.reset();
            console.log(`Đã reset form: ${formId}`);
        }
    }
}
const modals = document.querySelectorAll('.modal');
    modals.forEach(modalElement => {

        modalElement.addEventListener('hide.bs.modal', function (e) {
            const modalId = modalElement.id;

            if (document.activeElement) {
                document.activeElement.blur();
            }
            resetModalForm(modalId);
        });
    });

function closeModal(modalId) {
    if (document.activeElement) {
        document.activeElement.blur();
    }
    resetModalForm(modalId);
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
        modal.hide();
    }
}
document.addEventListener('DOMContentLoaded', function () {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modalElement => {
        modalElement.addEventListener('hide.bs.modal', function (e) {
            const modalId = modalElement.id;
            if (document.activeElement) {
                document.activeElement.blur();
            }
            resetModalForm(modalId); 
        });
    });
});
async function saveThietBi() {
    const ma = document.getElementById('thietBiMa').value;
    const ten = document.getElementById('thietBiTen').value;
    if (!ma || !ten) {
        alert('Vui lòng nhập đầy đủ mã và tên thiết bị!');
        return;
    }
    try {
        const response = await fetch('/ThietBiThuThuat/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ma: ma, ten: ten })
        });
        if (response.ok) {
            const newItem = { ma: ma, ten: ten, alias: ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("") };
            sampleDataThongTin.thietBi.push(newItem);
            refreshTomSelect('.cbThietBi', sampleDataThongTin.thietBi);
            document.getElementById('thietBiForm').reset();
            closeModal('thietBiModal');
            toastr.success("Thêm mới thiết bị thủ thuật thành công", "Thông báo");

            console.log('[v0] Added new thiết bị:', newItem);
        } else {
           
            toastr.success('Có lỗi xảy ra khi lưu thiết bị!', "Thông báo");

        }
    } catch (error) {
        console.error('[v0] Error saving thiết bị:', error);
        toastr.success('Có lỗi xảy ra khi lưu thiết bị!', "Thông báo");

    }
}

async function saveBienChung() {
    const ma = document.getElementById('bienChungMa').value;
    const ten = document.getElementById('bienChungTen').value;
    if (!ma || !ten) {
        alert('Vui lòng nhập đầy đủ mã và tên tai biến/biến chứng!');
        return;
    }
    try {
        const response = await fetch('/TaiBienBienChung/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ma: ma, ten: ten })
        });

        if (response.ok) {
            const newItem = { ma: ma, ten: ten, alias: ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("") };
            sampleDataThongTin.taiBienBienChung.push(newItem);
            refreshTomSelect('.cbBienChung', sampleDataThongTin.taiBienBienChung);

            document.getElementById('bienChungForm').reset();
            closeModal('bienChungModal');
            toastr.success("Thêm mới tai biến biến chứng thành công", "Thông báo");
            console.log('[v0] Added new biến chứng:', newItem);
        } else {
            toastr.error('Có lỗi xảy ra khi lưu tai biến/biến chứng!', "Thông báo");
        }
    } catch (error) {
        console.error('[v0] Error saving biến chứng:', error);
        toastr.error('Có lỗi xảy ra khi lưu tai biến/biến chứng!', "Thông báo");
    }
}

async function saveCheDoThuThuat() {
    const ma = document.getElementById('cheDoThuThuatMa').value;
    const ten = document.getElementById('cheDoThuThuatTen').value;

    if (!ma || !ten) {
        toastr.error('Vui lòng nhập đầy đủ mã và tên chế độ thủ thuật!', "Thông báo");
        return;
    }

    try {
        const response = await fetch('/CheDoThuThuat/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ma: ma, ten: ten })
        });

        if (response.ok) {
            const newItem = { ma: ma, ten: ten, alias: ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("") };
            sampleDataThongTin.cheDoThuThuat.push(newItem);
            refreshTomSelect('.cbCheDoThuThuat', sampleDataThongTin.cheDoThuThuat);

            document.getElementById('cheDoThuThuatForm').reset();
            closeModal('cheDoThuThuatModal');
            toastr.success("Thêm mới chế độ thủ thuật thành công", "Thông báo");
            console.log('[v0] Added new chế độ thủ thuật:', newItem);
        } else {
            toastr.error('Có lỗi xảy ra khi lưu chế độ thủ thuật!', "Thông báo");
        }
    } catch (error) {
        console.error('[v0] Error saving chế độ thủ thuật:', error);
        toastr.error('Có lỗi xảy ra khi lưu chế độ thủ thuật!', "Thông báo");
    }
}

async function saveViTriThucHien() {
    const ma = document.getElementById('viTriThucHienMa').value;
    const ten = document.getElementById('viTriThucHienTen').value;

    if (!ma || !ten) {
        alert('Vui lòng nhập đầy đủ mã và tên vị trí thực hiện!');
        return;
    }

    try {
        const response = await fetch('/ViTriThucHien/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ma: ma, ten: ten })
        });

        if (response.ok) {
            const newItem = { ma: ma, ten: ten, alias: ten.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("") };
            sampleDataThongTin.viTriThucHien.push(newItem);
            refreshTomSelect('.cbViTriThucHien', sampleDataThongTin.viTriThucHien);

            document.getElementById('viTriThucHienForm').reset();
            closeModal('viTriThucHienModal');
            toastr.success("Thêm vị trí thực hiện thành công", "Thông báo");
            console.log('[v0] Added new vị trí thực hiện:', newItem);
        } else {
            toastr.error('Có lỗi xảy ra khi lưu vị trí thực hiện!', "Thông báo");
        }
    } catch (error) {
        console.error('[v0] Error saving vị trí thực hiện:', error);
        toastr.error('Có lỗi xảy ra khi lưu vị trí thực hiện!', "Thông báo");
    }
}
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
    // 1. Reset tất cả các đánh dấu lỗi trước
    $('.validation-error').removeClass('validation-error');

    // 2. Định nghĩa các trường cần kiểm tra và tên hiển thị (Tiếng Việt)
    const fieldsToValidate = [
        // ICDs (Kiểm tra xem mảng đã chọn có ít nhất 1 item không)
        { data: selectedICDs.vao_khoa, element: '.cbCDVaoKhoa', name: 'Chẩn đoán vào khoa' },
        { data: selectedICDs.truoc_thuat, element: '.cbTruocThuThuat', name: 'Chẩn đoán trước thủ thuật' },
        { data: selectedICDs.sau_thuat, element: '.cbSauThuThuat', name: 'Chẩn đoán sau thủ thuật' },

        // Các trường TomSelect đơn
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

    // 3. Lặp và kiểm tra
    for (const field of fieldsToValidate) {
        let isFieldInvalid = false;

        // Xử lý dữ liệu ICD (là một mảng/Set)
        if (field.data && typeof field.data.size === 'number') { // Check cho Set (ICD)
            isFieldInvalid = field.data.size === 0;
        } else if (Array.isArray(field.data)) { // Check cho Array (ICD nếu là array)
            isFieldInvalid = field.data.length === 0;
        }
        // Xử lý dữ liệu TomSelect đơn (là chuỗi mã, check giá trị falsy)
        else if (!field.data) {
            isFieldInvalid = true;
        }

        if (isFieldInvalid) {
            isValid = false;
            if (!firstErrorElement) {
                firstErrorElement = $(field.element);
                firstErrorName = field.name;
            }

            // Tìm phần tử hiển thị TomSelect (wrapper) và áp dụng class lỗi
            const tomSelectWrapper = $(field.element).next('.ts-wrapper').length ?
                $(field.element).next('.ts-wrapper') :
                $(field.element);
            tomSelectWrapper.addClass('validation-error');

            // Xử lý đặc biệt cho ICDs: đánh dấu form-control hiển thị tags
            if (field.element.includes('cbCDVaoKhoa')) {
                $('#hien_thi_icd_vao_khoa').addClass('validation-error');
            } else if (field.element.includes('cbTruocThuThuat')) {
                $('#hien_thi_icd_truoc_thuat').addClass('validation-error');
            } else if (field.element.includes('cbSauThuThuat')) {
                $('#hien_thi_icd_sau_thuat').addClass('validation-error');
            }
        }
    }

    // 4. Hiển thị cảnh báo nếu có lỗi
    if (!isValid) {
        if (typeof toastr !== 'undefined') {
            toastr.error(`Vui lòng nhập thông tin: ${firstErrorName}.`);
        }

        // Cuộn đến phần tử lỗi đầu tiên và focus
        if (firstErrorElement) {
            $('html, body').animate({
                scrollTop: firstErrorElement.offset().top - 100 // -100 để có thêm khoảng trống
            }, 500);

            // Nếu là TomSelect, focus vào input bên trong wrapper
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
    if (!validateForm()) {
        return; 
    }
    const IDPhieuTTPT_HienTai = IDPhieuTTPT;

    const maIcdVaoKhoaArray = selectedICDs.vao_khoa.map(item => item.id);
    const maIcdTruocThuatArray = selectedICDs.truoc_thuat.map(item => item.id);
    const maIcdSauThuatArray = selectedICDs.sau_thuat.map(item => item.id);

    const maIcdVaoKhoa = maIcdVaoKhoaArray.join(',');
    const maIcdTruocThuat = maIcdTruocThuatArray.join(',');
    const maIcdSauThuat = maIcdSauThuatArray.join(',');
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
    const ngayRutOngDanLuu = $('#ngay_rut_ong_dan_luu').val() || null;
    const ngayCatChi = $('#ngay_cat_chi').val() || null;
    const khac = $('#khac').val()?.trim() || null;

    const maFna = $('#ma_fna').val()?.trim() || null;
    const tienCan = $('#tien_can').val()?.trim() || null;
    const ketQuaXetNghiem = $('#ket_qua_xet_nghiem').val()?.trim() || null;
    const chiDinhViTriTonThuongFNA = $('#chi_dinh_vi_tri_ton_thuong_fna').val()?.trim() || null;
    const yeuCauXetNghiem = $('#yeu_cau_xet_nghiem').val()?.trim() || null;

    const idPhuongPhapVoCam = $('.cbPTVoCam').val();

    const dataToSend = {
        IDPhieuTTPT: IDPhieuTTPT_HienTai,

        MaChanDoanVao: Array.isArray(maIcdVaoKhoa) ? maIcdVaoKhoa.join(',') : maIcdVaoKhoa,
        MaChanDoanTruoc: Array.isArray(maIcdTruocThuat) ? maIcdTruocThuat.join(',') : maIcdTruocThuat,
        MaChanDoanSau: Array.isArray(maIcdSauThuat) ? maIcdSauThuat.join(',') : maIcdSauThuat,
        TenChanDoanVao: tenICDVaoKhoa,
        TenChanDoanTruoc: tenICDTruoc,
        TenChanDoanSau: tenICDSau,

        IDPhongThucHien: maPhongThucHien,
        IDLoaiTTPT: maPhanLoai,
        IDThietBi: maThietBi,
        CanThiepThuThuat: canThiepThuThuat,
        IDTaiBienBienChung: maBienChung,
        IDCheDoThuThuat: maCheDoThuThuat,
        SoLanMoLai: soLanMoLai,
        LyDoMoLai: lyDoMoLai,
        IDViTriThucHien: maViTriThucHien,
        IDTuVong: maTuVong,
        DanLuu: danLuu,
        NgayRutOngDanLuu: toIsoDate(ngayRutOngDanLuu),
        NgayCatChi: toIsoDate(ngayCatChi),
        Khac: khac,

        MaFNA: maFna,
        TienCan: tienCan,
        KetQuaXNFNAGBP: ketQuaXetNghiem,
        ChiDinhViTriTonThuongFNA: chiDinhViTriTonThuongFNA,
        YeuCauXetNghiem: yeuCauXetNghiem,

        IDPhuongPhapVoCam: idPhuongPhapVoCam
    };

    console.log("-> Dữ liệu Thông Tin Thủ Thuật gửi đi:", dataToSend);

    $.ajax({
        url: "/thu_thuat_phau_thuat/thong-tin/save-thong-tin",
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function (response) {
            console.log("Lưu dữ liệu Thông Tin Thủ Thuật thành công:", response);
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

console.log("Đã gắn sự kiện 'click' cho nút Lưu Thông Tin Thủ Thuật.");
    window.initThongTinTab = initThongTinTab;

})(); 
