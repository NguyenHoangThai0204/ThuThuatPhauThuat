function normalizeData(data, tenField = 'ten', viettatField = 'viettat') {
        if (!Array.isArray(data)) {
            console.warn("normalizeData nhận dữ liệu không phải mảng:", data);
            return [];
        }

        return data
            .filter(n => n.active === true || n.active === 1 || n.active === undefined) // Thêm kiểm tra undefined để không loại bỏ dữ liệu mẫu
            .map(n => {
                const ten = n[tenField]?.trim() || "";
                const viettat = n[viettatField]?.trim() || "";
                let generatedAlias = "";

                if (viettat !== "") {
                    generatedAlias = viettat.toUpperCase();
                } else {
                    // Tạo alias từ các chữ cái đầu của tên
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
                  
                    const dataArray = data.success ? data.data : data;
                    resolve(normalizeData(dataArray, tenField, viettatField));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(`Lỗi khi gọi API ${url}:`, textStatus, errorThrown);
                    resolve([]);
                }
            });
        });
    }


    function findItem(list, value, field = 'id') {
        return list.find(item => item[field] == value);
    }


if (typeof ekipList === "undefined") {
    var ekipList = [];
}

    function getEkipTomSelectConfigs(allData) {
        return [
            {
                className: "#cb_NhanVien",
                placeholder: "-- Tên nhân viên --",
                data: allData.nhanVien || [],
                valueField: "id",
                labelField: "ten",
            },
            {
                className: "#cb_VaiTro",
                placeholder: "-- Vai trò --",
                data: allData.vaiTro || [],
                valueField: "id",
                labelField: "ten",
            }
        ];
    }

