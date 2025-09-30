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

    /**
     * Tải dữ liệu từ URL (JSON file hoặc API) và chuẩn hóa.
     * Sử dụng giả định jQuery/$.getJSON/$.ajax có sẵn.
     * @param {string} url - Đường dẫn file JSON hoặc endpoint API.
     * @param {string} tenField - Tên trường chứa tên/tiêu đề.
     * @param {string} viettatField - Tên trường chứa viết tắt.
     * @returns {Promise<Array<object>>} Promise trả về mảng dữ liệu đã chuẩn hóa.
     */
    function fetchDataAndNormalize(url, tenField = 'ten', viettatField = 'viettat') {
        if (url.endsWith('.json')) {
            return new Promise((resolve, reject) => {
                // Giả định $.getJSON có sẵn
                $.getJSON(url, data => {
                    resolve(normalizeData(data, tenField, viettatField));
                }).fail((jqXHR, textStatus, errorThrown) => {
                    console.error(`Lỗi khi tải dữ liệu từ ${url}:`, textStatus, errorThrown);
                    resolve([]);
                });
            });
        }
        return new Promise((resolve, reject) => {
            // Giả định $.ajax có sẵn
            $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json',
                success: function (data) {
                    // Giả định API trả về { success: true, data: [...] }
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

    /**
     * Tìm một đối tượng trong mảng bằng giá trị trường
     * @param {Array<object>} list - Mảng dữ liệu.
     * @param {*} value - Giá trị cần tìm.
     * @param {string} field - Tên trường để so sánh.
     * @returns {object | undefined} Đối tượng tìm thấy.
     */
    function findItem(list, value, field = 'id') {
        // So sánh lỏng lẻo (==) để hỗ trợ so sánh chuỗi ID với số ID
        return list.find(item => item[field] == value);
    }


    // =========================================================================
    // LOGIC CHÍNH CỦA EKIP THỰC HIỆN
    // =========================================================================

    // Mảng chứa danh sách ekip đang hiển thị
    let ekipList = [];

    /**
     * Định nghĩa cấu hình TomSelect cho tab Ekip dựa trên dữ liệu đã tải.
     * @param {object} allData - Object chứa dữ liệu nhân viên và vai trò đã tải.
     */
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
                valueField: "ma",
                labelField: "ten",
            }
        ];
    }

    /**
     * Hàm cấu hình TomSelect cho các ô chọn trong tab Ekip.
     * @param {Array<object>} configs - Mảng cấu hình TomSelect.
     */
    function configCbEkip(configs) {
        configs.forEach(cfg => {
            var element = document.querySelector(cfg.className);
            if (element) {
                if (element.tomselect) {
                    element.tomselect.destroy();
                }
                new TomSelect(element, {
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

    /**
     * Hàm vẽ lại nội dung bảng Ekip
     */
    function renderEkipTable() {
        console.log("-> Bắt đầu vẽ lại bảng Ekip. Số lượng: " + ekipList.length);
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

    /**
     * Hàm xử lý khi nhấn nút Thêm (+)
     */
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
            nhanVienMa: nhanVienMa, // Giữ ID nhân viên (dạng string)
            nhanVienTen: nhanVienData ? nhanVienData.ten : 'Không rõ',
            vaiTroMa: vaiTroMa,
            vaiTroTen: vaiTroData ? vaiTroData.ten : 'Không có vai trò', // Gửi Tên Vai trò lên server
            ghiChu: ghiChu
        };

        ekipList.push(newMember);
        renderEkipTable();

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
        console.log("-> Xóa nhân viên: " + maNhanVien);

        const memberToRemove = ekipList.find(item => item.nhanVienMa === maNhanVien);

        const initialLength = ekipList.length;
        ekipList = ekipList.filter(item => item.nhanVienMa !== maNhanVien);

        if (ekipList.length < initialLength && typeof toastr !== 'undefined') {
            const memberName = memberToRemove ? memberToRemove.nhanVienTen : 'một thành viên';
            toastr.success(`Đã xóa thành viên ${memberName} khỏi ekip.`);
        }

        renderEkipTable();
    }


    /**
     * HÀM MỚI: Tải dữ liệu ekip hiện có từ server và ánh xạ tên nhân viên.
     * @param {long} idPhieuTTPT - ID của phiếu cần đọc ekip.
     * @param {object} allData - Dữ liệu danh mục đã tải (nhanVien, vaiTro).
     */
    async function loadEkipByPhieuId(idPhieuTTPT, allData) {
        if (!idPhieuTTPT) {
            console.warn("Không có ID Phiếu TTPT, bỏ qua tải dữ liệu ekip.");
            return;
        }

        const endpoint = `/thu_thuat_phau_thuat/ekip/list-by-idttpt/${idPhieuTTPT}`;
        console.log(`-> Đang tải dữ liệu ekip hiện có từ: ${endpoint}`);

        // Sử dụng khối try/catch chỉ để bắt lỗi mạng thực sự (Status 0 hoặc 500)
        try {
            const response = await $.ajax({
                url: endpoint,
                method: 'GET',
                dataType: 'json',
                // *** ĐÃ LOẠI BỎ KHỐI error: function (...) GÂY LỖI THROW ***
            });

            // Response đã được giải quyết (resolved), tức là HTTP Status là 2xx
            console.log("Response nhận được (đã resolved): ", response);

            // Bắt đầu xử lý dữ liệu từ response
            if (response.success && Array.isArray(response.data)) {
                const serverEkipList = response.data;

                // Logic mapping của bạn (giữ nguyên)
                ekipList = serverEkipList.map(item => {
                    const nhanVienData = findItem(allData.nhanVien, item.idNhanVien, 'id'); // Dùng idNhanVien (lowercase 'id' trong JSON) và tìm theo 'id'
                    const vaiTroData = findItem(allData.vaiTro, item.tenVaiTro, 'ten');

                    return {
                        nhanVienMa: item.idNhanVien.toString(), // Sửa thành item.idNhanVien
                        nhanVienTen: nhanVienData ? nhanVienData.ten : `ID ${item.idNhanVien} (Lỗi map)`,
                        vaiTroMa: vaiTroData ? vaiTroData.ma : item.tenVaiTro,
                        vaiTroTen: item.tenVaiTro,
                        ghiChu: item.ghiChu
                    };
                });

                renderEkipTable();
                if (typeof toastr !== 'undefined') {
                    toastr.info(`Đã tải thành công ${ekipList.length} thành viên ekip.`);
                }
            } else {
                // Trường hợp success: false (nếu Server trả về lỗi logic nghiệp vụ với 200 OK)
                console.error("Lỗi logic khi tải dữ liệu ekip:", response.message || "Không có success: true");
                if (typeof toastr !== 'undefined') toastr.error(`Lỗi tải ekip: ${response.message || 'Lỗi server không rõ'}`);
                ekipList = [];
                renderEkipTable();
            }

        } catch (jqXHR) {
            // Khối catch này chỉ chạy khi có lỗi mạng thực sự (HTTP Status 500, 404, hoặc lỗi kết nối)
            let message = "Lỗi kết nối Server.";
            if (jqXHR.status) { // Nếu có status code (500, 404, ...)
                message = `Lỗi Server (${jqXHR.status}): ${jqXHR.responseJSON?.message || jqXHR.responseText || "Không rõ."}`;
            }
            console.error("Lỗi AJAX khi tải ekip:", message);
            if (typeof toastr !== 'undefined') toastr.error(`Lỗi tải ekip: ${message}`);
            ekipList = [];
            renderEkipTable();
        }
    }


    /**
     * Hàm khởi tạo chính cho tab Ekip.
     * Tải dữ liệu và cấu hình TomSelects.
     */
    async function initEkipTab() {
        console.log("-> Bắt đầu tải dữ liệu và khởi tạo Tab Ekip.");

        // 1. Định nghĩa các lời gọi bất đồng bộ để tải dữ liệu danh mục
        const dataPromises = {
            // Lưu ý: Đã sửa 'ma' -> 'id' trong TomSelect, nhưng fetchDataAndNormalize vẫn dùng 'ma' để tải
            nhanVien: fetchDataAndNormalize("dist/data/json/DM_NhanVien.json", 'ten', 'viettat'),
            vaiTro: fetchDataAndNormalize("dist/data/json/DM_ViTriThuThuat.json", 'ten', 'viettat'),
        };

        const results = await Promise.all(Object.values(dataPromises));

        const allData = {};
        const keys = Object.keys(dataPromises);
        keys.forEach((key, index) => {
            allData[key] = results[index];
        });

        // 2. Lấy cấu hình và khởi tạo TomSelects
        const configs = getEkipTomSelectConfigs(allData);
        configCbEkip(configs);

        // 3. Tải dữ liệu ekip hiện có (GỌI HÀM MỚI Ở ĐÂY)
        await loadEkipByPhieuId(IDPhieuTTPT_HienTai, allData);

        // 4. Thêm Listener cho nút Thêm
        const btnAdd = document.getElementById('btn_addEkip');
        if (btnAdd) {
            btnAdd.removeEventListener('click', handleAddEkip);
            btnAdd.addEventListener('click', handleAddEkip);
            console.log("-> Đã gắn sự kiện cho nút Thêm.");
        }

        // 5. Thêm Listener cho nút Lưu
        const btnSave = document.getElementById('btn_saveEkip');
        if (btnSave) {
            btnSave.removeEventListener('click', handleSaveEkip);
            btnSave.addEventListener('click', handleSaveEkip);
            console.log("-> Đã gắn sự kiện cho nút Lưu.");
        }

        console.log("-> Khởi tạo Tab Ekip hoàn tất.");
    }

    // Khởi chạy
    const IDPhieuTTPT_HienTai = IDPhieuTTPT; // <--- CẦN LẤY ID THỰC TẾ TỪ URL/SESSION/VIEWDATA
    function handleSaveEkip() {
        if (ekipList.length === 0) {
            if (typeof toastr !== 'undefined') toastr.warning("Danh sách ekip rỗng, không có dữ liệu để lưu.");
            return;
        }

        // Chuẩn bị dữ liệu để gửi
        const dataToSend = ekipList.map(item => ({
            IDPhieuTTPT: IDPhieuTTPT_HienTai,
            IDNhanVien: item.nhanVienMa, // <--- ĐÃ SỬA: Gửi IDNhanVien để khớp với C# Model
            TenVaiTro: item.vaiTroTen,
            GhiChu: item.ghiChu
        }));

        console.log("-> Dữ liệu gửi đi:", dataToSend);

        $.ajax({
            url: "/thu_thuat_phau_thuat/ekip/create",
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataToSend),
            success: function (response) {
                console.log("Lưu dữ liệu Ekip thành công:", response);
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
    console.log(" ts nè asdf fasfd", IDPhieuTTPT);
})();