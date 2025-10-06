// Bọc toàn bộ code trong IIFE để tránh redeclaration khi chuyển tab
(function () {
    'use strict';
    if (window.__templateTuongTrinhInitialized) {
        //console.log('Template Tuong Trinh already initialized');
        return;
    }
    window.__templateTuongTrinhInitialized = true;

    let selectKhoa = null;
    let isEdit = false;

    const searchInput = document.querySelector(".search-container input");
    const searchBtn = document.querySelector(".search-container button");
    const dataTemplateTable = document.getElementById("dataTemplateTable");
    const spinner = document.getElementById("loadingSpinner");
    const titleInputEl = document.getElementById("chiTietTitleInput");
    const btnSave = document.getElementById("btnSave");
    const btnCancel = document.getElementById("btnCancel");
    let allTemplates = [];

    function updateSaveButtonText() {
        if (!btnSave) return;
        btnSave.textContent = isEdit ? "Cập nhật" : "Thêm mới";

        if (btnCancel) {
            if (isEdit) {
                btnCancel.classList.remove("d-none");
            } else {
                btnCancel.classList.add("d-none");
            }
        }
    }

    // --- helper ---
    function generateAbbreviation(text) {
        if (!text || text === "Tất cả") return "";
        return text
            .split(" ")
            .map((w) => w[0].toUpperCase())
            .join("");
    }

    // --- load templates ---
    function renderTemplates(tbody, templates) {
        tbody.innerHTML = "";

        if (!templates || templates.length === 0) {
            tbody.innerHTML = `<tr><td class="text-center text-muted">Không có mẫu trình tự nào</td></tr>`;
            return;
        }

        templates.forEach((t) => {
            const tr = document.createElement("tr");
            tr.dataset.dv = JSON.stringify(t);
            tr.innerHTML = `<td class="text-start">${t.ten}</td>`;
            tr.style.cursor = "pointer";

            tr.addEventListener("click", () => {
                Array.from(tbody.querySelectorAll("tr")).forEach((r) =>
                    r.classList.remove("table-primary")
                );
                tr.classList.add("table-primary");

                // ✅ Gán dữ liệu và lưu originalData
                if (titleInputEl) {
                    let tData = JSON.parse(tr.dataset.dv);
                    titleInputEl.value = tData.ten;
                    titleInputEl.dataset.dv = JSON.stringify(tData);
                    titleInputEl.dataset.originalData = JSON.stringify(tData);
                    titleInputEl.dataset.oldValue = tData.ten;
                }

                loadChiTietThongTin(t.id);

                // Chuyển sang trạng thái Cập nhật
                isEdit = true;
                updateSaveButtonText();

                if (btnSave) btnSave.disabled = false;
            });

            tbody.appendChild(tr);
        });
    }

    // --- CẬP NHẬT ID KHOA MỚI MÀ KHÔNG LÀM MẤT DỮ LIỆU ĐÃ NHẬP ---
    function updateIdKhoaInFormData(newKhoaId) {
        // 1. Cập nhật metadata cho Title Input
        if (titleInputEl) {
            let titleData = {};
            try {
                titleData = JSON.parse(titleInputEl.dataset.dv || "{}");
            } catch (e) {
                console.error("Lỗi parse titleInputEl.dataset.dv:", e);
            }

            // Cập nhật IDKhoa mới, đảm bảo ID là null/0 cho trạng thái Thêm mới
            titleData.idKhoa = newKhoaId;
            titleData.id = null; // Luôn reset ID về null khi chuyển Khoa ở trạng thái Thêm mới
            // Bổ sung trường mới
            titleData.thongTinLuocDo = titleData.thongTinLuocDo ?? "";

            titleInputEl.dataset.dv = JSON.stringify(titleData);
        }

        // 2. Cập nhật metadata cho Details Input (Áp dụng cho cả 2 ô nội dung mới)
        const tbody = document.getElementById("dichVuTable");
        const tdLuocDo = tbody?.querySelector('td[data-field="thongTinLuocDo"]');
        const tdNoiDung = tbody?.querySelector('td[data-field="noiDung"]');

        if (tdLuocDo) {
            let detailData = {};
            try {
                detailData = JSON.parse(tdLuocDo.dataset.dv || "{}");
            } catch (e) {
                console.error("Lỗi parse tdLuocDo.dataset.dv:", e);
            }

            // Cập nhật IDKhoa mới, đảm bảo ID là null/0 cho trạng thái Thêm mới
            detailData.idKhoa = newKhoaId;
            detailData.id = null; // Luôn reset ID về null
            detailData.thongTinLuocDo = detailData.thongTinLuocDo ?? "";

            tdLuocDo.dataset.dv = JSON.stringify(detailData);
        }

        if (tdNoiDung) {
            let detailData = {};
            try {
                detailData = JSON.parse(tdNoiDung.dataset.dv || "{}");
            } catch (e) {
                console.error("Lỗi parse tdNoiDung.dataset.dv:", e);
            }

            // Cập nhật IDKhoa mới, đảm bảo ID là null/0 cho trạng thái Thêm mới
            detailData.idKhoa = newKhoaId;
            detailData.id = null; // Luôn reset ID về null
            detailData.thongTinLuocDo = detailData.thongTinLuocDo ?? ""; // Đảm bảo trường mới tồn tại

            tdNoiDung.dataset.dv = JSON.stringify(detailData);
        }

        // 3. Đảm bảo trạng thái là Thêm mới
        isEdit = false;
        updateSaveButtonText();
    }

    // --- load dữ liệu từ server ---
    async function loadTemplatesByKhoa(value) {
        const currentKhoaId = Number(value);

        if (currentKhoaId === 0) {
            if (dataTemplateTable) {
                dataTemplateTable.innerHTML = `<tr><td class="text-center text-muted">Vui lòng chọn khoa để xem danh sách</td></tr>`;
            }
            allTemplates = [];
            clearFormData();
            return;
        }

        if (!dataTemplateTable) return;

        dataTemplateTable.innerHTML = "";
        if (spinner) spinner.classList.remove("d-none");

        if (isEdit) {
            clearFormData();
        } else {
            updateIdKhoaInFormData(currentKhoaId);
        }

        try {
            let url = `/template_tuong_trinh/LayDanhSachTheoIDKhoa/${currentKhoaId}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const templates = await res.json();

            allTemplates = templates || [];
            renderTemplates(dataTemplateTable, allTemplates);
        } catch (err) {
            console.error("Lỗi load template:", err);
            dataTemplateTable.innerHTML = `<tr><td class="text-danger text-center">Lỗi khi tải danh sách</td></tr>`;
            allTemplates = [];
        } finally {
            if (spinner) spinner.classList.add("d-none");
        }
    }

    // --- search ---
    if (searchBtn && searchInput && dataTemplateTable) {
        searchBtn.addEventListener("click", () => {
            const keyword = searchInput.value.trim().toLowerCase();
            const filtered = allTemplates.filter((t) =>
                t.ten.toLowerCase().includes(keyword)
            );
            renderTemplates(dataTemplateTable, filtered);
        });
    }

    // --- load chi tiết (Đã cập nhật cho 2 trường nội dung: thongTinLuocDo và noiDung) ---
    async function loadChiTietThongTin(id) {
        const tbody = document.getElementById("dichVuTable");
        if (!tbody) return;
        // Thêm colspan=2 vì giờ có 2 cột nội dung
        tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Đang tải...</td></tr>`;

        try {
            const res = await fetch(`/template_tuong_trinh/LayChiTietTheoID/${id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            let templateData = await res.json(); // API trả về một đối tượng

            tbody.innerHTML = "";
            const currentKhoaId = selectKhoa?.getValue();

            if (!templateData || !templateData.id) {
                // Không tìm thấy dữ liệu, tải lại trạng thái Thêm mới
                clearFormData();
                return;
            }

            // --- Tạo một hàng (tr) duy nhất chứa hai ô (td) cho hai trường nội dung ---
            const tr = document.createElement("tr");
            tr.style.height = "100%";

            const dvWithKhoa = { ...templateData, idKhoa: currentKhoaId }; // Gắn ID Khoa

            // --- Ô cho ThongTinLuocDo ---
            const tdLuocDo = document.createElement("td");
            tdLuocDo.dataset.field = "thongTinLuocDo";
            tdLuocDo.dataset.dv = JSON.stringify(dvWithKhoa);
            tdLuocDo.dataset.originalData = JSON.stringify(dvWithKhoa);
            tdLuocDo.dataset.oldValue = templateData.thongTinLuocDo ?? "";

            const textareaLuocDo = document.createElement("textarea");
            textareaLuocDo.className = "form-control form-control-sm textarea-fixed-height";
            textareaLuocDo.placeholder = "Nhập mô tả lược đồ...";
            textareaLuocDo.value = templateData.thongTinLuocDo ?? "";

            textareaLuocDo.addEventListener("input", () => {
                //isEdit = true;
                updateSaveButtonText();
                const dvData = JSON.parse(tdLuocDo.dataset.dv);
                dvData.thongTinLuocDo = textareaLuocDo.value;
                tdLuocDo.dataset.dv = JSON.stringify(dvData);
            });
            tdLuocDo.appendChild(textareaLuocDo);
            tr.appendChild(tdLuocDo);

            // --- Ô cho NoiDung ---
            const tdNoiDung = document.createElement("td");
            tdNoiDung.dataset.field = "noiDung";
            tdNoiDung.dataset.dv = JSON.stringify(dvWithKhoa);
            tdNoiDung.dataset.originalData = JSON.stringify(dvWithKhoa);
            tdNoiDung.dataset.oldValue = templateData.noiDung ?? "";

            const textareaNoiDung = document.createElement("textarea");
            textareaNoiDung.className = "form-control form-control-sm textarea-fixed-height";
            textareaNoiDung.placeholder = "Nhập nội dung trình tự...";
            textareaNoiDung.value = templateData.noiDung ?? "";

            textareaNoiDung.addEventListener("input", () => {
                //isEdit = true;
                updateSaveButtonText();
                const dvData = JSON.parse(tdNoiDung.dataset.dv);
                dvData.noiDung = textareaNoiDung.value;
                tdNoiDung.dataset.dv = JSON.stringify(dvData);
            });
            tdNoiDung.appendChild(textareaNoiDung);
            tr.appendChild(tdNoiDung);

            tbody.appendChild(tr);

        } catch (err) {
            console.error("Lỗi load chi tiết:", err);
            tbody.innerHTML = `<tr><td colspan="2" class="text-danger text-center">Lỗi khi tải nội dung</td></tr>`;
        }
    }

    // --- editable title ---
    function setupTitleInputListener() {
        if (!titleInputEl) return;

        titleInputEl.addEventListener("blur", () => {
            const newValue = titleInputEl.value.trim();
            if (titleInputEl.dataset.dv && titleInputEl.dataset.dv !== "{}") {
                try {
                    const data = JSON.parse(titleInputEl.dataset.dv);
                    data.ten = newValue;
                    titleInputEl.dataset.dv = JSON.stringify(data);
                } catch (e) {
                    console.error("Lỗi parse data-dv:", e);
                }
            }
        });
    }
    setupTitleInputListener();

    // --- create new template (Đã cập nhật để lấy và gửi thongTinLuocDo) ---
    async function createNewTemplate() {
        const newTitle = titleInputEl.value.trim();
        const tbody = document.getElementById("dichVuTable");

        const textareaLuocDo = tbody?.querySelector('td[data-field="thongTinLuocDo"] textarea');
        const thongTinLuocDo = textareaLuocDo?.value.trim() ?? "";

        const textareaNoiDung = tbody?.querySelector('td[data-field="noiDung"] textarea');
        const noiDung = textareaNoiDung?.value.trim() ?? "";

        const idKhoa = Number(selectKhoa?.getValue());
        //console.log(idKhoa);
        const newData = {
            ten: newTitle,
            noiDung: noiDung,
            thongTinLuocDo: thongTinLuocDo, // Thêm trường mới
            idKhoa: idKhoa,
            active: true
        };

        try {
            const res = await fetch("/template_tuong_trinh/Create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newData),
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const newTemplate = await res.json();

            toastr && toastr.success("Thêm mẫu mới thành công!");

            isEdit = true;
            updateSaveButtonText();

            // Cập nhật dataset sau khi tạo mới
            const newTemplateData = {
                id: newTemplate.id,
                ten: newTemplate.ten,
                noiDung: noiDung,
                thongTinLuocDo: thongTinLuocDo,
                idKhoa: idKhoa
            };

            titleInputEl.dataset.dv = JSON.stringify(newTemplateData);
            titleInputEl.dataset.originalData = JSON.stringify(newTemplateData);
            titleInputEl.dataset.oldValue = newTemplate.ten;

            const tdLuocDo = tbody.querySelector('td[data-field="thongTinLuocDo"]');
            if (tdLuocDo) {
                tdLuocDo.dataset.dv = JSON.stringify(newTemplateData);
                tdLuocDo.dataset.originalData = JSON.stringify(newTemplateData);
                tdLuocDo.dataset.oldValue = thongTinLuocDo;
            }

            const tdNoiDung = tbody.querySelector('td[data-field="noiDung"]');
            if (tdNoiDung) {
                tdNoiDung.dataset.dv = JSON.stringify(newTemplateData);
                tdNoiDung.dataset.originalData = JSON.stringify(newTemplateData);
                tdNoiDung.dataset.oldValue = noiDung;
            }

            return true;
        } catch (err) {
            toastr && toastr.error("Lỗi khi thêm mẫu mới!");
            console.error("❌ Lỗi createNewTemplate:", err);
            return false;
        }
    }

    // --- save title ---
    async function saveTitle(showToast = true) {
        console.log("Save tittle");
        if (!titleInputEl || !titleInputEl.dataset.dv) return false;
        let dvTitle = null;
        try {
            dvTitle = JSON.parse(titleInputEl.dataset.dv);
        } catch (e) {
            dvTitle = null;
        }
        if (!dvTitle || !dvTitle.id) return false;

        const newTitle = titleInputEl.value.trim();
        const originalTitle = JSON.parse(titleInputEl.dataset.originalData || "{}").ten ?? "";
        if (newTitle === originalTitle) return false;

        if (!newTitle) {
            toastr && toastr.error("Tiêu đề không được để trống!");
            return false;
        }

        try {
            const res = await fetch("/template_tuong_trinh/CapNhat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: dvTitle.id, ten: newTitle }),
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const updated = await res.json();

            let updatedData = JSON.parse(titleInputEl.dataset.originalData);
            updatedData.ten = updated.ten ?? newTitle;
            titleInputEl.dataset.originalData = JSON.stringify(updatedData);

            // Cập nhật dataset.dv để đồng bộ (dù không cần thiết lắm vì titleInputEl chỉ quan tâm đến ten)
            titleInputEl.dataset.dv = JSON.stringify({ ...updatedData, ten: newTitle });

            return true;
        } catch (err) {
            console.error("❌ Lỗi saveTitle:", err);
            return false;
        }
    }

    // --- save details (Đã cập nhật cho 2 trường nội dung) ---
    async function saveDetails(showToast = true) {
        console.log("Save saveDetails");

        const tbody = document.getElementById("dichVuTable");
        const tdLuocDo = tbody?.querySelector('td[data-field="thongTinLuocDo"]');
        const tdNoiDung = tbody?.querySelector('td[data-field="noiDung"]');

        if (!tdLuocDo || !tdNoiDung || !tdLuocDo.dataset.dv) return false;

        let dv = null;
        try {
            // Cả hai td đều chứa dữ liệu template
            dv = JSON.parse(tdLuocDo.dataset.dv);
        } catch (e) {
            dv = null;
        }
        if (!dv || !dv.id) return false;

        const originalData = JSON.parse(tdLuocDo.dataset.originalData || "{}");

        const textareaLuocDo = tdLuocDo.querySelector("textarea");
        const newLuocDo = textareaLuocDo?.value.trim() ?? "";

        const textareaNoiDung = tdNoiDung.querySelector("textarea");
        const newNoiDung = textareaNoiDung?.value.trim() ?? "";

        const originalLuocDo = originalData.thongTinLuocDo ?? "";
        const originalNoiDung = originalData.noiDung ?? "";

        let hasChanges = false;
        let updatePayload = { id: dv.id };

        if (newLuocDo !== originalLuocDo) {
            updatePayload.thongTinLuocDo = newLuocDo;
            hasChanges = true;
        }
        if (newNoiDung !== originalNoiDung) {
            updatePayload.noiDung = newNoiDung;
            hasChanges = true;
        }

        if (!hasChanges) return false; // Không có thay đổi để lưu

        try {
            const res = await fetch("/template_tuong_trinh/CapNhat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const updated = await res.json();

            // Cập nhật lại dữ liệu gốc (originalData)
            let updatedOriginalData = originalData;

            if (updatePayload.thongTinLuocDo !== undefined) {
                updatedOriginalData.thongTinLuocDo = updated.thongTinLuocDo ?? updatePayload.thongTinLuocDo;
            }
            if (updatePayload.noiDung !== undefined) {
                updatedOriginalData.noiDung = updated.noiDung ?? updatePayload.noiDung;
            }

            // Cập nhật dataset trên cả hai TDs
            tdLuocDo.dataset.originalData = JSON.stringify(updatedOriginalData);
            tdNoiDung.dataset.originalData = JSON.stringify(updatedOriginalData);

            // Cập nhật dataset.dv hiện tại để xóa trạng thái chỉnh sửa
            tdLuocDo.dataset.dv = JSON.stringify(updatedOriginalData);
            tdNoiDung.dataset.dv = JSON.stringify(updatedOriginalData);

            return true;
        } catch (err) {
            console.error("❌ Lỗi cập nhật chi tiết:", err);
            return false;
        }
    }

    // --- isValidation (Đã cập nhật để kiểm tra cả 2 trường nội dung) ---
    function isValidation(checkId = true) {
        if (!titleInputEl || !titleInputEl.dataset.dv) return false;

        const newTitle = titleInputEl.value.trim();

        if (!newTitle) {
            toastr && toastr.error("Tiêu đề không được để trống!");
            return false;
        }

        const currentKhoaId = Number(selectKhoa?.getValue() || 0);
        if (!currentKhoaId || currentKhoaId === 0) {
            toastr && toastr.error("Vui lòng chọn Khoa!");
            return false;
        }

        if (checkId) {
            if (!JSON.parse(titleInputEl.dataset.dv).id) {
                toastr && toastr.error("Không tìm thấy ID mẫu. Vui lòng chọn lại mẫu hoặc nhấn Hủy để thêm mới!");
                return false;
            }
        }

        const tbody = document.getElementById("dichVuTable");
        const textareaLuocDo = tbody?.querySelector('td[data-field="thongTinLuocDo"] textarea');
        const textareaNoiDung = tbody?.querySelector('td[data-field="noiDung"] textarea');

        if (!textareaLuocDo || !textareaLuocDo.value.trim()) {
            toastr && toastr.error("Mô tả lược đồ không được để trống!");
            return false;
        }

        if (!textareaNoiDung || !textareaNoiDung.value.trim()) {
            toastr && toastr.error("Nội dung trình tự không được để trống!");
            return false;
        }


        return true;
    }

    // --- save all ---
    async function saveAllEdits() {
        const currentKhoaId = Number(selectKhoa?.getValue());
        //console.log("currentKhoaId = ", currentKhoaId);

        if (!isValidation(isEdit)) return;

        let success = false;
        if (isEdit) {
            const titleResult = await saveTitle(false);
            const detailsResult = await saveDetails(false);
            success = titleResult || detailsResult;
            if (success) {
                toastr && toastr.success("Cập nhật thành công!");
            } else {
                toastr && toastr.info("Không có thay đổi nào để lưu.");
            }
        } else {
            success = await createNewTemplate();
            if (success) {
                loadTemplatesByKhoa(currentKhoaId);
            }
        }
    }

    if (btnSave) btnSave.addEventListener("click", saveAllEdits);

    // --- cancel edit (Đã cập nhật để khôi phục 2 trường nội dung) ---
    // J0303TemplateTuongTrinh.js

    function cancelEdit(showToast = true) {
        if (isEdit) {

            clearFormData(false);

            isEdit = false; 
            updateSaveButtonText();
            if (showToast) toastr && toastr.info("Đã chuyển sang trạng thái Thêm mới.");

        } else {
            clearFormData(showToast);
        }
    }

    if (btnCancel) btnCancel.addEventListener("click", () => cancelEdit(true));

    // --- initTomSelectKhoa ---
    function initTomSelectKhoa(data) {
        if (selectKhoa?.tomselect) {
            return;
        }

        const options = data.map((k) => ({
            ma: k.id,
            ten: k.ten,
            vietTat: generateAbbreviation(k.ten),
        }));

        selectKhoa = new window.TomSelect(".cbTemplateKhoa", {
            valueField: "ma",
            labelField: "ten",
            searchField: ["ten", "vietTat"],
            placeholder: "-- Chọn khoa ---",
            maxItems: 1,
            //options: [{ ma: 0, ten: "-- Chọn khoa ---", vietTat: "" }].concat(options),
            options: options,
            render: {
                option: (data, escape) =>
                    `<div class="d-flex justify-content-between"><span>${escape(
                        data.ten
                    )}</span><small class="text-muted">(${escape(
                        data.vietTat
                    )})</small></div>`,
                item: (data, escape) => `<div>${escape(data.ten)}</div>`,
            },
            onChange: loadTemplatesByKhoa,
        });
    }

    // --- clearFormData (Đã cập nhật HTML và gắn Listener cho 2 trường nội dung) ---
    function clearFormData(showToast = false) {
        const currentKhoaId = Number(selectKhoa?.getValue() || 0);

        Array.from(document.querySelectorAll("#dataTemplateTable tr")).forEach(r =>
            r.classList.remove("table-primary")
        );

        if (titleInputEl) {
            titleInputEl.value = "";
            // Thêm trường thongTinLuocDo vào dataset.dv
            titleInputEl.dataset.dv = JSON.stringify({ id: null, ten: "", noiDung: "", thongTinLuocDo: "", idKhoa: currentKhoaId });
            titleInputEl.dataset.oldValue = "";
            titleInputEl.dataset.originalData = "";
            titleInputEl.placeholder = "Nhập tên mẫu tường trình mới...";
        }

        const tbody = document.getElementById("dichVuTable");
        if (tbody) {
            // Cấu trúc HTML mới cho 2 ô nội dung
            const initialData = { id: null, noiDung: "", thongTinLuocDo: "", idKhoa: currentKhoaId };
            tbody.innerHTML = `<tr style="height:100%;">
                 <td data-field="thongTinLuocDo" 
                     data-dv='${JSON.stringify(initialData)}' 
                     data-original-data='${JSON.stringify(initialData)}' 
                     data-old-value="">
                    <textarea class="form-control textarea-fixed-height"
                                placeholder="Nhập mô tả lược đồ mới..."
                                rows="5"></textarea>
                </td>
                 <td data-field="noiDung" 
                     data-dv='${JSON.stringify(initialData)}' 
                     data-original-data='${JSON.stringify(initialData)}' 
                     data-old-value="">
                    <textarea class="form-control textarea-fixed-height"
                                placeholder="Nhập nội dung trình tự  mới..."
                                rows="5"></textarea>
                </td>
            </tr>`;

            // Gắn lại sự kiện cho các textarea mới
            const tdLuocDo = tbody.querySelector('td[data-field="thongTinLuocDo"]');
            const textareaLuocDo = tdLuocDo?.querySelector('textarea');
            if (textareaLuocDo) {
                textareaLuocDo.addEventListener("input", () => {
                    //isEdit = true;
                    updateSaveButtonText();
                    const dvData = JSON.parse(tdLuocDo.dataset.dv);
                    dvData.thongTinLuocDo = textareaLuocDo.value;
                    tdLuocDo.dataset.dv = JSON.stringify(dvData);
                });
            }

            const tdNoiDung = tbody.querySelector('td[data-field="noiDung"]');
            const textareaNoiDung = tdNoiDung?.querySelector('textarea');
            if (textareaNoiDung) {
                textareaNoiDung.addEventListener("input", () => {
                    //isEdit = true;
                    updateSaveButtonText();
                    const dvData = JSON.parse(tdNoiDung.dataset.dv);
                    dvData.noiDung = textareaNoiDung.value;
                    tdNoiDung.dataset.dv = JSON.stringify(dvData);
                });
            }
        }

        isEdit = false;
        updateSaveButtonText();
        if (showToast) toastr && toastr.info("Đã chuyển sang trạng thái Thêm mới.");
    }

    // --- initializeApp ---
    async function initializeApp(defaultKhoaId) {

        try {
            const response = await fetch("/template_tuong_trinh/khoa/all");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const khoaData = await response.json();
            console.log("Template khoa == ", khoaData);
            initTomSelectKhoa(khoaData);

        } catch (err) {
            console.error("Lỗi load khoa:", err);
        }

        const modalEl = document.getElementById("myModal");
        if (modalEl) {
            modalEl.addEventListener("shown.bs.modal", () => {
                clearFormData();
                if (dataTemplateTable) {
                    dataTemplateTable.innerHTML = `<tr><td class="text-center text-muted">Vui lòng chọn khoa để xem danh sách</td></tr>`;
                }

                // === THAY ĐỔI Ở ĐÂY ===
                // 1. Lấy giá trị của window.IdKhoa (kiểm tra đảm bảo nó là số hợp lệ)
                //const defaultKhoaId = Number(window.IdKhoa) || 0;
                console.log("defaultKhoaId === ", defaultKhoaId);
                // 2. Set giá trị cho TomSelect
                if (selectKhoa && defaultKhoaId !== 0) {
                    // TomSelect cần thời gian để khởi tạo, đảm bảo nó đã sẵn sàng.
                    // setValue(value) sẽ kích hoạt loadTemplatesByKhoa
                    selectKhoa.setValue(defaultKhoaId);
                    loadTemplatesByKhoa(defaultKhoaId);

                } else if (selectKhoa) {
                    // Nếu IdKhoa không hợp lệ hoặc không có, reset về 0
                    selectKhoa.setValue(0);
                    loadTemplatesByKhoa(0);
                }
                // ========================
            });

            modalEl.addEventListener("hidden.bs.modal", () => {
                clearFormData();
                if (selectKhoa) selectKhoa.setValue(0);
                if (dataTemplateTable) {
                    dataTemplateTable.innerHTML = `<tr><td class="text-center text-muted">Vui lòng chọn khoa để xem danh sách</td></tr>`;
                }
                const dichVuTable = document.getElementById("dichVuTable");
                if (dichVuTable) {
                    // Cập nhật thông báo sau khi đóng modal
                    dichVuTable.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Không tìm thấy nội dung</td></tr>`;
                }
            });
        }
    }
    //initializeApp();
    window.initializeApp = initializeApp;

})();