function configCbEkip(configs) {
    configs.forEach(cfg => {
        const element = document.querySelector(cfg.className);
        if (element && !element.tomselect) { 
            new window.TomSelect(element, {
                options: cfg.data,
                valueField: cfg.valueField || "ma",
                labelField: cfg.labelField || "ten",
                searchField: ["ten", "alias"],
                placeholder: cfg.placeholder,
                maxItems: 1,
                render: {
                    option: function (data, escape) {
                        if (!data.ten && !data.alias) return `<div class="no-results" style="padding:6px 10px;color:#999;">Đang tải dữ liệu...</div>`;

                            return `
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span>${escape(data.ten)}</span>
                            <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.alias || "")}</span>
                        </div>`;
                        },
                        item: function (data, escape) {
                            return `
                        <div style="display:flex; justify-content:space-between; width:100%;">
                            <span>${escape(data.ten)}</span>
                            <span style="color:gray; font-size:12px; margin-left:10px;">${escape(data.alias || "")}</span>
                        </div>`;
                        }
                    }
                });
            }
        });
    }

 
    function renderEkipTable() {
        const tableBody = document.getElementById('ekipTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (ekipList.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">Chưa có thành viên ekip nào được thêm.</td></tr>`;
            return;
        }

        ekipList.forEach((item, index) => {
            const row = tableBody.insertRow();

            row.insertCell().textContent = index + 1;
            row.cells[0].classList.add('text-center');

            row.insertCell().textContent = item.nhanVienTen;

            row.insertCell().textContent = item.vaiTroTen;

            row.insertCell().textContent = item.ghiChu;

            const actionCell = row.insertCell();
            actionCell.classList.add('text-center');
            // Sử dụng nhanVienMa (chính là IDNhanVien) để xóa
            actionCell.innerHTML = `
            <button type="button" class="btn btn-sm btn-danger btn-icon" 
                    data-nv-ma="${item.nhanVienMa}" 
                    onclick="handleRemoveEkip('${item.nhanVienMa}')" 
                    title="Xóa thành viên">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 7l16 0"></path>
                    <path d="M10 11l0 6"></path>
                    <path d="M14 11l0 6"></path>
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                </svg>
            </button>
        `;
        });
    }
    function handleAddEkip() {
        const nhanVienSelectElement = document.getElementById('cb_NhanVien');
        const vaiTroSelectElement = document.getElementById('cb_VaiTro');
        const ghiChuInput = document.getElementById('text_ghiChu');

        const nhanVienTomSelect = nhanVienSelectElement ? nhanVienSelectElement.tomselect : null;
        const vaiTroTomSelect = vaiTroSelectElement ? vaiTroSelectElement.tomselect : null;

        if (!nhanVienTomSelect || !vaiTroTomSelect) {
            console.error("Lỗi: Không tìm thấy TomSelect instances.");
            return;
        }

        const nhanVienWrapper = nhanVienTomSelect.wrapper;
        const vaiTroWrapper = vaiTroTomSelect.wrapper;

        if (nhanVienWrapper) {
            nhanVienWrapper.classList.remove('is-invalid');
        }
        if (vaiTroWrapper) {
            vaiTroWrapper.classList.remove('is-invalid');
        }

        const nhanVienMa = nhanVienTomSelect.getValue();
        const vaiTroMa = vaiTroTomSelect.getValue();
        const ghiChu = ghiChuInput.value.trim();

        if (!nhanVienMa) {
            if (typeof toastr !== 'undefined') toastr.warning("Vui lòng chọn tên nhân viên.");
            if (nhanVienWrapper) {
                nhanVienWrapper.classList.add('is-invalid');
            }
            return;
        }
        const isDuplicate = ekipList.some(item => item.nhanVienMa === nhanVienMa);
        if (isDuplicate) {
            if (typeof toastr !== 'undefined') toastr.info(`Vui lòng chọn nhân viên khác. Nhân viên này đã được thêm vào ekip`);
            if (nhanVienWrapper) {
                nhanVienWrapper.classList.add('is-invalid');
            }
            return;
        }
        if (!vaiTroMa) {
            if (typeof toastr !== 'undefined') toastr.warning("Vui lòng chọn vai trò.");
            if (vaiTroWrapper) {
                vaiTroWrapper.classList.add('is-invalid');
            }
            return;
        }

        const nhanVienData = nhanVienTomSelect.options[nhanVienMa];
        const vaiTroData = vaiTroTomSelect.options[vaiTroMa];

        // Tạo đối tượng thành viên mới
        const newMember = {
            nhanVienMa: nhanVienMa, 
            nhanVienTen: nhanVienData ? nhanVienData.ten : 'Không rõ',
            vaiTroMa: vaiTroData ? vaiTroData.id : 'Không rõ',
            vaiTroTen: vaiTroData ? vaiTroData.ten : 'Không có vai trò', // Gửi Tên Vai trò lên server
            ghiChu: ghiChu
        };
        
        ekipList.push(newMember);
        renderEkipTable();
        console.log("Ekip on add table == ", ekipList);
        nhanVienTomSelect.clear(true);
        vaiTroTomSelect.clear(true);
        ghiChuInput.value = '';

        if (nhanVienWrapper) {
            nhanVienWrapper.classList.remove('is-invalid');
        }

        if (typeof toastr !== 'undefined') toastr.success(`Đã thêm thành viên ${newMember.nhanVienTen} vào ekip.`);
    }

    /**
     * Hàm xử lý xóa thành viên khỏi danh sách
     * @param {string} maNhanVien - Mã nhân viên cần xóa (đã được sửa thành ID)
     */
    function handleRemoveEkip(maNhanVien) {

        const memberToRemove = ekipList.find(item => item.nhanVienMa === maNhanVien);

        const initialLength = ekipList.length;
        ekipList = ekipList.filter(item => item.nhanVienMa !== maNhanVien);

        if (ekipList.length < initialLength && typeof toastr !== 'undefined') {
            const memberName = memberToRemove ? memberToRemove.nhanVienTen : 'một thành viên';
            toastr.success(`Đã xóa thành viên ${memberName} khỏi ekip.`);
        }

        renderEkipTable();
    }


    async function loadEkipByPhieuId(idPhieuTTPT, allData) {
        if (!idPhieuTTPT) {
            console.warn("Không có ID Phiếu TTPT, bỏ qua tải dữ liệu ekip.");
            return;
        }

        const endpoint = `/thu_thuat_phau_thuat/ekip/list-by-idttpt/${idPhieuTTPT}`;

        try {
            const response = await $.ajax({
                url: endpoint,
                method: 'GET',
                dataType: 'json',
            });

            //console.log("Response nhận được (đã resolved): ", response);

            if (response.success && Array.isArray(response.data)) {
                const serverEkipList = response.data;
                console.log("serverEkipList =", serverEkipList);
                ekipList = serverEkipList.map(item => {
                    const nhanVienData = findItem(allData.nhanVien, item.idNhanVien, 'id');
                    const vaiTroData = findItem(allData.vaiTro, item.idVaiTro, 'id');
                    console.log("vaiTroData =", vaiTroData);
                    return {
                        nhanVienMa: item.idNhanVien.toString(), 
                        nhanVienTen: nhanVienData ? nhanVienData.ten : `ID ${item.idNhanVien} (Lỗi map)`,
                        vaiTroMa: vaiTroData ? vaiTroData.id : item.id,
                        vaiTroTen: vaiTroData ? vaiTroData.ten : item.ten,
                        ghiChu: item.ghiChu
                    };
                });

                renderEkipTable();
                if (typeof toastr !== 'undefined') {
                    toastr.info(`Đã tải thành công ${ekipList.length} thành viên ekip.`);
                }
            } else {
                console.error("Lỗi logic khi tải dữ liệu ekip:", response.message || "Không có success: true");
                if (typeof toastr !== 'undefined') toastr.error(`Lỗi tải ekip: ${response.message || 'Lỗi server không rõ'}`);
                ekipList = [];
                renderEkipTable();
            }

        } catch (jqXHR) {
            let message = "Lỗi kết nối Server.";
            if (jqXHR.status) { 
                message = `Lỗi Server (${jqXHR.status}): ${jqXHR.responseJSON?.message || jqXHR.responseText || "Không rõ."}`;
            }
            console.error("Lỗi AJAX khi tải ekip:", message);
            if (typeof toastr !== 'undefined') toastr.error(`Lỗi tải ekip: ${message}`);
            ekipList = [];
            renderEkipTable();
        }
    }



    async function initEkipTab() {

        const dataPromises = {
            nhanVien: fetchDataAndNormalize("dist/data/json/DM_NhanVien.json", 'ten', 'viettat'),
            vaiTro: fetchDataAndNormalize("/thu_thuat_phau_thuat/trinh-tu/vai-tro-ttpt", 'ten', 'viettat'),
        };

        const results = await Promise.all(Object.values(dataPromises));

        const allData = {};
        const keys = Object.keys(dataPromises);
        keys.forEach((key, index) => {
            allData[key] = results[index];
        });

        const configs = getEkipTomSelectConfigs(allData);
        configCbEkip(configs);

        await loadEkipByPhieuId(window.IDPhieuTTPT, allData);

        const btnAdd = document.getElementById('btn_addEkip');
        if (btnAdd) {
            btnAdd.removeEventListener('click', handleAddEkip);
            btnAdd.addEventListener('click', handleAddEkip);
        }

        const btnSave = document.getElementById('btn_saveEkip');
        if (btnSave) {
            btnSave.removeEventListener('click', handleSaveEkip);
            btnSave.addEventListener('click', handleSaveEkip);
        }

    }

