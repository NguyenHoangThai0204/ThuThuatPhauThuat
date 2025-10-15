// trinh-tu-editor.js
var DEFAULT_KHOA_ID = parseInt(window.MaKhoa || 0);
window.templateTomSelectInstance = window.templateTomSelectInstance || null;
window.allTemplatesData = window.allTemplatesData || [];
window.imagesFromKhoa = [];
window.imagesFromPhieu = [];

function normalizeData(data, tenField = 'Ten', viettatField = 'alias') {
    if (!Array.isArray(data)) return [];
    return data.map(n => {
        const ten = n[tenField]?.trim() || "";
        const viettat = n[viettatField]?.trim() || "";
        let generatedAlias = viettat
            ? viettat.toUpperCase()
            : (ten.split(/\s+|-|\/|\(|\)|[^\w\s]/g).filter(w => w.length > 0)
                .map(w => w.charAt(0)?.toUpperCase())
                .join("").replace(/[^A-Z0-9]/g, ''));
        return { ...n, alias: generatedAlias };
    });
}

function fetchDataAndNormalize(url, tenField = 'ten', viettatField = 'alias') {
    return new Promise((resolve) => {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: templates => resolve(normalizeData(templates, tenField, viettatField)),
            error: () => resolve([])
        });
    });
}

async function initTemplateTomSelect(url) {
    allTemplatesData = await fetchDataAndNormalize(url, 'ten', 'ten');
    const templateSelectEl = document.querySelector('.cbTemplateTTPT');
    if (!templateSelectEl && !templateSelectEl.tomselect) return;
    templateTomSelectInstance = new window.TomSelect('.cbTemplateTTPT', {
        options: allTemplatesData,
        valueField: "id",
        labelField: "ten",
        searchField: ["ten", "alias"],
        placeholder: "-- Chọn mẫu --",
        maxItems: 1,
        preload: true,
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
            no_results: (data, escape) =>
                `<div class="no-results" style="padding:6px 10px;color:#999;">Không tìm thấy "${escape(data.input)}"</div>`
        }
    });
}

function applyTemplate() {
    if (!templateTomSelectInstance) return;
    const selectedTemplateId = templateTomSelectInstance.getValue();
    const editorContent = document.getElementById('editorContent');
    const diagramContent = document.getElementById('editorDiagram');
    if (!selectedTemplateId) {
        editorContent.innerHTML = '';
        alert("Vui lòng chọn một mẫu tường trình trước khi áp dụng.");
        return;
    }
    const selectedTemplate = allTemplatesData.find(t => t.id.toString() === selectedTemplateId.toString());
    if (selectedTemplate && selectedTemplate.noiDung) {
        editorContent.innerHTML = selectedTemplate.noiDung;
    } else {
        alert("Lỗi: Không tìm thấy nội dung mẫu tường trình.");
    }
    diagramContent.innerHTML = selectedTemplate?.thongTinLuocDo || '';
}

function setupEditorFocus() {
    const editors = [
        { element: document.getElementById('editorDiagram'), panel: 'diagram' },
        { element: document.getElementById('editorContent'), panel: 'content' }
    ];

    editors.forEach(({ element, panel }) => {
        element.addEventListener('focus', function () {
            document.querySelectorAll('.sequence-infor-panel, .sequence-editor-panel')
                .forEach(panel => panel.classList.remove('active-panel'));

            const parentPanel = this.closest('.sequence-infor-panel, .sequence-editor-panel');
            if (parentPanel) {
                parentPanel.classList.add('active-panel');
            }
        });

        element.addEventListener('blur', function () {
            const parentPanel = this.closest('.sequence-infor-panel, .sequence-editor-panel');
            if (parentPanel) {
                parentPanel.classList.remove('active-panel');
            }
        });
    });
}

function initEditorStyles() {
    window.activePanelCSS = `
        .sequence-infor-panel.active-panel {
            box-shadow: 0 0 0 2px #1976d2, inset 0 0 8px rgba(25, 118, 210, 0.1);
        }

        .sequence-editor-panel.active-panel {
            box-shadow: 0 0 0 2px #388e3c, inset 0 0 8px rgba(56, 142, 60, 0.1);
        }

        .sequence-container .section-header {
            transition: all 0.3s ease;
        }`;

    const style = document.createElement('style');
    style.textContent = `
        ${window.activePanelCSS}

        #editorContent, #editorDiagram {
            font-size: 14pt !important;
        }

        #editorContent *, #editorDiagram * {
            font-size: 14pt !important;
        }
    `;
    document.head.appendChild(style);
}

