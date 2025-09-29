toastr.options = {
    "closeButton": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "timeOut": "1500"
};

function formatDateTime(date) {
    const dd = String(date.getDate()).padStart(2, "0")
    const MM = String(date.getMonth() + 1).padStart(2, "0")
    const yyyy = date.getFullYear()
    const HH = String(date.getHours()).padStart(2, "0")
    const mm = String(date.getMinutes()).padStart(2, "0")
    return `${dd}-${MM}-${yyyy} ${HH}:${mm}`
}
function updateDateTime() {
    var now = new Date()
    var formatted = formatDateTime(now)
    const datetimeElement = document.getElementById("info-datetime")
    if (datetimeElement) {
        datetimeElement.textContent = formatted
    }
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

    console.log(`[v0] Added ICD tag: ${icdCode} (${icdId}) to ${type}`)
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
    ]

    icdConfigs.forEach((config) => {
        const element = document.querySelector(config.className)
        if (element) {
            const tomSelectInstance = new window.TomSelect(config.className, {
                options: icdData,
                valueField: "id", // <-- ĐÃ SỬA: Dùng ID

                searchField: ["ma"],
                placeholder: "-Mã ICD-",
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
                        const selectedItem = icdData.find((item) => String(item.id) === value)
                        if (selectedItem) {
                            // Truyền ID, Mã và Tên
                            addICDTag(config.displayType, selectedItem.id, selectedItem.ma, selectedItem.ten)
                            this.clear()
                        }
                    }
                },
            })
        }
    })
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

