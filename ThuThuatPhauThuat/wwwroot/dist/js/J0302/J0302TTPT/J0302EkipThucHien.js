(function () {
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
                render: {
                    option: function (data, escape) {
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
                    },
                    no_results: function (data, escape) {
                        return `<div class="no-results" style="padding:6px 10px;color:#999;">
                                Không tìm thấy "${escape(data.input)}"
                            </div>`;
                    },
                }

            },
            {
                className: "#cb_VaiTro",
                placeholder: "-- Vai trò --",
                data: allData.vaiTro || [],
                valueField: "id",
                labelField: "ten",
                create: true,
                render: {
                    option_create: function (data, escape) {
                        return `
                        <div class="create d-flex d-flex justify-content-between">
                           <div>
                            Thêm vai trò mới <strong>"${escape(data.input)}"</strong>
                           </div>
                           
                            <button class="btn btn-primary btn-sm">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-plus">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M12 5l0 14"></path>
                                <path d="M5 12l14 0"></path>
                            </svg>
                            </button>

                        </div>
                    `;
                    },
                    option: function (data, escape) {
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
                    },
                    no_results: function (data, escape) {
                        return `<div class="no-results" style="padding:6px 10px;color:#999;">
                                Không tìm thấy "${escape(data.input)}"
                            </div>`;
                    },
                },
            }
        ];
    }

    function configCbEkip(configs) {
        configs.forEach(cfg => {
            const element = document.querySelector(cfg.className);
            if (element && !element.tomselect) {

                const tomSelectInstance = new window.TomSelect(element, {
                    options: cfg.data,
                    valueField: cfg.valueField || "ma",
                    labelField: cfg.labelField || "ten",
                    searchField: ["ten", "alias"],
                    placeholder: cfg.placeholder,
                    maxItems: 1,
                    create: cfg.create || false,
                    render: cfg.render,
                });

                if (cfg.className === "#cb_VaiTro" && cfg.create) {

                    const toggleCreateOption = (ts) => {
                        const createOptionEl = ts.dropdown_content.querySelector('.create');
                        if (!createOptionEl) return;

                        const hasResults = ts.currentResults.items.length > 0;
                        const hasInput = ts.control_input.value.length > 0;

                        const shouldShow = hasInput && !hasResults;

                        createOptionEl.style.display = shouldShow ? 'block' : 'none';

                    };

                    tomSelectInstance.on('dropdown_open', () => {
                        toggleCreateOption(tomSelectInstance);
                    });

                    tomSelectInstance.on('type', () => {
                        toggleCreateOption(tomSelectInstance);
                    });

                    tomSelectInstance.on('option_add', function (value, data) {
                        this.removeOption(value);
                        this.clear();
                        this.close();
                        openThemVaiTroModal(value);
                    });
                }
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
                    data-action="remove-ekip"
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
        //console.log("Ekip on add table == ", ekipList);
        nhanVienTomSelect.clear(true);
        vaiTroTomSelect.clear(true);
        ghiChuInput.value = '';

        if (nhanVienWrapper) {
            nhanVienWrapper.classList.remove('is-invalid');
        }

        //if (typeof toastr !== 'undefined') toastr.success(`Đã thêm thành viên ${newMember.nhanVienTen} vào ekip.`);
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
            //toastr.success(`Đã xóa thành viên ${memberName} khỏi ekip.`);
        }

        renderEkipTable();
    }


    //async function loadEkipByPhieuId(idPhieuTTPT, allData) {
    //    if (!idPhieuTTPT) {
    //        console.warn("Không có ID Phiếu TTPT, bỏ qua tải dữ liệu ekip.");
    //        return;
    //    }

    //    const endpoint = `/thu_thuat_phau_thuat/ekip/list-by-idttpt/${idPhieuTTPT}`;

    //    try {
    //        const response = await $.ajax({
    //            url: endpoint,
    //            method: 'GET',
    //            dataType: 'json',
    //        });

    //        //console.log("Response nhận được (đã resolved): ", response);

    //        if (response.success && Array.isArray(response.data)) {
    //            const serverEkipList = response.data;
    //            //console.log("serverEkipList =", serverEkipList);
    //            ekipList = serverEkipList.map(item => {
    //                const nhanVienData = findItem(allData.nhanVien, item.idNhanVien, 'id');
    //                const vaiTroData = findItem(allData.vaiTro, item.idVaiTro, 'id');
    //                //console.log("vaiTroData =", vaiTroData);
    //                return {
    //                    nhanVienMa: item.idNhanVien.toString(),
    //                    nhanVienTen: nhanVienData ? nhanVienData.ten : `ID ${item.idNhanVien} (Lỗi map)`,
    //                    vaiTroMa: vaiTroData ? vaiTroData.id : item.id,
    //                    vaiTroTen: vaiTroData ? vaiTroData.ten : item.ten,
    //                    ghiChu: item.ghiChu
    //                };
    //            });

    //            renderEkipTable();
    //            //if (typeof toastr !== 'undefined') {
    //            //    toastr.info(`Đã tải thành công ${ekipList.length} thành viên ekip.`);
    //            //}
    //        } else {
    //            console.error("Lỗi logic khi tải dữ liệu ekip:", response.message || "Không có success: true");
    //            if (typeof toastr !== 'undefined') toastr.error(`Lỗi tải ekip: ${response.message || 'Lỗi server không rõ'}`);
    //            ekipList = [];
    //            renderEkipTable();
    //        }

    //    } catch (jqXHR) {
    //        let message = "Lỗi kết nối Server.";
    //        if (jqXHR.status) {
    //            message = `Lỗi Server (${jqXHR.status}): ${jqXHR.responseJSON?.message || jqXHR.responseText || "Không rõ."}`;
    //        }
    //        console.error("Lỗi AJAX khi tải ekip:", message);
    //        if (typeof toastr !== 'undefined') toastr.error(`Lỗi tải ekip: ${message}`);
    //        ekipList = [];
    //        renderEkipTable();
    //    }
    //}

    async function loadEkipByPhieuId(idPhieuTTPT, allData) {
        ekipList = [];
        renderEkipTable();

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

            if (response.success && Array.isArray(response.data)) {
                const serverEkipList = response.data;

                ekipList = serverEkipList.map(item => {
                    const nhanVienData = findItem(allData.nhanVien, item.idNhanVien, 'id');
                    const vaiTroData = findItem(allData.vaiTro, item.idVaiTro, 'id');
                    return {
                        nhanVienMa: item.idNhanVien.toString(),
                        nhanVienTen: nhanVienData ? nhanVienData.ten : `ID ${item.idNhanVien} (Lỗi map)`,
                        vaiTroMa: vaiTroData ? vaiTroData.id : item.id,
                        vaiTroTen: vaiTroData ? vaiTroData.ten : item.ten,
                        ghiChu: item.ghiChu
                    };
                });

                renderEkipTable();
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
            vaiTro: fetchDataAndNormalize("/thu_thuat_phau_thuat/ekip/vai-tro-ttpt", 'ten', 'viettat'),
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

        const ekipTableBody = document.getElementById('ekipTableBody');
        if (ekipTableBody) {
            ekipTableBody.addEventListener('click', function (event) {
                const button = event.target.closest('button[data-action="remove-ekip"]');

                if (button) {
                    const nhanVienMa = button.dataset.nvMa;
                    handleRemoveEkip(nhanVienMa);
                }
            });
        }
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
        
        const vaiTroModalEl = document.getElementById('vaiTroModal');
        if (vaiTroModalEl) {
            vaiTroModalEl.addEventListener('show.bs.modal', function () {
                loadAndRenderVaiTroTable();
                setupVaiTroModalListeners();
            });
        }
        if (vaiTroModalEl && !vaiTroModalEl.dataset.listenerAttached) {
            vaiTroModalEl.addEventListener('hidden.bs.modal', function () {
                reloadVaiTroTomSelect();
            });
            vaiTroModalEl.dataset.listenerAttached = 'true';
        }


    }

    function handleSaveEkip(suppressToastr = false) {
        //if (ekipList.length === 0) {
        //    if (!suppressToastr && typeof toastr !== 'undefined') toastr.warning("Danh sách ekip rỗng, không có dữ liệu để lưu.");
        //    return;
        //}

        const dataToSend = {
            idPhieuTTPT: window.IDPhieuTTPT,
            ekipList: ekipList.map(item => ({
                IDPhieuTTPT: window.IDPhieuTTPT,
                IDNhanVien: item.nhanVienMa,
                IDVaiTro: item.vaiTroMa,
                GhiChu: item.ghiChu
            }))
        };

        $.ajax({
            url: "/thu_thuat_phau_thuat/ekip/create",
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataToSend),
            success: function (response) {
                if (!suppressToastr && typeof toastr !== 'undefined') {
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

    // --- VAI TRO THU THUAT PHAU THUAT ---
    let danhSachVaiTro = [];
    let vaiTroCurrentPage = 1;
    let vaiTroPageSize = 5;
    let vaiTroSearchTerm = '';

    const VAI_TRO_API_BASE_URL = "/VaiTroThuThuat";

    function getRoleText(roleValue) {
        switch (String(roleValue)) {
            case '1': return 'Bác sĩ phẫu thuật';
            case '2': return 'Phụ mổ';
            case '3': return 'Bác sĩ gây mê';
            case '4': return 'Kỹ thuật viên gây mê';
            default: return 'Không xác định';
        }
    }

    async function loadAndRenderVaiTroTable() {
        const tableBody = document.getElementById('vaiTroTableBody');
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Đang tải dữ liệu...</td></tr>`;

        const url = new URL(`${VAI_TRO_API_BASE_URL}/List`, window.location.origin);
        url.searchParams.append('pageNumber', vaiTroCurrentPage);
        url.searchParams.append('pageSize', vaiTroPageSize);
        if (vaiTroSearchTerm) {
            url.searchParams.append('searchTerm', vaiTroSearchTerm);
        }

        try {
            const response = await $.ajax({
                url: url.toString(),
                method: 'GET',
                dataType: 'json',
            });

            if (response.success && response.data) {
                const pagedResult = response.data;
                danhSachVaiTro = pagedResult.items; 
                renderVaiTroTable(); 
                renderVaiTroPagination(pagedResult);
            } else {
                tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Lỗi khi tải dữ liệu.</td></tr>`;
            }
        } catch (error) {
            console.error("Lỗi AJAX khi tải danh sách vai trò:", error);
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Không thể kết nối đến máy chủ.</td></tr>`;
        }
    }
    function renderVaiTroTable() {
        const tableBody = document.getElementById('vaiTroTableBody');
        tableBody.innerHTML = '';

        if (danhSachVaiTro.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Chưa có vai trò nào được thêm.</td></tr>`;
            return;
        }

        danhSachVaiTro.forEach((item, index) => {
            const row = `
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${item.ma || ''}</td>
                <td>${item.ten || ''}</td>
                <td style="display: none;">${getRoleText(item.maVaiTroTTPT)}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-warning me-2" data-action="edit" data-id="${item.id}">Sửa</button>
                    <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${item.id}">Xóa</button>
                </td>
            </tr>
        `;
            tableBody.innerHTML += row;
        });
    }
    function renderVaiTroPagination(pagedResult) {
        const { totalPages, pageNumber } = pagedResult;
        const paginationUl = document.getElementById('vaiTroPagination');
        paginationUl.innerHTML = '';

        if (totalPages <= 1) return;

        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${pageNumber === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" data-page="${pageNumber - 1}">Trước</a>`;
        paginationUl.appendChild(prevLi);

        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === pageNumber ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            paginationUl.appendChild(pageLi);
        }

        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${pageNumber === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" data-page="${pageNumber + 1}">Sau</a>`;
        paginationUl.appendChild(nextLi);
    }

    

    async function saveVaiTroTTPT() {
        const id = document.getElementById('vaiTroId').value;
        const ma = document.getElementById('vaiTroMa').value.trim();
        const ten = document.getElementById('vaiTroTen').value.trim();
        const role = document.getElementById('vaiTroRole').value;
        const bacSiChinh = document.getElementById('vaiTroCheck').checked;
        

        if (!ma || !ten || !role) {
            if (typeof toastr !== 'undefined') toastr.warning('Vui lòng điền đầy đủ Mã, Tên và chọn Nhóm vai trò!');
            return;
        }

        // **QUAN TRỌNG**: Ánh xạ 'role' từ JS sang 'maVaiTroTTPT' của C# Model
        const dataToSend = {
            id: id ? parseInt(id, 10) : 0, // Chuyển id sang số, nếu không có thì là 0
            ma: ma,
            ten: ten,
            maVaiTroTTPT: parseInt(role, 10),
            bschinh: bacSiChinh || false,
        };
        console.log("dataToSend = ", dataToSend);
        const isUpdating = !!id;
        const apiUrl = isUpdating ? `${VAI_TRO_API_BASE_URL}/Update/${id}` : `${VAI_TRO_API_BASE_URL}/Create`;
        const apiMethod = 'POST';

        try {
            const response = await $.ajax({
                url: apiUrl,
                method: apiMethod,
                contentType: 'application/json',
                data: JSON.stringify(dataToSend),
            });

            if (response.success) {
                if (typeof toastr !== 'undefined') toastr.success("Lưu vai trò thành công!");
                resetVaiTroForm();
                await loadAndRenderVaiTroTable(); // Tải lại bảng sau khi lưu
            } else {
                if (typeof toastr !== 'undefined') toastr.error(`Lỗi: ${response.message || 'Lưu thất bại'}`);
            }
        } catch (error) {
            console.error("Lỗi khi lưu vai trò:", error);
            if (typeof toastr !== 'undefined') toastr.error("Lưu vai trò thất bại. Vui lòng thử lại.");
        }
    }
    //async function deleteVaiTroTTPT(id) {
    //    if (confirm('Bạn có chắc chắn muốn ẩn vai trò này không? Vai trò sẽ không bị xóa vĩnh viễn.')) {

    //        const apiUrl = `${VAI_TRO_API_BASE_URL}/UpdateTrangThai/${id}`;

    //        try {
    //            const response = await $.ajax({
    //                url: apiUrl,
    //                method: 'POST',
    //            });

    //            if (response.success) {
    //                if (typeof toastr !== 'undefined') toastr.success("Đã ẩn vai trò thành công!");

    //                resetVaiTroForm();

    //                await loadAndRenderVaiTroTable();
    //            } else {
    //                if (typeof toastr !== 'undefined') toastr.error(`Lỗi: ${response.message || 'Thao tác thất bại'}`);
    //            }
    //        } catch (error) {
    //            console.error("Lỗi khi cập nhật trạng thái vai trò:", error);
    //            if (typeof toastr !== 'undefined') toastr.error("Thao tác thất bại. Vui lòng thử lại.");
    //        }
    //    }
    //}
    function deleteVaiTroTTPT(id) {
        // 1. Lấy tham chiếu đến MODAL MỚI
        const confirmModalEl = document.getElementById('confirmDeleteVaiTroModal');
        if (!confirmModalEl) {
            console.error("Lỗi: Không tìm thấy #confirmDeleteVaiTroModal trong HTML.");
            return;
        }

        const confirmModal = new bootstrap.Modal(confirmModalEl);

        const confirmButton = document.getElementById('btn_confirmDeleteVaiTro');

        confirmButton.addEventListener('click', async function handler() {
            await performDeleteVaiTro(id);

            confirmModal.hide();

        }, { once: true }); // Tùy chọn { once: true } đảm bảo hàm chỉ chạy 1 lần duy nhất

        confirmModal.show();
    }

    async function performDeleteVaiTro(id) {
        const apiUrl = `${VAI_TRO_API_BASE_URL}/UpdateTrangThai/${id}`;
        try {
            const response = await $.ajax({
                url: apiUrl,
                method: 'POST',
            });

            if (response.success) {
                if (typeof toastr !== 'undefined') toastr.success("Đã ẩn vai trò thành công!");
                resetVaiTroForm();
                await loadAndRenderVaiTroTable();
            } else {
                if (typeof toastr !== 'undefined') toastr.error(`Lỗi: ${response.message || 'Thao tác thất bại'}`);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái vai trò:", error);
            if (typeof toastr !== 'undefined') toastr.error("Thao tác thất bại. Vui lòng thử lại.");
        }
    }
    function editVaiTroTTPT(id) {
        const vaiTro = danhSachVaiTro.find(item => item.id == id);
        if (vaiTro) {
            document.getElementById('vaiTroId').value = vaiTro.id;
            document.getElementById('vaiTroMa').value = vaiTro.ma;
            document.getElementById('vaiTroTen').value = vaiTro.ten;
            document.getElementById('vaiTroRole').value = vaiTro.maVaiTroTTPT;
            document.getElementById('vaiTroCheck').checked = !!vaiTro.bsChinh;
            document.getElementById('vaiTroCancelBtn').style.display = 'block';
        }
    }

    function resetVaiTroForm() {
        document.getElementById('vaiTroForm').reset();
        document.getElementById('vaiTroId').value = '';
        document.getElementById('vaiTroCheck').value = false;
        document.getElementById('vaiTroCancelBtn').style.display = 'none';
        document.getElementById('vaiTroMa').focus();
    }

    function openThemVaiTroModal(tenVaiTro) {
        const modalElement = document.getElementById('vaiTroModal');
        const myModal = bootstrap.Modal.getOrCreateInstance(modalElement);
        resetVaiTroForm();
        document.getElementById('vaiTroTen').value = tenVaiTro || '';
        myModal.show();
    }

    function setupVaiTroModalListeners() {
        const tableBody = document.getElementById('vaiTroTableBody');
        const saveButton = document.getElementById('btnSaveVaiTro');
        const cancelButton = document.getElementById('vaiTroCancelBtn');
        if (tableBody) {
            tableBody.addEventListener('click', function (event) {
                const button = event.target.closest('button');
                if (!button) return;

                const action = button.dataset.action; 
                const id = button.dataset.id;  

                if (action === 'edit') {
                    editVaiTroTTPT(id);
                } else if (action === 'delete') {
                    deleteVaiTroTTPT(id);
                }
            });
        }

        if (saveButton) {
            saveButton.addEventListener('click', saveVaiTroTTPT);
        }
        if (cancelButton) {
            cancelButton.addEventListener('click', resetVaiTroForm);
        }
        const searchBtn = document.getElementById('vaiTroSearchBtn');
        const searchInput = document.getElementById('vaiTroSearchInput');
        const pageSizeSelect = document.getElementById('vaiTroPageSizeSelect');
        const paginationUl = document.getElementById('vaiTroPagination');
        const confirmDeleteButton = document.getElementById('btn_confirmDelete');

        searchBtn.addEventListener('click', () => {
            vaiTroSearchTerm = searchInput.value.trim();
            vaiTroCurrentPage = 1; 
            loadAndRenderVaiTroTable();
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click(); 
            }
        });

        pageSizeSelect.addEventListener('change', () => {
            vaiTroPageSize = parseInt(pageSizeSelect.value, 10);
            vaiTroCurrentPage = 1;
            loadAndRenderVaiTroTable();
        });

        paginationUl.addEventListener('click', (e) => {
            e.preventDefault(); 
            const target = e.target;
            if (target.tagName === 'A' && !target.parentElement.classList.contains('disabled')) {
                const page = parseInt(target.dataset.page, 10);
                if (page !== vaiTroCurrentPage) {
                    vaiTroCurrentPage = page;
                    loadAndRenderVaiTroTable();
                }
            }
        });
        if (confirmDeleteButton && !confirmDeleteButton.dataset.listenerAttached) {
            confirmDeleteButton.addEventListener('click', function () {
                const idToDelete = this.dataset.deleteId;
                const deleteType = this.dataset.deleteType;

                if (idToDelete && deleteType === 'vaiTro') {
                    performDeleteVaiTro(idToDelete);

                    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
                    modalInstance.hide();
                }
            });
            confirmDeleteButton.dataset.listenerAttached = 'true';
        }
    }
    async function reloadVaiTroTomSelect() {
        const vaiTroTomSelectEl = document.querySelector('#cb_VaiTro');

        if (!vaiTroTomSelectEl || !vaiTroTomSelectEl.tomselect) {
            console.error("Không tìm thấy TomSelect Vai trò.");
            return;
        }
        const tomSelectInstance = vaiTroTomSelectEl.tomselect;

        tomSelectInstance.clearOptions();
        tomSelectInstance.load(function (callback) {
            callback([], [{ value: '', text: 'Đang tải...' }]);
            tomSelectInstance.disable();
        });

        const newData = await fetchDataAndNormalize("/thu_thuat_phau_thuat/ekip/vai-tro-ttpt", 'ten', 'viettat');

        tomSelectInstance.clearOptions();
        tomSelectInstance.addOptions(newData); 
        tomSelectInstance.enable();
    }
    window.openThemVaiTroModal_0301 = openThemVaiTroModal;
    window.initEkipTab = initEkipTab;
    window.handleSaveEkip = window.handleSaveEkip || function () { };
}());