// ==== IMAGE PANEL LOGIC ====
function initImagePanel() {
    const btnAddImagePanel = document.getElementById('btnAddImagePanel');
    const fileInput = document.getElementById('fileInput');
    const phieuImagesContainer = document.getElementById('phieuImagesContainer');
    const khoaImagesContainer = document.getElementById('khoaImagesContainer');

    let hasLoadedKhoa = false;
    let hasLoadedPhieu = false;

    if (btnAddImagePanel) {
        initTooltip(btnAddImagePanel);
        btnAddImagePanel.addEventListener('mouseenter', function (e) {
            if (!this._tooltip && document.body.contains(this)) {
                this._tooltip = new bootstrap.Tooltip(this, {
                    trigger: 'manual',
                    boundary: 'window'
                });
            }
            if (this._tooltip) this._tooltip.show();
        });
        btnAddImagePanel.addEventListener('mouseleave', function (e) {
            if (this._tooltip) this._tooltip.hide();
        });
    }

    btnAddImagePanel.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', function (e) {
        const files = e.target.files;
        if (files.length > 0) {
            handleImageUpload(files);
        }
        fileInput.value = '';
    });

    async function handleImageUpload(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!file.type.startsWith('image/')) {
                alert('Chỉ chấp nhận file ảnh!');
                continue;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert(`File ${file.name} vượt quá kích thước cho phép (10MB)`);
                continue;
            }

            const loadingItem = document.createElement('div');
            loadingItem.className = 'image-item upload-loading';
            loadingItem.innerHTML = `
                <div class="image-item-header">
                    <div class="image-item-title">${file.name}</div>
                </div>
                <small class="image-item-time">Đang upload...</small>
                <div class="upload-progress">
                    <div class="progress-bar"></div>
                </div>
            `;

            khoaImagesContainer.insertBefore(loadingItem, khoaImagesContainer.firstChild);

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('maKhoa', window.MaKhoa);

                const response = await fetch('/thu_thuat_phau_thuat/trinh-tu/upload-image-to-khoa', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    loadingItem.remove();

                    const newImage = {
                        id: `khoa_${result.data.id || Date.now()}_${i}`,
                        name: result.data.fileName,
                        src: result.data.httpUrl,
                        ftpUrl: result.data.url,
                        timestamp: new Date(),
                        source: 'khoa',
                        inPhieu: false
                    };

                    window.imagesFromKhoa.unshift(newImage);
                    addKhoaImageToPanel(newImage, false, true);
                    updateImageCounts();

                    toastr.success(`Đã thêm ảnh "${file.name}" vào khoa`);

                } else {
                    throw new Error(result.message || 'Upload thất bại');
                }
            } catch (error) {
                console.error(`Lỗi upload ảnh ${file.name}:`, error);
                loadingItem.remove();
                alert(`Lỗi upload ảnh [${file.name}]: ${error.message}`);
            }
        }
    }
    function compareAndMarkImages() {
        phieuImagesContainer.innerHTML = '';
        khoaImagesContainer.innerHTML = '';

        const phieuImageNames = new Set(window.imagesFromPhieu.map(img => img.name.toLowerCase()));

        window.imagesFromKhoa.forEach(khoaImage => {
            const hasInPhieu = phieuImageNames.has(khoaImage.name.toLowerCase());
            addKhoaImageToPanel(khoaImage, hasInPhieu);
        });

        window.imagesFromPhieu.forEach(phieuImage => {
            addPhieuImageToPanel(phieuImage);
        });

        updateImageCounts();
    }

    function checkAndCompareImages() {
        if (hasLoadedKhoa && hasLoadedPhieu) {
            compareAndMarkImages();
        }
    }

    async function loadImagesFromServerByMaKhoa(makhoa) {
        try {
            const response = await fetch(`/thu_thuat_phau_thuat/trinh-tu/list-anh-truong-trinh-by-makhoa?makhoa=${makhoa}`);

            if (!response.ok) {
                window.imagesFromKhoa = [];
                hasLoadedKhoa = true;
                checkAndCompareImages();
                return;
            }

            const result = await response.json();

            if (result.success && result.images && result.images.length > 0) {
                window.imagesFromKhoa = result.images.map((img, index) => ({
                    id: `khoa_${img.id || index + 1}`,
                    name: img.tenAnh,
                    src: img.httpUrl,
                    ftpUrl: img.fullPath,
                    timestamp: new Date(img.modifiedDate || Date.now()),
                    source: 'khoa',
                    inPhieu: false
                }));
            } else {
                window.imagesFromKhoa = [];
            }

            hasLoadedKhoa = true;
            checkAndCompareImages();
        } catch (error) {
            console.error('Lỗi khi load ảnh từ khoa:', error);
            window.imagesFromKhoa = [];
            hasLoadedKhoa = true;
            checkAndCompareImages();
        }
    }

    async function loadImagesFromServer(idPhieuTTPT) {
        if (!idPhieuTTPT || idPhieuTTPT === 0) {
            hasLoadedPhieu = true;
            checkAndCompareImages();
            return;
        }

        try {
            const url = `/thu_thuat_phau_thuat/trinh-tu/get-images/${idPhieuTTPT}`;
            const response = await fetch(url);
            const result = await response.json();

            if (result.success && result.data) {
                window.imagesFromPhieu = result.data.map((img, index) => ({
                    id: `phieu_${img.id || index + 1}`,
                    dbId: img.id,
                    name: img.tenAnh,
                    src: img.httpUrl,
                    ftpUrl: img.url,
                    timestamp: new Date(img.thoiGianTao || Date.now()),
                    source: 'phieu',
                    inPhieu: true
                }));

                console.log('✅ Đã load', window.imagesFromPhieu.length, 'ảnh từ phiếu');
            }

            hasLoadedPhieu = true;
            checkAndCompareImages();
        } catch (error) {
            console.error('❌ Lỗi khi load ảnh từ phiếu:', error);
            hasLoadedPhieu = true;
            checkAndCompareImages();
        }
    }

    // Kéo thả ảnh
    khoaImagesContainer.addEventListener('dragover', function (e) {
        e.preventDefault();
        khoaImagesContainer.classList.add('drag-over');
    });

    khoaImagesContainer.addEventListener('dragleave', function () {
        khoaImagesContainer.classList.remove('drag-over');
    });

    khoaImagesContainer.addEventListener('drop', function (e) {
        e.preventDefault();
        khoaImagesContainer.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files);
        }
    });

    // Load ảnh
    loadImagesFromServerByMaKhoa(window.MaKhoa);
    loadImagesFromServer(window.IDPhieuTTPT);
}

// ==== TOOLTIP FUNCTIONS ====
function initTooltip(element) {
    if (element && window.bootstrap && window.bootstrap.Tooltip) {
        if (element._tooltip) {
            element._tooltip.dispose();
        }
        const tooltip = new bootstrap.Tooltip(element, { trigger: 'manual' });
        element.addEventListener('mouseenter', function () { tooltip.show(); });
        element.addEventListener('mouseleave', function () { tooltip.hide(); });
        element._tooltip = tooltip;
    }
}

function updateTooltip(element, newTitle) {
    if (element && element._tooltip) {
        element.setAttribute('title', newTitle);
        element._tooltip.setContent({ '.tooltip-inner': newTitle });
    }
}

function disposeTooltip(element) {
    if (element && element._tooltip) {
        element._tooltip.dispose();
        element._tooltip = null;
    }
}

function disposeAllTooltips(element) {
    if (!element) return;
    disposeTooltip(element);
    const tooltipElements = element.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach(el => disposeTooltip(el));
}

