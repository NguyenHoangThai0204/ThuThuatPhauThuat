// Bọc toàn bộ code trong IIFE để tránh redeclaration khi chuyển tab
(function () {
    'use strict';
    if (window.__templateTuongTrinhInitialized) {
        console.log('Template Tuong Trinh already initialized');
        return;
    }
    window.__templateTuongTrinhInitialized = true;

    let selectKhoa;
    let isEdit = false;

    const searchInput = document.querySelector(".search-container input");
    const searchBtn = document.querySelector(".search-container a");
    const goiVuTable = document.getElementById("goiVuTable");
    const spinner = document.getElementById("loadingSpinner");
    const titleInputEl = document.getElementById("chiTietTitleInput");
    const btnSave = document.getElementById("btnSave");
    const btnCancel = document.getElementById("btnCancel");
    let allTemplates = [];

    function updateSaveButtonText() {
        if (!btnSave) return;
        btnSave.textContent = isEdit ? "Cập nhật" : "Thêm mới";

        // ✅ Nút Hủy chỉ hiện khi ở trạng thái Cập nhật
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
            tbody.innerHTML = `<tr><td class="text-center text-muted">Không có thông tin</td></tr>`;
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

            titleInputEl.dataset.dv = JSON.stringify(titleData);
        }

        // 2. Cập nhật metadata cho Details Input
        const tbody = document.getElementById("dichVuTable");
        const td = tbody?.querySelector("td");
        if (td) {
            let detailData = {};
            try {
                detailData = JSON.parse(td.dataset.dv || "{}");
            } catch (e) {
                console.error("Lỗi parse td.dataset.dv:", e);
            }

            // Cập nhật IDKhoa mới, đảm bảo ID là null/0 cho trạng thái Thêm mới
            detailData.idKhoa = newKhoaId;
            detailData.id = null; // Luôn reset ID về null

            td.dataset.dv = JSON.stringify(detailData);
        }

        // 3. Đảm bảo trạng thái là Thêm mới
        isEdit = false;
        updateSaveButtonText();
    }

    // --- load dữ liệu từ server ---
    async function loadTemplatesByKhoa(value) {
        const currentKhoaId = Number(value);

        if (currentKhoaId === 0) {
            if (goiVuTable) {
                goiVuTable.innerHTML = `<tr><td class="text-center text-muted">Vui lòng chọn khoa để xem danh sách</td></tr>`;
            }
            allTemplates = [];
            clearFormData();
            return;
        }

        if (!goiVuTable) return;

        goiVuTable.innerHTML = "";
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
            renderTemplates(goiVuTable, allTemplates);
        } catch (err) {
            console.error("Lỗi load template:", err);
            goiVuTable.innerHTML = `<tr><td class="text-danger text-center">Lỗi khi tải danh sách</td></tr>`;
            allTemplates = [];
        } finally {
            if (spinner) spinner.classList.add("d-none");
        }
    }

    // --- search ---
    if (searchBtn && searchInput && goiVuTable) {
        searchBtn.addEventListener("click", () => {
            const keyword = searchInput.value.trim().toLowerCase();
            const filtered = allTemplates.filter((t) =>
                t.ten.toLowerCase().includes(keyword)
            );
            renderTemplates(goiVuTable, filtered);
        });
    }

    // --- load chi tiết ---
    async function loadChiTietThongTin(id) {
        const tbody = document.getElementById("dichVuTable");
        if (!tbody) return;
        tbody.innerHTML = `<tr><td class="text-center text-muted">Đang tải...</td></tr>`;

        try {
            const res = await fetch(`/template_tuong_trinh/LayChiTietTheoID/${id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            let dichVus = await res.json();
            if (!Array.isArray(dichVus)) dichVus = dichVus ? [dichVus] : [];

            tbody.innerHTML = "";
            if (dichVus.length === 0) {
                tbody.innerHTML = `<tr>
                                    <td data-dv='${JSON.stringify({ id: id, noiDung: "", idKhoa: selectKhoa?.getValue() })}' 
                                        data-original-data='${JSON.stringify({ id: id, noiDung: "", idKhoa: selectKhoa?.getValue() })}' 
                                        data-old-value="">
                                        <textarea class="form-control form-control-sm textarea-fixed-height"
                                                    placeholder="Nhập nội dung mới..."
                                                    rows="5"></textarea>
                                    </td>
                                  </tr>`;
            } else {
                dichVus.forEach((dv) => {
                    const tr = document.createElement("tr");
                    const td = document.createElement("td");

                    const dvWithKhoa = { ...dv, idKhoa: selectKhoa?.getValue() };
                    td.dataset.dv = JSON.stringify(dvWithKhoa);
                    td.dataset.originalData = JSON.stringify(dvWithKhoa);
                    td.dataset.oldValue = dv.noiDung ?? "";

                    const textarea = document.createElement("textarea");
                    textarea.className = "form-control form-control-sm textarea-fixed-height";
                    textarea.placeholder = "Nhập nội dung mới...";
                    textarea.value = dv.noiDung ?? "";
                    td.appendChild(textarea);

                    textarea.addEventListener("input", () => {
                        isEdit = true;
                        updateSaveButtonText();
                        const dvData = JSON.parse(td.dataset.dv);
                        dvData.noiDung = textarea.value;
                        td.dataset.dv = JSON.stringify(dvData);
                    });

                    tr.appendChild(td);
                    tbody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error("Lỗi load chi tiết:", err);
            tbody.innerHTML = `<tr><td class="text-danger text-center">Lỗi khi tải nội dung</td></tr>`;
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

    // --- create new template ---
    async function createNewTemplate() {
        const newTitle = titleInputEl.value.trim();
        const tbody = document.getElementById("dichVuTable");
        const textarea = tbody?.querySelector("textarea");
        const noiDung = textarea?.value.trim() ?? "";

        const idKhoa = Number(selectKhoa?.getValue());
        console.log(idKhoa);
        const newData = {
            ten: newTitle,
            noiDung: noiDung,
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

            const newTemplateData = {
                id: newTemplate.id,
                ten: newTemplate.ten,
                noiDung: newTemplate.noiDung,
                idKhoa: idKhoa
            };

            titleInputEl.dataset.dv = JSON.stringify(newTemplateData);
            titleInputEl.dataset.originalData = JSON.stringify(newTemplateData);
            titleInputEl.dataset.oldValue = newTemplate.ten;

            const td = tbody.querySelector("td");
            if (td) {
                td.dataset.dv = JSON.stringify(newTemplateData);
                td.dataset.originalData = JSON.stringify(newTemplateData);
                td.dataset.oldValue = newTemplate.noiDung;
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

            return true;
        } catch (err) {
            console.error("❌ Lỗi saveTitle:", err);
            return false;
        }
    }

    // --- save details ---
    async function saveDetails(showToast = true) {
        const rows = document.querySelectorAll("#dichVuTable tr");
        let hasChanges = false;
        let success = true;

        for (const row of rows) {
            const td = row.querySelector("td");
            if (!td || !td.dataset.dv) continue;
            let dv = null;
            try {
                dv = JSON.parse(td.dataset.dv);
            } catch (e) {
                dv = null;
            }
            if (!dv || !dv.id) continue;

            const originalContent = JSON.parse(td.dataset.originalData || "{}").noiDung ?? "";
            const textarea = td.querySelector("textarea");
            const newValue = textarea?.value.trim() ?? "";

            if (newValue !== originalContent) {
                hasChanges = true;
                try {
                    const res = await fetch("/template_tuong_trinh/CapNhat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: dv.id, noiDung: newValue }),
                    });
                    if (!res.ok) throw new Error("HTTP " + res.status);
                    const updated = await res.json();

                    let updatedData = JSON.parse(td.dataset.originalData);
                    updatedData.noiDung = updated?.noiDung ?? newValue;
                    td.dataset.originalData = JSON.stringify(updatedData);

                } catch (err) {
                    console.error("❌ Lỗi cập nhật:", err);
                    success = false;
                }
            }
        }

        return hasChanges && success;
    }

    // --- isValidation ---
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
        const textarea = tbody?.querySelector("textarea");
        if (!textarea || !textarea.value.trim()) {
            toastr && toastr.error("Nội dung không được để trống!");
            return false;
        }

        return true;
    }

    // --- save all ---
    async function saveAllEdits() {
        const currentKhoaId = Number(selectKhoa?.getValue());
        console.log("currentKhoaId = ", currentKhoaId);

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

    // --- cancel edit ---
    function cancelEdit(showToast = true) {
        if (isEdit) {
            if (titleInputEl && titleInputEl.dataset.originalData) {
                const originalData = JSON.parse(titleInputEl.dataset.originalData);
                titleInputEl.value = originalData.ten;
                titleInputEl.dataset.dv = titleInputEl.dataset.originalData;
            }

            const tbody = document.getElementById("dichVuTable");
            const rows = tbody.querySelectorAll("tr");
            rows.forEach(row => {
                const td = row.querySelector("td");
                const textarea = td?.querySelector("textarea");
                if (td && textarea && td.dataset.originalData) {
                    const originalData = JSON.parse(td.dataset.originalData);
                    textarea.value = originalData.noiDung ?? "";
                    td.dataset.dv = td.dataset.originalData;
                }
            });

            isEdit = true;
            updateSaveButtonText();
            if (showToast) toastr && toastr.info("Đã khôi phục nội dung về trạng thái ban đầu.");

        } else {
            clearFormData(showToast);
        }
    }

    if (btnCancel) btnCancel.addEventListener("click", () => cancelEdit(true));

    // --- initTomSelectKhoa ---
    function initTomSelectKhoa(data) {
        if (selectKhoa) {
            selectKhoa.destroy();
            selectKhoa = null;
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
            options: [{ ma: 0, ten: "-- Chọn khoa ---", vietTat: "" }].concat(options),
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
        selectKhoa.setValue(0);
    }

    // --- clearFormData ---
    function clearFormData(showToast = false) {
        const currentKhoaId = Number(selectKhoa?.getValue() || 0);

        Array.from(document.querySelectorAll("#goiVuTable tr")).forEach(r =>
            r.classList.remove("table-primary")
        );

        if (titleInputEl) {
            titleInputEl.value = "";
            titleInputEl.dataset.dv = JSON.stringify({ id: null, ten: "", noiDung: "", idKhoa: currentKhoaId });
            titleInputEl.dataset.oldValue = "";
            titleInputEl.dataset.originalData = "";
            titleInputEl.placeholder = "Nhập tên mẫu tường trình mới...";
        }

        const tbody = document.getElementById("dichVuTable");
        if (tbody) {
            tbody.innerHTML = `<tr>
                <td data-dv='${JSON.stringify({ id: null, noiDung: "", idKhoa: currentKhoaId })}' data-old-value="" data-original-data="">
                    <textarea class="form-control form-control-sm textarea-fixed-height"
                                placeholder="Nhập nội dung mới..."
                                rows="5"></textarea>
                </td>
            </tr>`;
        }

        isEdit = false;
        updateSaveButtonText();
        if (showToast) toastr && toastr.info("Đã chuyển sang trạng thái Thêm mới.");
    }

    // --- initializeApp ---
    async function initializeApp() {
        try {
            const response = await fetch("/template_tuong_trinh/khoa/all");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const khoaData = await response.json();
            initTomSelectKhoa(khoaData);

        } catch (err) {
            console.error("Lỗi load khoa:", err);
        }

        const modalEl = document.getElementById("myModal");
        if (modalEl) {
            modalEl.addEventListener("shown.bs.modal", () => {
                clearFormData();
            });

            modalEl.addEventListener("hidden.bs.modal", () => {
                clearFormData();
                if (selectKhoa) selectKhoa.setValue(0);
                if (goiVuTable) {
                    goiVuTable.innerHTML = `<tr><td class="text-center text-muted">Vui lòng chọn khoa để xem danh sách</td></tr>`;
                }
                const dichVuTable = document.getElementById("dichVuTable");
                if (dichVuTable) {
                    dichVuTable.innerHTML = `<tr><td class="text-center text-muted">Không có nội dung</td></tr>`;
                }
            });
        }
    }

    initializeApp();

})();