function handleSaveEkip() {
    console.log("ekipList ===", ekipList);
        if (ekipList.length === 0) {
            if (typeof toastr !== 'undefined') toastr.warning("Danh sách ekip rỗng, không có dữ liệu để lưu.");
            return;
        }

        const dataToSend = ekipList.map(item => ({
            IDPhieuTTPT: window.IDPhieuTTPT,
            IDNhanVien: item.nhanVienMa,
            IDVaiTro: item.vaiTroMa,
            GhiChu: item.ghiChu
        }));

        //console.log("-> Dữ liệu Ekip gửi đi:", dataToSend);

        $.ajax({
            url: "/thu_thuat_phau_thuat/ekip/create",
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataToSend),
            success: function (response) {
                //console.log("Lưu dữ liệu Ekip thành công:", response);
                if (typeof toastr !== 'undefined') {
                    toastr.success("Đã lưu dữ liệu ekip thành công!");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Lỗi khi lưu dữ liệu Ekip:", textStatus, errorThrown, jqXHR.responseText);
                if (typeof toastr !== 'undefined') {
                    const errorMessage = jqXHR.responseJSON?.message || textStatus;
                    toastr.error(`Lỗi khi lưu ekip: ${errorMessage}. Vui lòng thử lại.`);
                }
            }
        });
    }
    window.initEkipTab = initEkipTab;
    window.handleSaveEkip = window.handleSaveEkip || function () { };