// ==== IMAGE MANAGEMENT FUNCTIONS ====
window.toggleImageSelection = async function (imageId) {
    const khoaImagesContainer = document.getElementById('khoaImagesContainer');
    const imageItem = khoaImagesContainer.querySelector(`[data-image-id="${imageId}"]`);
    if (!imageItem) return;

    const actionBtn = imageItem.querySelector('.image-item-action');
    const isCurrentlyAdded = actionBtn.classList.contains('added');
    const imageData = window.imagesFromKhoa.find(i => i.id === imageId);

    if (!imageData) return;

    if (actionBtn._tooltip) {
        actionBtn._tooltip.hide();
    }

    if (!isCurrentlyAdded) {
        const existsInPhieu = window.imagesFromPhieu.some(img =>
            img.name.toLowerCase() === imageData.name.toLowerCase()
        );

        if (existsInPhieu) {
            toastr.info('Ảnh đã có trong phiếu');
            return;
        }

        if (window.IDPhieuTTPT && window.IDPhieuTTPT > 0) {
            try {
                const response = await fetch('/thu_thuat_phau_thuat/trinh-tu/copy-image-to-phieu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        IDPhieuTTPT: window.IDPhieuTTPT,
                        SourcePath: imageData.ftpUrl
                    })
                });

                const result = await response.json();

                if (result.success) {
                    const newPhieuImage = {
                        id: `phieu_${result.data.id}`,
                        dbId: result.data.id,
                        name: result.data.tenAnh,
                        src: result.data.httpUrl,
                        ftpUrl: result.data.url,
                        timestamp: new Date(),
                        source: 'phieu',
                        inPhieu: true
                    };

                    window.imagesFromPhieu.push(newPhieuImage);
                    addPhieuImageToPanel(newPhieuImage);

                    actionBtn.classList.remove('add');
                    actionBtn.classList.add('added');
                    actionBtn.innerHTML = '<i class="ti ti-check"></i>';

                    updateTooltip(actionBtn, 'Xóa ảnh khỏi phiếu');

                    updateImageCounts();
                    toastr.success('Đã thêm ảnh vào phiếu');
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Lỗi copy ảnh:', error);
                toastr.error('Lỗi khi thêm ảnh vào phiếu: ' + error.message);
            }
        } else {
            const tempPhieuImage = {
                id: `temp_phieu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                dbId: null,
                name: imageData.name,
                src: imageData.src,
                ftpUrl: imageData.ftpUrl,
                timestamp: new Date(),
                source: 'phieu',
                inPhieu: true,
                isTemp: true
            };

            window.imagesFromPhieu.push(tempPhieuImage);
            addPhieuImageToPanel(tempPhieuImage);

            actionBtn.classList.remove('add');
            actionBtn.classList.add('added');
            actionBtn.innerHTML = '<i class="ti ti-check"></i>';

            updateTooltip(actionBtn, 'Xóa ảnh khỏi phiếu');

            updateImageCounts();
            toastr.success('Đã thêm ảnh vào phiếu');
        }

    } else {
        if (!confirm('Bạn có chắc muốn xóa ảnh này khỏi phiếu?')) {
            return;
        }

        const phieuImage = window.imagesFromPhieu.find(img =>
            img.name.toLowerCase() === imageData.name.toLowerCase()
        );

        if (phieuImage) {
            try {
                if (phieuImage.dbId && window.IDPhieuTTPT && window.IDPhieuTTPT > 0) {
                    const deleteSuccess = await window.deletePhieuImage(phieuImage.id);

                    if (deleteSuccess) {
                        actionBtn.classList.remove('added');
                        actionBtn.classList.add('add');
                        actionBtn.innerHTML = '<i class="ti ti-plus"></i>';
                        updateTooltip(actionBtn, 'Thêm ảnh vào phiếu');
                    }
                } else {
                    const phieuImagesContainer = document.getElementById('phieuImagesContainer');
                    const phieuImageItem = phieuImagesContainer.querySelector(`[data-image-id="${phieuImage.id}"]`);
                    if (phieuImageItem) {
                        disposeAllTooltips(phieuImageItem);
                        phieuImageItem.remove();
                    }

                    window.imagesFromPhieu = window.imagesFromPhieu.filter(img => img.id !== phieuImage.id);

                    actionBtn.classList.remove('added');
                    actionBtn.classList.add('add');
                    actionBtn.innerHTML = '<i class="ti ti-plus"></i>';
                    updateTooltip(actionBtn, 'Thêm ảnh vào phiếu');

                    updateImageCounts();
                    toastr.success('Đã xóa ảnh khỏi phiếu');
                }
            } catch (error) {
                console.error('Lỗi khi xóa ảnh:', error);
                toastr.error('Có lỗi xảy ra khi xóa ảnh');
            }
        }
    }
};

window.deletePhieuImage = async function (imageId) {
    const phieuImagesContainer = document.getElementById('phieuImagesContainer');
    const phieuImageItem = phieuImagesContainer.querySelector(`[data-image-id="${imageId}"]`);
    if (!phieuImageItem) return false;

    disposeAllTooltips(phieuImageItem);

    setTimeout(function () {
        document.querySelectorAll('.tooltip').forEach(el => el.remove());
    }, 100);

    const dbId = phieuImageItem.dataset.dbId;
    const ftpUrl = phieuImageItem.dataset.ftpUrl;
    const imageName = window.imagesFromPhieu.find(img => img.id === imageId)?.name;
    const isTempImage = !dbId || dbId === 'null' || dbId === '';

    if (isTempImage) {
        phieuImageItem.remove();
        window.imagesFromPhieu = window.imagesFromPhieu.filter(img => img.id !== imageId);

        if (imageName) {
            const khoaImagesContainer = document.getElementById('khoaImagesContainer');
            const allKhoaItems = khoaImagesContainer.querySelectorAll('[data-image-id]');
            allKhoaItems.forEach(item => {
                const itemName = item.querySelector('.image-item-title').textContent;
                if (itemName === imageName) {
                    const actionBtn = item.querySelector('.image-item-action');
                    if (actionBtn) {
                        disposeTooltip(actionBtn);
                        actionBtn.classList.remove('added');
                        actionBtn.classList.add('add');
                        actionBtn.innerHTML = '<i class="ti ti-plus"></i>';
                        updateTooltip(actionBtn, 'Thêm ảnh vào phiếu');
                        initTooltip(actionBtn);
                    }
                }
            });
        }

        updateImageCounts();
        toastr.success('Đã xóa ảnh khỏi phiếu');
        return true;
    }

    try {
        const response = await fetch('/thu_thuat_phau_thuat/trinh-tu/delete-image-from-phieu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ImageID: parseInt(dbId),
                IDPhieuTTPT: window.IDPhieuTTPT,
                FileUrl: ftpUrl
            })
        });

        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            if (response.ok) {
                result = { success: true, message: 'Xóa thành công' };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }

        if (result.success) {
            phieuImageItem.remove();
            window.imagesFromPhieu = window.imagesFromPhieu.filter(img => img.id !== imageId);

            if (imageName) {
                const khoaImagesContainer = document.getElementById('khoaImagesContainer');
                const allKhoaItems = khoaImagesContainer.querySelectorAll('[data-image-id]');

                allKhoaItems.forEach(item => {
                    const itemName = item.querySelector('.image-item-title').textContent;
                    if (itemName === imageName) {
                        const actionBtn = item.querySelector('.image-item-action');
                        if (actionBtn) {
                            disposeTooltip(actionBtn);
                            actionBtn.classList.remove('added');
                            actionBtn.classList.add('add');
                            actionBtn.innerHTML = '<i class="ti ti-plus"></i>';
                            updateTooltip(actionBtn, 'Thêm ảnh vào phiếu');
                            initTooltip(actionBtn);
                        }
                        setTimeout(function () {
                            document.querySelectorAll('.tooltip').forEach(el => el.remove());
                        }, 100);
                    }
                });
            }

            updateImageCounts();
            toastr.success('Đã xóa ảnh khỏi phiếu');
            return true;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Lỗi xóa ảnh:', error);
        toastr.error('Không thể xóa ảnh: ' + error.message);
        return false;
    }
};

window.deleteImageFromKhoa = async function (imageId, imageName) {
    if (!confirm(`Bạn có chắc muốn xóa ảnh "${imageName}" khỏi khoa?`)) {
        return;
    }

    const khoaImagesContainer = document.getElementById('khoaImagesContainer');
    const imageItem = khoaImagesContainer.querySelector(`[data-image-id="${imageId}"]`);
    if (!imageItem) return;

    const imageData = window.imagesFromKhoa.find(i => i.id === imageId);
    if (!imageData) return;

    imageItem.classList.add('deleting');
    const deleteBtn = imageItem.querySelector('.image-item-delete');
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="ti ti-loader"></i>';
    }

    try {
        const response = await fetch('/thu_thuat_phau_thuat/trinh-tu/delete-image-from-khoa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filePath: imageData.ftpUrl,
                fileName: imageData.name
            })
        });

        const result = await response.json();

        if (result.success) {
            window.imagesFromKhoa = window.imagesFromKhoa.filter(img => img.id !== imageId);
            imageItem.remove();
            updateImageCounts();
            toastr.success(`Đã xóa ảnh "${imageName}" khỏi khoa`);
        } else {
            throw new Error(result.message || 'Xóa thất bại');
        }
    } catch (error) {
        console.error('Lỗi xóa ảnh từ khoa:', error);
        toastr.error(`Không thể xóa ảnh: ${error.message}`);

        imageItem.classList.remove('deleting');
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '<i class="ti ti-trash"></i>';
        }
    }
};

window.previewImage = function (imageSrc) {
    const modalEl = document.getElementById('imagePreviewModal');
    const modalImg = document.getElementById('imagePreviewModalImg');
    if (modalEl && modalImg) {
        modalImg.src = imageSrc;
        if (window.bootstrap && window.bootstrap.Modal) {
            new window.bootstrap.Modal(modalEl).show();
        }
    }
};

window.getSelectedImages = function () {
    return window.imagesFromPhieu.map(img => ({
        URL: img.ftpUrl,
        TenAnh: img.name,
        IsTemp: img.isTemp || false
    }));
};

// ==== IMAGE EDITOR LOGIC ====
function initImageEditor() {
    if (typeof fabric === 'undefined') {
        console.error('Fabric.js chưa được load. Vui lòng kiểm tra lại import.');
        return;
    }

    if (window.fabricCanvas) {
        console.warn('Canvas editor đã được khởi tạo. Đang dispose...');
        if (window.fabricCanvas.dispose) {
            window.fabricCanvas.dispose();
        }
        window.fabricCanvas = null;
    }

    let fabricCanvas = null;
    let currentImageData = null;
    let currentMode = 'select';
    let undoStack = [];
    let redoStack = [];
    let isDrawing = false;
    let startPoint = null;
    let currentShape = null;
    let originalImage = null;
    let originalImageScale = 1;
    let originalImageWidth = 0;
    let originalImageHeight = 0;

    const keyboardShortcuts = {
        'KeyV': 'select',
        'KeyB': 'draw',
        'KeyL': 'line',
        'KeyA': 'arrow',
        'KeyR': 'rect',
        'KeyC': 'circle',
        'KeyE': 'ellipse',
        'Equal': 'zoomIn',
        'Minus': 'zoomOut',
        'Digit0': 'zoomReset',
        'KeyZ': 'undo',
        'KeyY': 'redo',
        'Delete': 'delete'
    };

    $('#imageEditorModal').on('shown.bs.modal', function () {
        if (!fabricCanvas) {
            initializeCanvas();
        }
        setupKeyboardShortcuts();

        if (currentImageData) {
            loadImageToCanvas(currentImageData.src);
        }
        fabricCanvas.wrapperEl.tabIndex = 1;
        fabricCanvas.wrapperEl.style.outline = 'none';
    });

    $('#imageEditorModal').on('hidden.bs.modal', function () {
        removeKeyboardShortcuts();
        currentMode = 'select';
        updateToolIndicators();
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.isEditing) {
            activeObject.exitEditing();
        }
    });

    function initializeCanvas() {
        const existingCanvas = fabric.Canvas.instances && fabric.Canvas.instances[0];
        if (existingCanvas) {
            fabricCanvas = existingCanvas;
            return;
        }
        fabricCanvas = new fabric.Canvas('imageEditorCanvas', {
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true
        });

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        setupCanvasEvents();
        updateToolIndicators();
    }

    function updateCanvasSize() {
        const container = $('.canvas-container-wrapper');
        const width = Math.min(1200, container.width() - 40);
        const height = Math.min(800, container.height() - 40);

        fabricCanvas.setDimensions({
            width: width,
            height: height
        });

        if (originalImage) {
            centerImage();
        }
    }

    function setupCanvasEvents() {
        fabricCanvas.on('mouse:down', function (options) {
            const target = options.e.target;
            if (target && (
                target.isContentEditable ||
                target.closest('[contenteditable="true"]') ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT'
            )) {
                return;
            }

            const pointer = fabricCanvas.getPointer(options.e);
            updateCursorPosition(pointer.x, pointer.y);

            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject && activeObject.isEditing) {
                return;
            }

            if (activeObject && activeObject.type === 'i-text') {
                activeObject.enterEditing();
                activeObject.selectAll();
                return;
            }

            if (currentMode === 'select') {
                return;
            }

            if (currentMode === 'draw') {
                fabricCanvas.isDrawingMode = true;
                fabricCanvas.freeDrawingBrush.color = $('#drawColor').val();
                fabricCanvas.freeDrawingBrush.width = parseInt($('#strokeWidth').val());
                return;
            }

            if (['line', 'arrow', 'rect', 'circle', 'ellipse'].includes(currentMode)) {
                isDrawing = true;
                startPoint = pointer;
                createShape(pointer);
            }

            if (currentMode !== 'select' && currentMode !== 'text') {
                options.e.preventDefault();
                options.e.stopPropagation();
            }
        });

        fabricCanvas.on('mouse:move', function (options) {
            const pointer = fabricCanvas.getPointer(options.e);
            updateCursorPosition(pointer.x, pointer.y);
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject && activeObject.isEditing) {
                return;
            }

            if (!isDrawing || !currentShape) return;

            updateShape(pointer);
            fabricCanvas.renderAll();
        });

        fabricCanvas.on('mouse:up', function () {
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject && activeObject.isEditing) {
                return;
            }

            if (isDrawing && currentShape) {
                saveState();
            }
            isDrawing = false;
            currentShape = null;

            if (currentMode === 'draw') {
                fabricCanvas.isDrawingMode = false;
            }
        });

        fabricCanvas.on('selection:created', updateSelectionInfo);
        fabricCanvas.on('selection:updated', updateSelectionInfo);
        fabricCanvas.on('selection:cleared', updateSelectionInfo);
        fabricCanvas.on('object:modified', saveState);
    }

    function createShape(pointer) {
        const color = $('#drawColor').val();
        const strokeWidth = parseInt($('#strokeWidth').val());

        switch (currentMode) {
            case 'line':
                currentShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                    stroke: color,
                    strokeWidth: strokeWidth,
                    selectable: true
                });
                break;
            case 'arrow':
                currentShape = createArrow(pointer.x, pointer.y, pointer.x, pointer.y, color, strokeWidth);
                break;
            case 'rect':
                currentShape = new fabric.Rect({
                    left: pointer.x,
                    top: pointer.y,
                    width: 0,
                    height: 0,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth: strokeWidth,
                    selectable: true
                });
                break;
            case 'circle':
                currentShape = new fabric.Circle({
                    left: pointer.x,
                    top: pointer.y,
                    radius: 0,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth: strokeWidth,
                    selectable: true
                });
                break;
            case 'ellipse':
                currentShape = new fabric.Ellipse({
                    left: pointer.x,
                    top: pointer.y,
                    rx: 0,
                    ry: 0,
                    fill: 'transparent',
                    stroke: color,
                    strokeWidth: strokeWidth,
                    selectable: true
                });
                break;
        }

        if (currentShape) {
            fabricCanvas.add(currentShape);
            fabricCanvas.renderAll();
        }
    }

    function updateShape(pointer) {
        if (!currentShape) return;

        switch (currentMode) {
            case 'line':
                currentShape.set({ x2: pointer.x, y2: pointer.y });
                break;
            case 'arrow':
                updateArrow(currentShape, startPoint.x, startPoint.y, pointer.x, pointer.y);
                break;
            case 'rect':
                const width = pointer.x - startPoint.x;
                const height = pointer.y - startPoint.y;
                currentShape.set({
                    width: Math.abs(width),
                    height: Math.abs(height),
                    left: width < 0 ? pointer.x : startPoint.x,
                    top: height < 0 ? pointer.y : startPoint.y
                });
                break;
            case 'circle':
                const radius = Math.sqrt(
                    Math.pow(pointer.x - startPoint.x, 2) +
                    Math.pow(pointer.y - startPoint.y, 2)
                ) / 2;
                currentShape.set({ radius: radius });
                break;
            case 'ellipse':
                currentShape.set({
                    rx: Math.abs(pointer.x - startPoint.x) / 2,
                    ry: Math.abs(pointer.y - startPoint.y) / 2
                });
                break;
        }
    }

    function createArrow(x1, y1, x2, y2, color, strokeWidth) {
        const line = new fabric.Line([x1, y1, x2, y2], {
            stroke: color,
            strokeWidth: strokeWidth
        });

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headSize = strokeWidth * 3;

        const arrowHead = new fabric.Triangle({
            left: x2,
            top: y2,
            originX: 'center',
            originY: 'center',
            angle: (angle * 180 / Math.PI) + 90,
            width: headSize,
            height: headSize,
            fill: color
        });

        return new fabric.Group([line, arrowHead], {
            selectable: true
        });
    }

    function updateArrow(arrow, x1, y1, x2, y2) {
        const objects = arrow._objects;
        const line = objects[0];
        const triangle = objects[1];

        line.set({ x1: x1, y1: y1, x2: x2, y2: y2 });

        const angle = Math.atan2(y2 - y1, x2 - x1);
        triangle.set({
            left: x2,
            top: y2,
            angle: (angle * 180 / Math.PI) + 90
        });
    }

    function loadImageToCanvas(imageSrc) {
        fabric.Image.fromURL(imageSrc, function (img) {
            fabricCanvas.clear();
            undoStack = [];
            redoStack = [];
            originalImage = img;
            originalImageWidth = img.width;
            originalImageHeight = img.height;
            const canvasWidth = fabricCanvas.width;
            const canvasHeight = fabricCanvas.height;
            const scale = Math.min(
                canvasWidth / img.width,
                canvasHeight / img.height
            ) * 0.95;
            originalImageScale = scale;
            img.scale(scale);
            img.set({
                left: (canvasWidth - img.width * scale) / 2,
                top: (canvasHeight - img.height * scale) / 2,
                selectable: false,
                evented: false,
                name: 'backgroundImage'
            });
            fabricCanvas.add(img);
            fabricCanvas.sendToBack(img);
            fabricCanvas.renderAll();
            saveState();
            updateZoomLevel();
            updateImageSizeInfo(img.width, img.height, scale);
        }, { crossOrigin: 'anonymous' });
    }

    function updateImageSizeInfo(originalWidth, originalHeight, scale) {
        const scaledWidth = Math.round(originalWidth * scale);
        const scaledHeight = Math.round(originalHeight * scale);
        let sizeInfo = document.getElementById('imageSizeInfo');
        if (!sizeInfo) {
            sizeInfo = document.createElement('div');
            sizeInfo.id = 'imageSizeInfo';
            document.querySelector('.status-bar').appendChild(sizeInfo);
        }
        sizeInfo.innerHTML = `Kích thước: ${originalWidth}×${originalHeight}px (Hiển thị: ${scaledWidth}×${scaledHeight}px)`;
    }

    function centerImage(img = null) {
        const image = img || fabricCanvas.getObjects().find(obj => obj.name === 'backgroundImage');
        if (image) {
            const zoom = fabricCanvas.getZoom();
            const scaledWidth = image.width * image.scaleX * zoom;
            const scaledHeight = image.height * image.scaleY * zoom;

            image.set({
                left: (fabricCanvas.width - scaledWidth) / 2,
                top: (fabricCanvas.height - scaledHeight) / 2
            });
            fabricCanvas.renderAll();
        }
    }

    function resetToOriginalSize() {
        if (!originalImage) return;
        const canvasWidth = fabricCanvas.width;
        const canvasHeight = fabricCanvas.height;
        const scale = Math.min(
            canvasWidth / originalImage.width,
            canvasHeight / originalImage.height
        ) * 0.95;
        originalImage.set({
            scaleX: scale,
            scaleY: scale,
            left: (canvasWidth - originalImage.width * scale) / 2,
            top: (canvasHeight - originalImage.height * scale) / 2
        });
        fabricCanvas.setZoom(1);
        fabricCanvas.renderAll();
        updateZoomLevel();
        updateImageSizeInfo(originalImage.width, originalImage.height, scale);
    }

    // Toolbar buttons
    $('#btnSelectMode').click(() => setMode('select'));
    $('#btnDrawFree').click(() => setMode('draw'));
    $('#btnDrawLine').click(() => setMode('line'));
    $('#btnDrawArrow').click(() => setMode('arrow'));
    $('#btnDrawRect').click(() => setMode('rect'));
    $('#btnDrawCircle').click(() => setMode('circle'));
    $('#btnDrawEllipse').click(() => setMode('ellipse'));
    $('#btnAddText').click(() => setMode('text'));

    function setMode(mode) {
        currentMode = mode;
        updateToolIndicators();
        updateCanvasCursor();
        if (mode === 'text') {
            fabricCanvas.isDrawingMode = false;
            fabricCanvas.selection = false;
            fabricCanvas.defaultCursor = 'text';
            fabricCanvas.hoverCursor = 'text';
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject && activeObject.isEditing) {
                activeObject.exitEditing();
            }
        } else {
            fabricCanvas.isDrawingMode = (mode === 'draw');
            fabricCanvas.selection = (mode === 'select');
            fabricCanvas.defaultCursor = (mode === 'select') ? 'default' : 'crosshair';
            fabricCanvas.hoverCursor = (mode === 'select') ? 'move' : 'crosshair';
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject && activeObject.isEditing) {
                activeObject.exitEditing();
            }
        }
        $(`#btn${mode.charAt(0).toUpperCase() + mode.slice(1)}Mode`)
            .addClass('tool-changed');
        setTimeout(() => {
            $(`#btn${mode.charAt(0).toUpperCase() + mode.slice(1)}Mode`)
                .removeClass('tool-changed');
        }, 300);
    }

    function updateToolIndicators() {
        $('.editor-toolbar-panel .btn').removeClass('active btn-primary');
        $('.editor-toolbar-panel .btn').addClass('btn-light');

        const activeButton = $('#btn' + currentMode.charAt(0).toUpperCase() + currentMode.slice(1) + 'Mode');
        activeButton.removeClass('btn-light').addClass('btn-primary active');

        $('#currentTool').text('Công cụ: ' + getToolName(currentMode));
    }

    function getToolName(mode) {
        const names = {
            'select': 'Chọn',
            'draw': 'Vẽ tự do',
            'line': 'Đường thẳng',
            'arrow': 'Mũi tên',
            'rect': 'Hình chữ nhật',
            'circle': 'Hình tròn',
            'ellipse': 'Hình elip',
        };
        return names[mode] || 'Chọn';
    }

    function updateCanvasCursor() {
        const canvasContainer = $('.canvas-container-wrapper');
        canvasContainer.removeClass('select-mode draw-mode text-mode move-mode');

        switch (currentMode) {
            case 'select':
                canvasContainer.addClass('select-mode');
                break;
            case 'draw':
                canvasContainer.addClass('draw-mode');
                break;
            default:
                canvasContainer.addClass('draw-mode');
        }
    }

    // Zoom functions
    $('#btnZoomIn').click(zoomIn);
    $('#btnZoomOut').click(zoomOut);
    $('#btnZoomReset').click(zoomReset);
    $('#btnFitToScreen').click(fitToScreen);
    $('#btnActualSize').click(actualSize);
    $('#btnResetImage').click(resetImage);

    function zoomIn() {
        const zoom = fabricCanvas.getZoom();
        fabricCanvas.setZoom(zoom * 1.2);
        updateZoomLevel();
    }

    function zoomOut() {
        const zoom = fabricCanvas.getZoom();
        fabricCanvas.setZoom(zoom * 0.8);
        updateZoomLevel();
    }

    function zoomReset() {
        fabricCanvas.setZoom(1);
        fabricCanvas.viewportTransform = [1, 0, 0, 1, 0, 0];
        fabricCanvas.renderAll();
        updateZoomLevel();
    }

    function fitToScreen() {
        if (!originalImage) return;
        const canvasWidth = fabricCanvas.width;
        const canvasHeight = fabricCanvas.height;
        const scale = Math.min(
            canvasWidth / originalImage.width,
            canvasHeight / originalImage.height
        ) * 0.95;
        fabricCanvas.setZoom(scale);
        centerImage();
        updateZoomLevel();
        updateImageSizeInfo(originalImage.width, originalImage.height, scale);
    }

    function actualSize() {
        if (!originalImage) return;
        const baseScale = 1.0;
        fabricCanvas.setZoom(baseScale);
        centerImage();
        updateZoomLevel();
        updateImageSizeInfo(originalImage.width, originalImage.height, baseScale);
    }

    function resetImage() {
        if (confirm('Bạn có chắc muốn reset ảnh về trạng thái ban đầu? Tất cả chỉnh sửa sẽ bị mất.')) {
            loadImageToCanvas(currentImageData.src);
        }
    }

    function updateZoomLevel() {
        const zoom = Math.round(fabricCanvas.getZoom() * 100);
        $('#zoomLevel').text(`Zoom: ${zoom}%`);
    }

    // Undo/Redo
    $('#btnUndo').click(undo);
    $('#btnRedo').click(redo);

    function saveState() {
        redoStack = [];
        undoStack.push(JSON.stringify(fabricCanvas.toJSON()));
        if (undoStack.length > 50) undoStack.shift();
    }

    function undo() {
        if (undoStack.length > 1) {
            redoStack.push(undoStack.pop());
            const state = undoStack[undoStack.length - 1];
            fabricCanvas.loadFromJSON(state, function () {
                fabricCanvas.renderAll();
            });
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            const state = redoStack.pop();
            undoStack.push(state);
            fabricCanvas.loadFromJSON(state, function () {
                fabricCanvas.renderAll();
            });
        }
    }

    // Delete selected
    $('#btnDeleteSelected').click(deleteSelected);

    function deleteSelected() {
        const activeObjects = fabricCanvas.getActiveObjects();
        if (activeObjects.length) {
            fabricCanvas.discardActiveObject();
            activeObjects.forEach(obj => {
                if (obj.name !== 'backgroundImage') {
                    fabricCanvas.remove(obj);
                }
            });
            fabricCanvas.renderAll();
            saveState();
        }
    }

    // Clear all
    $('#btnClearAll').click(function () {
        if (confirm('Xóa tất cả chỉnh sửa (giữ lại ảnh gốc)?')) {
            const background = fabricCanvas.getObjects().find(obj => obj.name === 'backgroundImage');
            fabricCanvas.clear();
            if (background) {
                fabricCanvas.add(background);
                fabricCanvas.sendToBack(background);
            }
            fabricCanvas.renderAll();
            saveState();
        }
    });

    // Cursor position tracking
    function updateCursorPosition(x, y) {
        $('#cursorPosition').text(`Vị trí: ${Math.round(x)}, ${Math.round(y)}`);
    }

    function updateSelectionInfo() {
        // Could add selection info here if needed
    }

    // Keyboard shortcuts
    function setupKeyboardShortcuts() {
        $(document).on('keydown.imageEditor', handleKeyDown);
    }

    function removeKeyboardShortcuts() {
        $(document).off('keydown.imageEditor');
    }

    function handleKeyDown(e) {
        if (!fabricCanvas) return;

        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject && activeObject.isEditing) {
            return;
        }

        const ctrlKey = e.ctrlKey || e.metaKey;

        if (ctrlKey) {
            switch (e.code) {
                case 'Equal':
                case 'NumpadAdd':
                    e.preventDefault();
                    zoomIn();
                    break;
                case 'Minus':
                case 'NumpadSubtract':
                    e.preventDefault();
                    zoomOut();
                    break;
                case 'Digit0':
                    e.preventDefault();
                    zoomReset();
                    break;
                case 'KeyZ':
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    break;
                case 'KeyY':
                    e.preventDefault();
                    redo();
                    break;
            }
        } else {
            if (keyboardShortcuts[e.code]) {
                e.preventDefault();
                const action = keyboardShortcuts[e.code];

                if (['select', 'draw', 'line', 'arrow', 'rect', 'circle', 'ellipse', 'text'].includes(action)) {
                    setMode(action);
                } else if (action === 'delete') {
                    deleteSelected();
                }
            }
        }
    }

    // Save edited image
    $('#btnSaveEditedImage').click(async function () {
        const $btn = $(this);
        const originalText = $btn.html();

        $btn.prop('disabled', true).html('<i class="ti ti-loader"></i> Đang lưu...');

        try {
            const backgroundImage = fabricCanvas.getObjects().find(obj => obj.name === 'backgroundImage');

            if (!backgroundImage) {
                throw new Error('Không tìm thấy ảnh gốc');
            }

            const tempCanvas = new fabric.StaticCanvas(null, {
                width: originalImageWidth,
                height: originalImageHeight
            });

            const currentScale = backgroundImage.scaleX;
            const scaleRatio = 1 / currentScale;
            const objects = fabricCanvas.getObjects();
            const clonedObjects = [];

            for (let obj of objects) {
                if (obj.name === 'backgroundImage') {
                    const originalImg = await new Promise((resolve) => {
                        fabric.Image.fromURL(currentImageData.src, function (img) {
                            img.set({
                                scaleX: 1,
                                scaleY: 1,
                                left: 0,
                                top: 0,
                                selectable: false,
                                evented: false
                            });
                            resolve(img);
                        });
                    });
                    clonedObjects.push(originalImg);
                } else {
                    const cloned = await new Promise((resolve) => {
                        obj.clone((clonedObj) => {
                            const objLeft = (obj.left - backgroundImage.left) / currentScale;
                            const objTop = (obj.top - backgroundImage.top) / currentScale;

                            clonedObj.set({
                                scaleX: obj.scaleX / currentScale,
                                scaleY: obj.scaleY / currentScale,
                                left: objLeft,
                                top: objTop
                            });
                            resolve(clonedObj);
                        });
                    });
                    clonedObjects.push(cloned);
                }
            }

            for (let obj of clonedObjects) {
                tempCanvas.add(obj);
            }

            tempCanvas.renderAll();
            const dataURL = tempCanvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 1
            });

            const blob = await (await fetch(dataURL)).blob();
            const fileName = `edited_${Date.now()}_${currentImageData.name.replace(/\.[^/.]+$/, "")}.png`;
            const file = new File([blob], fileName, {
                type: 'image/png',
                lastModified: Date.now()
            });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('maKhoa', window.MaKhoa);

            const response = await fetch('/thu_thuat_phau_thuat/trinh-tu/upload-image-to-khoa', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const newImage = {
                    id: `khoa_${result.data.id || Date.now()}`,
                    name: result.data.fileName || fileName,
                    src: result.data.httpUrl,
                    ftpUrl: result.data.url,
                    timestamp: new Date(),
                    source: 'khoa',
                    inPhieu: false,
                    isEdited: true
                };

                if (!window.imagesFromKhoa) {
                    window.imagesFromKhoa = [];
                }

                window.imagesFromKhoa.unshift(newImage);
                $('#imageEditorModal').modal('hide');

                setTimeout(() => {
                    updateKhoaImagesPanel(newImage);
                    toastr.success('Đã lưu ảnh đã chỉnh sửa với kích thước gốc');
                }, 500);

            } else {
                throw new Error(result.message || 'Upload thất bại');
            }

            tempCanvas.dispose();
        } catch (error) {
            console.error('Lỗi lưu ảnh:', error);
            toastr.error('Không thể lưu ảnh: ' + error.message);
        } finally {
            $btn.prop('disabled', false).html(originalText);
        }
    });

    function updateKhoaImagesPanel(newImage) {
        const khoaContainer = document.getElementById('khoaImagesContainer');
        if (!khoaContainer) return;

        const existingItem = khoaContainer.querySelector(`[data-image-id="${newImage.id}"]`);
        if (existingItem) {
            existingItem.remove();
        }

        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.dataset.imageId = newImage.id;
        imageItem.dataset.ftpUrl = newImage.ftpUrl;

        const time = newImage.timestamp.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        imageItem.innerHTML = `
            <div class="image-item-header">
                <div class="image-item-title">${newImage.name}</div>
                <div class="image-item-actions d-flex justify-content-between align-items-center">
                    <button type="button"
                            class="image-item-action add"
                            onclick="toggleImageSelection('${newImage.id}')"
                            data-bs-toggle="tooltip"
                            title="Thêm ảnh vào phiếu">
                        <i class="ti ti-plus"></i>
                    </button>
                    <button type="button"
                            class="image-item-edit"
                            onclick="openImageEditor(${JSON.stringify(newImage).replace(/"/g, '&quot;')})"
                            data-bs-toggle="tooltip"
                            title="Chỉnh sửa ảnh">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button type="button"
                            class="image-item-delete"
                            onclick="deleteImageFromKhoa('${newImage.id}', '${newImage.name}')"
                            data-bs-toggle="tooltip"
                            title="Xóa ảnh khỏi khoa">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            </div>
            <small class="image-item-time">${time}</small>
            <div style="position: relative;">
                <img src="${newImage.src}" class="image-item-preview" alt="${newImage.name}">
                <button class="preview-btn"
                        data-bs-toggle="tooltip"
                        onclick="previewImage('${newImage.src}')"
                        title="Xem ảnh"
                        style="position: absolute; top: 5px; right: 0;">
                    <i class="ti ti-eye"></i>
                </button>
            </div>
        `;

        khoaContainer.insertBefore(imageItem, khoaContainer.firstChild);

        const tooltipElements = imageItem.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach(el => {
            initTooltip(el);
        });

        const countEl = document.querySelector('.count-khoa');
        if (countEl) {
            countEl.textContent = khoaContainer.querySelectorAll('.image-item').length;
        }

        imageItem.style.animation = 'highlightPulse 2s ease-in-out';
        imageItem.style.border = '2px solid #28a745';
        imageItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }

    window.openImageEditor = function (imageData) {
        currentImageData = imageData;
        $('#imageEditorModal').modal('show');
    };
}