function fetchDataAndNormalize(url, tenField = 'ten', viettatField = 'viettat') {
    if (url.endsWith('.json')) {
        return new Promise((resolve, reject) => {
            $.getJSON(url, data => {
                resolve(normalizeData(data, tenField, viettatField));
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
                resolve(normalizeData(data, tenField, viettatField));
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


async function initThongTinTab() {
    console.log("Bắt đầu tải dữ liệu và khởi tạo Tab thông tin...");

    // 1. Định nghĩa các lời gọi bất đồng bộ
    const dataPromises = {
        phongBuong: fetchDataAndNormalize("dist/data/json/DM_PhongBuong.json"),
        phanLoai: fetchDataAndNormalize("dist/data/json/DM_LoaiThuThuatPhauThuat.json"),
        viTriThucHien: fetchDataAndNormalize("/ViTriThucHien/List", 'ten', 'viettat'),
        taiBienBienChung: fetchDataAndNormalize("/TaiBienBienChung/List", 'ten', 'viettat'),
        cheDoThuThuat: fetchDataAndNormalize("/CheDoThuThuat/List", 'ten', 'viettat'),
        thietBi: fetchDataAndNormalize("dist/data/json/CLS_DanhMucMayCls.json", 'ten', 'viettat'),
    };

    const results = await Promise.all(Object.values(dataPromises));

    const allData = {};
    const keys = Object.keys(dataPromises);
    keys.forEach((key, index) => {
        allData[key] = results[index];
    });

    await loadICDData()

    configureICDTomSelect()

    
    const configs = getTomSelectConfigs(allData);
    configCbThongTin(configs);

    console.log("Khởi tạo Tab thông tin hoàn tất. Dữ liệu đã được tải.");
}

// Gọi hàm khởi tạo
initThongTinTab();

function configCbThongTin(configs) {
    configs.forEach((cfg) => {
        const element = document.querySelector(cfg.className)
        if (element) {
            const tomSelectInstance = new window.TomSelect(cfg.className, {
                options: cfg.data,
                valueField: "id",
                labelField: "ten",
                searchField: ["ten", "alias"],
                placeholder: cfg.placeholder,
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
                }, no_results: function (data, escape) {
                    return `<div class="no-results" style="padding:6px 10px;color:#999;">
                                Không tìm thấy "${escape(data.input)}"
                            </div>`;
                },
            })
            if (cfg.className === ".cbPTVoCam") {
                tomSelectInstance.on("keydown", function (e) {
                    if (e.key === "Enter" && this.getValue()) {
                        e.preventDefault()
                        if (window.addAnesthesiaMethod) {
                            window.addAnesthesiaMethod()
                        }
                    }
                })
            }
        }
    })
}
// ================= XU LY MODAL ========================
function openModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}
function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
        modal.hide();
    }
}
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

//==================== XỬ LÝ PHƯƠNG THỨC VÔ CẢM =======================
// Đổi tên biến sang "Ids" để phản ánh việc lưu trữ ID thay vì code
let selectedAnesthesiaIds = new Set();
let anesthesiaCounter = 1;


function addAnesthesiaMethod() {
    const selectElement = document.querySelector('.cbPTVoCam');
    const tomSelectInstance = selectElement.tomselect;

    if (tomSelectInstance && tomSelectInstance.getValue()) {
        const selectedId = tomSelectInstance.getValue(); // Lấy ID (1, 2, 3...)

        // 1. SỬA: Tìm kiếm bằng trường 'id'
        // Dùng String() để đảm bảo so sánh an toàn giữa id (có thể là số) và giá trị trả về của TomSelect (thường là chuỗi)
        const selectedItem = sampleDataThongTin.voCam.find(item => String(item.id) === String(selectedId));

        // 2. SỬA: Kiểm tra sự tồn tại trong Set bằng ID
        if (selectedItem && !selectedAnesthesiaIds.has(selectedId)) {
            addToAnesthesiaTable(selectedItem);

            // 3. SỬA: Lưu ID vào Set
            selectedAnesthesiaIds.add(selectedId);

            tomSelectInstance.clear();
            updateTomSelectOptions();
            console.log('Added anesthesia method ID:', selectedId);
        } else {
            tomSelectInstance.clear();
        }
    }
}

function updateTomSelectOptions() {
    const selector = '.cbPTVoCam';
    const tomSelectInstance = document.querySelector(selector).tomselect;

    if (tomSelectInstance) {
        // 4. SỬA: Lọc options dựa trên ID
        const availableOptions = sampleDataThongTin.voCam.filter(item =>
            !selectedAnesthesiaIds.has(String(item.id))
        );
        tomSelectInstance.clearOptions();
        tomSelectInstance.addOptions(availableOptions);
        tomSelectInstance.refreshOptions(false);
    }
}

function addToAnesthesiaTable(item) {
    const tableBody = document.getElementById('anesthesiaTableBody');
    const row = document.createElement('tr');

    // 5. SỬA: Lưu ID vào dataset
    row.dataset.id = item.id;

    row.innerHTML = `
        <td class="text-center">${anesthesiaCounter}</td>
        <td>${item.ten}</td>
        <td class="text-center">
            <button type="button" class="delete-btn" onclick="removeAnesthesiaRow(this)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        </td>
    `;

    tableBody.appendChild(row);
    anesthesiaCounter++;
}
function removeAnesthesiaRow(button) {
    const row = button.closest('tr');
    // 6. SỬA: Lấy ID từ dataset
    const idToRemove = row.dataset.id;

    if (idToRemove) {
        // 7. SỬA: Xóa khỏi Set bằng ID
        selectedAnesthesiaIds.delete(idToRemove);

        row.remove();
        updateTomSelectOptions();
        const tableBody = document.getElementById('anesthesiaTableBody');
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.querySelector('td:first-child').textContent = index + 1;
        });
        anesthesiaCounter = rows.length + 1;
        console.log(`Removed anesthesia method with ID: ${idToRemove}`);
    } else {
        row.remove();
    }
}
// Giữ nguyên DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    const voCamSelect = document.querySelector('.cbPTVoCam');
    if (voCamSelect) {
        voCamSelect.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addAnesthesiaMethod();
            }
        });
    }
});
function getAnesthesiaMethods() {
    const methods = [];
    // Lấy tất cả các hàng trong tbody
    $('#anesthesiaTableBody').find('tr').each(function () {
        // Mỗi hàng được gán data-ma (code)
        const code = $(this).data('id');
        if (code) {
            methods.push(code);
        }
    });
    return methods;
}
async function handleSaveThongTin() {

    const IDPhieuTTPT_HienTai = 2;

    // 1. Thu thập dữ liệu

    // 1. Lấy mảng chỉ chứa các MÃ ICD (dạng array of strings)
    const maIcdVaoKhoaArray = selectedICDs.vao_khoa.map(item => item.id);
    const maIcdTruocThuatArray = selectedICDs.truoc_thuat.map(item => item.id);
    const maIcdSauThuatArray = selectedICDs.sau_thuat.map(item => item.id);

    // 2. (Tùy chọn) Chuyển mảng thành một chuỗi duy nhất, phân cách bởi dấu phẩy
    // Nếu bạn cần gửi dữ liệu dưới dạng chuỗi (ví dụ: "A00,A01,B00")
    const maIcdVaoKhoa = maIcdVaoKhoaArray.join(',');
    const maIcdTruocThuat = maIcdTruocThuatArray.join(',');
    const maIcdSauThuat = maIcdSauThuatArray.join(',');
    const tenICDVaoKhoa = $('#ten_icd_vao_khoa').val();
    const tenICDTruoc = $('#ten_icd_truoc_thuat').val();
    const tenICDSau = $('#ten_icd_sau_thuat').val();

    console.log("Mã ICD Vào Khoa:", maIcdVaoKhoa);

    // --- TomSelects đơn lẻ ---
    const maPhongThucHien = $('.cbPhongThucHien').val();
    const maPhanLoai = $('.cbPhanLoai').val();
    const maThietBi = $('.cbThietBi').val();
    const maBienChung = $('.cbBienChung').val();
    const maCheDoThuThuat = $('.cbCheDoThuThuat').val();
    const maViTriThucHien = $('.cbViTriThucHien').val();
    const maTuVong = $('.cbTuVong').val();

    // --- Các trường Input/Textarea ---
    const canThiepThuThuat = $('#can_thiep_thu_thuat').val()?.trim() || null;
    const soLanMoLaiRaw = $('#so_lan_mo_lai').val();
    const soLanMoLai = soLanMoLaiRaw ? parseInt(soLanMoLaiRaw) : 0;
    const lyDoMoLai = $('#ly_do_mo_lai').val()?.trim() || null;
    const danLuu = $('#dan_luu').val()?.trim() || null;
    const ngayRutOngDanLuu = $('#ngay_rut_ong_dan_luu').val() || null;
    const ngayCatChi = $('#ngay_cat_chi').val() || null;
    const khac = $('#khac').val()?.trim() || null;

    // --- Dữ liệu FNA ---
    const maFna = $('#ma_fna').val()?.trim() || null;
    const tienCan = $('#tien_can').val()?.trim() || null;
    const ketQuaXetNghiem = $('#ket_qua_xet_nghiem').val()?.trim() || null;
    const chiDinhViTriTonThuongFNA = $('#chi_dinh_vi_tri_ton_thuong_fna').val()?.trim() || null;
    const yeuCauXetNghiem = $('#yeu_cau_xet_nghiem').val()?.trim() || null;

    // --- Phương pháp vô cảm ---
    const phuongPhapVoCamList = getAnesthesiaMethods();

    // 2. Chuẩn bị đối tượng gửi đi (Sử dụng PascalCase cho C# Model)
    const dataToSend = {
        IDPhieuTTPT: IDPhieuTTPT_HienTai,

        // ICDs: Chuyển mảng (nếu có) thành chuỗi ngăn cách bằng dấu phẩy
        MaChanDoanVao: Array.isArray(maIcdVaoKhoa) ? maIcdVaoKhoa.join(',') : maIcdVaoKhoa,
        MaChanDoanTruoc: Array.isArray(maIcdTruocThuat) ? maIcdTruocThuat.join(',') : maIcdTruocThuat,
        MaChanDoanSau: Array.isArray(maIcdSauThuat) ? maIcdSauThuat.join(',') : maIcdSauThuat,
        TenChanDoanVao: tenICDVaoKhoa,
        TenChanDoanTruoc: tenICDTruoc,
        TenChanDoanSau: tenICDSau,

        // Fields
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
        NgayRutOngDanLuu: ngayRutOngDanLuu,
        NgayCatChi: ngayCatChi,
        Khac: khac,

        // FNA
        MaFNA: maFna,
        TienCan: tienCan,
        KetQuaXNFNAGBP: ketQuaXetNghiem,
        ChiDinhViTriTonThuongFNA: chiDinhViTriTonThuongFNA,
        YeuCauXetNghiem: yeuCauXetNghiem,

        // Phương pháp vô cảm (Gửi dưới dạng chuỗi ngăn cách bằng dấu phẩy)
        PhuongPhapVoCam: phuongPhapVoCamList.join(','),
    };

    console.log("-> Dữ liệu Thông Tin Thủ Thuật gửi đi:", dataToSend);

    // 3. Gửi dữ liệu về Controller
    $.ajax({
        url: "/thu_thuat_phau_thuat/thong-tin/save-thong-tin",
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function (response) {
            console.log("Lưu dữ liệu Thông Tin Thủ Thuật thành công:", response);
            if (response.success) {
                if (typeof toastr !== 'undefined') {
                    toastr.success("Đã lưu thông tin thủ thuật thành công! ✅");
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
                toastr.error("Lỗi kết nối hoặc lỗi server khi lưu thông tin. ❌");
            }
        }
    });
}
$('#btn_saveThongTin').on('click', handleSaveThongTin);
console.log("Đã gắn sự kiện 'click' cho nút Lưu Thông Tin Thủ Thuật.");