// ==== EDITOR COMMANDS ====
function execCmd(command, value = null) {
    const editorDiagram = document.getElementById('editorDiagram');
    const editorContent = document.getElementById('editorContent');

    let activeEditor = null;
    if (document.activeElement === editorDiagram || editorDiagram.contains(document.activeElement)) {
        activeEditor = editorDiagram;
    } else if (document.activeElement === editorContent || editorContent.contains(document.activeElement)) {
        activeEditor = editorContent;
    } else {
        activeEditor = editorDiagram;
    }

    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    document.execCommand(command, false, value);
    setTimeout(() => {
        activeEditor.focus();
        if (range) {
            try {
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                const newRange = document.createRange();
                newRange.selectNodeContents(activeEditor);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        }
    }, 0);
}

// ==== DATA LOADING FUNCTIONS ====
async function loadTrinhTuVaKetLuanWithFocus(idPhieuTTPT) {
    if (!idPhieuTTPT || idPhieuTTPT === 0) return;
    try {
        var response = await fetch(`/thu_thuat_phau_thuat/trinh-tu/list-by-idttpt/${idPhieuTTPT}`);
        if (!response.ok) throw new Error('Network response was not ok');
        var data = await response.json();

        const editorDiagram = document.getElementById('editorDiagram');
        const editorContent = document.getElementById('editorContent');
        if (data.data.length === 0) return;

        editorDiagram.innerHTML = data.data[0].thongTinLuocDo || '';
        editorContent.innerHTML = data.data[0].trinhTu || '';
        document.querySelector('.editor-summary').innerText = data.data[0].ketLuan || '';

        setTimeout(() => {
            editorContent.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            if (editorContent.childNodes.length > 0) {
                range.selectNodeContents(editorContent);
                range.collapse(false);
            } else {
                const p = document.createElement('p');
                p.innerHTML = '&nbsp;';
                editorContent.appendChild(p);
                range.setStart(p, 0);
                range.collapse(true);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        }, 100);
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

// ==== TEMPLATE MODAL FUNCTIONS ====
function openModalFnc() {
    var currentIdKhoa = window.IDKhoa;
    openTemplateModal(currentIdKhoa);
    $('#myModal').modal('show');
}

function reloadTemplateSelect() {
    const url = `/template_tuong_trinh/LayDanhSachTheoIDKhoa/${DEFAULT_KHOA_ID}`;
    const templateSelectEl = document.querySelector('.cbTemplateTTPT');

    if (templateSelectEl && templateSelectEl.tomselect) {
        templateSelectEl.tomselect.destroy();
        window.templateTomSelectInstance = null;
    }

    initTemplateTomSelect(url);
    $('#templateSelect').val('');
}


// ==== UPDATE IMAGE COUNTS FUNCTION ====
function updateImageCounts() {
    const phieuImagesContainer = document.getElementById('phieuImagesContainer');
    const khoaImagesContainer = document.getElementById('khoaImagesContainer');

    if (!phieuImagesContainer || !khoaImagesContainer) {
        console.warn('Không tìm thấy container ảnh');
        return;
    }

    const phieuCount = phieuImagesContainer.querySelectorAll('.phieu-image-item').length;
    const khoaCount = khoaImagesContainer.querySelectorAll('.image-item').length;

    // Cập nhật các phần tử hiển thị số lượng
    const countPhieuEl = document.querySelector('.count-phieu');
    const countKhoaEl = document.querySelector('.count-khoa');
    const countDiagramEl = document.querySelector('.count-diagram');

    if (countPhieuEl) countPhieuEl.textContent = phieuCount;
    if (countKhoaEl) countKhoaEl.textContent = khoaCount;
    if (countDiagramEl) countDiagramEl.textContent = phieuCount;

    console.log(`Đã cập nhật số lượng ảnh: Phiếu=${phieuCount}, Khoa=${khoaCount}`);
}

// ==== IMAGE PANEL FUNCTIONS ====
// Hàm thêm ảnh vào panel phiếu
function addPhieuImageToPanel(imageData) {
    const phieuImagesContainer = document.getElementById('phieuImagesContainer');
    if (!phieuImagesContainer) {
        console.error('Không tìm thấy phieuImagesContainer');
        return;
    }

    const existingGroups = phieuImagesContainer.querySelectorAll('.phieu-image-group');
    let targetGroup = null;

    for (let group of existingGroups) {
        const imagesInGroup = group.querySelectorAll('.phieu-image-item');
        if (imagesInGroup.length < 4) {
            targetGroup = group;
            break;
        }
    }

    if (!targetGroup) {
        targetGroup = document.createElement('div');
        targetGroup.className = 'phieu-image-group';
        phieuImagesContainer.appendChild(targetGroup);
    }

    const imageItem = document.createElement('div');
    imageItem.className = 'phieu-image-item';
    imageItem.dataset.imageId = imageData.id;
    imageItem.dataset.dbId = imageData.dbId || '';
    imageItem.dataset.ftpUrl = imageData.ftpUrl;
    imageItem.dataset.isTemp = imageData.isTemp || false;

    imageItem.innerHTML = `
        <button class="btn-delete-phieu-image"
                onclick="deletePhieuImage('${imageData.id}')"
                data-bs-toggle="tooltip"
                title="Xóa ảnh khỏi phiếu"
                style="position: absolute; top: 2px; right: 2px; z-index: 2;
                       width: 18px; height: 18px; padding: 0; border: none;
                       background: #dc3545; color: white; border-radius: 2px;
                       font-size: 10px; display: flex; align-items: center; justify-content: center;">
            ×
        </button>
        <img src="${imageData.src}"
             class="phieu-image-preview"
             alt="${imageData.name}"
             onclick="previewImage('${imageData.src}')">
    `;

    targetGroup.appendChild(imageItem);

    const deleteBtn = imageItem.querySelector('.btn-delete-phieu-image');
    if (deleteBtn && window.bootstrap && window.bootstrap.Tooltip) {
        new bootstrap.Tooltip(deleteBtn);
    }
}

// Hàm thêm ảnh vào panel khoa
function addKhoaImageToPanel(imageData, isChecked = false, addToTop = false) {
    const khoaImagesContainer = document.getElementById('khoaImagesContainer');
    if (!khoaImagesContainer) {
        console.error('Không tìm thấy khoaImagesContainer');
        return;
    }

    const existingImage = khoaImagesContainer.querySelector(`[data-image-id="${imageData.id}"]`);
    if (existingImage) {
        const actionBtn = existingImage.querySelector('.image-item-action');
        const currentIsAdded = actionBtn.classList.contains('added');

        if (currentIsAdded === isChecked) {
            return;
        }

        if (isChecked) {
            actionBtn.classList.remove('add');
            actionBtn.classList.add('added');
            actionBtn.innerHTML = '<i class="ti ti-check"></i>';
            updateTooltip(actionBtn, 'Xóa ảnh khỏi phiếu');
        } else {
            actionBtn.classList.remove('added');
            actionBtn.classList.add('add');
            actionBtn.innerHTML = '<i class="ti ti-plus"></i>';
            updateTooltip(actionBtn, 'Thêm ảnh vào phiếu');
        }
        return;
    }

    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.dataset.imageId = imageData.id;
    imageItem.dataset.ftpUrl = imageData.ftpUrl;

    const time = imageData.timestamp.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const iconClass = isChecked ? 'added' : 'add';
    const iconHtml = isChecked ? '<i class="ti ti-check"></i>' : '<i class="ti ti-plus"></i>';
    const tooltip = isChecked ? 'Xóa ảnh khỏi phiếu' : 'Thêm ảnh vào phiếu';

    imageItem.innerHTML = `
        <div class="image-item-header">
            <div class="image-item-title">${imageData.name}</div>
            <div class="image-item-actions d-flex justify-content-between align-items-center">
                <button type="button"
                        class="image-item-action ${iconClass}"
                        onclick="toggleImageSelection('${imageData.id}')"
                        data-bs-toggle="tooltip"
                        title="${tooltip}">
                    ${iconHtml}
                </button>
                <button type="button"
                        class="image-item-edit"
                        onclick="openImageEditor(${JSON.stringify(imageData).replace(/"/g, '&quot;')})"
                        data-bs-toggle="tooltip"
                        title="Chỉnh sửa ảnh">
                    <i class="ti ti-edit"></i>
                </button>
                <button type="button"
                        class="image-item-delete"
                        onclick="deleteImageFromKhoa('${imageData.id}', '${imageData.name}')"
                        data-bs-toggle="tooltip"
                        title="Xóa ảnh khỏi khoa">
                    <i class="ti ti-trash"></i>
                </button>
            </div>
        </div>
        <small class="image-item-time">${time}</small>
        <div style="position: relative;">
            <img src="${imageData.src}" class="image-item-preview" alt="${imageData.name}">
            <button class="preview-btn"
                    data-bs-toggle="tooltip"
                    onclick="previewImage('${imageData.src}')"
                    title="Xem ảnh"
                    style="position: absolute; top: 5px; right: 0;">
                <i class="ti ti-eye"></i>
            </button>
        </div>
    `;

    if (addToTop) {
        khoaImagesContainer.insertBefore(imageItem, khoaImagesContainer.firstChild);
    } else {
        khoaImagesContainer.appendChild(imageItem);
    }

    const actionBtn = imageItem.querySelector('.image-item-action');
    const previewBtn = imageItem.querySelector('.preview-btn');
    const editBtn = imageItem.querySelector('.image-item-edit');
    const deleteBtn = imageItem.querySelector('.image-item-delete');

    initTooltip(actionBtn);
    initTooltip(previewBtn);
    initTooltip(editBtn);
    initTooltip(deleteBtn);
}

// ==== INITIALIZATION ====
// Khởi tạo template select
initTemplateTomSelect(`/template_tuong_trinh/LayDanhSachTheoIDKhoa/${DEFAULT_KHOA_ID}`);

// Khởi tạo editor styles và focus
initEditorStyles();
setupEditorFocus();

// Khởi tạo image panel
initImagePanel();

// Khởi tạo image editor
initImageEditor();

// Khởi tạo tooltips
[...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
    .forEach(el => new bootstrap.Tooltip(el));

// Load dữ liệu trình tự
loadTrinhTuVaKetLuanWithFocus(window.IDPhieuTTPT);

// Xử lý sự kiện modal template
$('#myModal').on('hidden.bs.modal', function (e) {
    console.log("Modal template đã đóng. Đang tải lại danh sách mẫu...");
    reloadTemplateSelect();
});

// Xử lý click ảnh trong content editor
document.getElementById('editorContent').addEventListener('click', function (e) {
    const img = e.target.closest('img');
    if (img) {
        const modalEl = document.getElementById('imagePreviewModal');
        const modalImg = document.getElementById('imagePreviewModalImg');
        if (modalEl && modalImg) {
            modalImg.src = img.src;
            if (window.bootstrap && window.bootstrap.Modal) {
                new window.bootstrap.Modal(modalEl).show();
            } else if ($(modalEl).modal) {
                $(modalEl).modal('show');
            }
        }
    }
});

// Export functions to global scope
window.addPhieuImageToPanel = addPhieuImageToPanel;
window.addKhoaImageToPanel = addKhoaImageToPanel;
window.updateImageCounts = updateImageCounts;
window.loadTrinhTuVaKetLuanWithFocus = loadTrinhTuVaKetLuanWithFocus;
window.applyTemplate = applyTemplate;
window.execCmd = execCmd;
window.openModalFnc = openModalFnc;
window.reloadTemplateSelect = reloadTemplateSelect;