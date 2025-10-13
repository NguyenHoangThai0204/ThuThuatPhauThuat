(function () {
    'use strict';
    if (window.__templateTuongTrinhInitialized) {
        return;
    }
    window.__templateTuongTrinhInitialized = true;

    let currentTemplateData = [];
    let allTemplatesLoaded = [];
    const BASE_URL = '/template_tuong_trinh';
    if (typeof allDataThongTin === "undefined") {
        var allDataThongTin = {
            khoa: [],
        };
    }
    function resetThongTinState() {
        allDataThongTin = {
            khoa: [],
        };
    }
    function getTomSelectConfigs(allDataThongTin) {
        return [
            {
                className: ".cbLocKhoa",
                placeholder: "-- Tất cả Khoa phòng --",
                data: allDataThongTin.khoa || [],
            }
        ]
    }
    function resetFormState() {
        $('#chiTietTitleInput').val('');

        $('#moTaLuocDo').val('');   
        $('#noiDungTrinhTu').val('');
        $('#editingTemplateId').val('');

        $('#btnSave').text('Thêm mới');
        $('#btnCancel').addClass('d-none');

        console.log("Form state has been reset.");
    }
    function fetchDataAndNormalize(url, tenField = 'ten', viettatField = 'viettat', idChiNhanh = null) {
        if (url.endsWith('.json')) {
            return new Promise((resolve, reject) => {
                $.getJSON(url, data => {
                    resolve(data);
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
                    resolve(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(`Lỗi khi gọi API ${url}:`, textStatus, errorThrown);
                    resolve([]);
                }
            });
        });
    }
    let khoaTomSelectInstance = null;

    function initTomSelectKhoa() {
        const khoaSelectElement = document.querySelector('.cbLocKhoa');

        if (!khoaSelectElement) {
            return;
        }

        if (khoaSelectElement.tomselect) {
            return;
        }

        const configs = getTomSelectConfigs(allDataThongTin);
        configCbNhanSu(configs.filter(c => c.className === ".cbLocKhoa"));

        const newInstance = khoaSelectElement.tomselect;
        if (newInstance) {
            newInstance.on('change', function (selectedKhoaId) {
                resetFormState();
                if (selectedKhoaId) {
                    fetchTemplatesByKhoaId(selectedKhoaId);
                } else {
                    currentTemplateData = [];
                    renderTemplateTable([]);
                }
            });
        }
    }


    async function initializeApp() {
        resetThongTinState();
        const dataPromises = {
            khoa: fetchDataAndNormalize("dist/data/json/DM_Khoa.json", 'ten', 'viettat'),
        };
        const results = await Promise.all(Object.values(dataPromises));
        const keys = Object.keys(dataPromises);
        keys.forEach((key, index) => {
            const rawData = results[index] || [];
            allDataThongTin[key] = rawData.reduce((acc, item) => {
                if (!item || typeof item !== 'object') {
                    return acc;
                }
                const tenChuan = String(item.ten || "").replace(/[\r\n\s]+/g, ' ').trim();
                const viettatChuan = String(item.viettat || "").replace(/[\r\n\s]+/g, ' ').trim();
                const maChuan = String(item.ma || "").replace(/[\r\n\s]+/g, ' ').trim();
                const idChuan = item.id ? String(item.id) : null;
                if (idChuan && tenChuan) {
                    acc.push({
                        ...item,
                        id: idChuan,
                        ten: tenChuan,
                        viettat: viettatChuan,
                        ma: maChuan,
                    });
                }
                return acc;
            }, []);
        });
        console.log("Đã tải dữ liệu khoa.");
    }

    function configCbNhanSu(configs) {
        configs.forEach((cfg) => {
            const element = document.querySelector(cfg.className);
            if (element && !element.tomselect) {
                const badItem = cfg.data.find(item => typeof item.ten !== 'string' || typeof item.viettat !== 'string');
                if (badItem) {
                    console.error("!!! PHÁT HIỆN DỮ LIỆU XẤU TRƯỚC KHI KHỞI TẠO TOMSELECT !!!", badItem);
                    toastr.error("Không thể khởi tạo danh sách khoa");
                    return;
                }
                const tomSelectInstance = new window.TomSelect(element, {
                    options: cfg.data,
                    valueField: "id",
                    labelField: "ten",
                    searchField: ["ten", "viettat"],
                    placeholder: cfg.placeholder || " -- Chọn -- ",
                    maxItems: 1,
                    allowEmptyOption: true, 
                    render: {
                        option: (data, escape) => `
                        <div style="display:flex; justify-content:space-between; width:100%;">
                          <span>${escape(data.ten)}</span>
                          <span style="color:gray; font-size:12px; margin-left:10px;">
                            <strong>${escape(data.viettat || "")}</strong>
                          </span>
                        </div>`,
                        item: (data, escape) => `
                        <div style="display:flex; justify-content:space-between; width:100%;">
                          <span>${escape(data.ten)}</span>
                          <span style="color:gray; font-size:12px; margin-left:10px;">
                            <strong>${escape(data.viettat || "")}</strong>
                          </span>
                        </div>`,
                        no_results: (data, escape) => `
                        <div class="no-results" style="padding:6px 10px;color:#999;">
                          Không tìm thấy "${escape(data.input)}"
                        </div>`,
                    }
                });
            }
        });
    }
    function setDefaultKhoaAndFetch(khoaId) {
        if (!khoaId) {
            console.log("Không có ID Khoa mặc định. Bỏ qua việc chọn và tải template.");
            return;
        }

        const khoaSelectElement = document.querySelector('.cbLocKhoa');

        initTomSelectKhoa();

        if (khoaSelectElement && khoaSelectElement.tomselect) {
            khoaSelectElement.tomselect.setValue(String(khoaId), true);
            fetchTemplatesByKhoaId(khoaId);
        } else {
            console.log("TomSelect chưa hoàn toàn sẵn sàng. Đang đợi và thử lại...");
            setTimeout(() => setDefaultKhoaAndFetch(khoaId), 100);
        }
    }


   
    function renderTemplateTable(templates) {
        const tableBody = $('#templateListTable tbody');
        tableBody.empty(); // Xóa dữ liệu cũ

        if (templates.length === 0) {
            tableBody.append('<tr><td colspan="3" class="text-center text-muted">Không có dữ liệu</td></tr>');
            return;
        }

        templates.forEach((template, index) => {
            const rowHtml = `
                <tr>
                    <td><span class="text-muted">${index + 1}</span></td>
                    <td><a href="#" class="text-reset">${template.ten}</a></td>
                    <td class="text-center">
                        <a href="#" class="btn btn-sm btn-outline-primary btn-edit" data-id="${template.id}" aria-label="Sửa mẫu">Sửa</a>
                        <a href="#" class="btn btn-sm btn-outline-danger ms-2 btn-delete" data-id="${template.id}" aria-label="Xóa mẫu">Xóa</a>
                    </td>
                </tr>
            `;
            tableBody.append(rowHtml);
        });
    }

 
    function handleEditClick(templateId) {
        const template = currentTemplateData.find(t => t.id === templateId);
        if (template) {
            $('#chiTietTitleInput').val(template.ten);
            const moTaForEditor = convertNewlinesToBr(template.thongTinLuocDo);
            const noiDungForEditor = convertNewlinesToBr(template.noiDung);
            tinymce.get('moTaLuocDo').setContent(moTaForEditor || '');
            tinymce.get('noiDungTrinhTu').setContent(noiDungForEditor || '');

            $('#editingTemplateId').val(template.id);
            $('#btnSave').text('Cập nhật');
            $('#btnCancel').removeClass('d-none');
        } else {
            console.error("Không tìm thấy template với ID:", templateId);
        }
    }
    function fetchTemplatesByKhoaId(khoaId) {
        const url = `${BASE_URL}/LayDanhSachTheoIDKhoa/${khoaId}`;
        console.log("Đang gọi API:", url);
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                console.log("Tải dữ liệu thành công:", data);
                allTemplatesLoaded = data;

                $('#searchInput').val('');
                filterTemplates('');
            },
            error: function (jqXHR) {
                console.error(`Lỗi khi gọi API ${url}:`, jqXHR.responseText);
                toastr.error("Không thể tải dữ liệu từ server. Vui lòng kiểm tra lại.");
                allTemplatesLoaded = [];
                currentTemplateData = [];
                renderTemplateTable([]);
            }
        });
    }
    function filterTemplates(searchText) {
        const normalizedSearch = removeVietnameseTones(searchText);

        if (normalizedSearch === '') {
            const activeTemplates = allTemplatesLoaded.filter(template => template.active === true);
            currentTemplateData = activeTemplates;
            renderTemplateTable(currentTemplateData);
            return;
        }

        const filteredList = allTemplatesLoaded.filter(template =>
            template.active === true &&
            template.ten &&
            removeVietnameseTones(template.ten).includes(normalizedSearch)
        );

        currentTemplateData = filteredList;
        renderTemplateTable(currentTemplateData);
    }
    function removeVietnameseTones(str) {
        if (!str) return '';
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); 
        str = str.replace(/\s+/g, ' ').trim(); 
        return str;
    }
    function saveTemplate(url, method, data) {
        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                toastr.success(data.ID > 0 ? 'Cập nhật mẫu thành công!' : 'Thêm mới mẫu thành công!');

                resetFormState();
                const currentKhoaId = document.querySelector('.cbLocKhoa').tomselect.getValue();
                if (currentKhoaId) {
                    fetchTemplatesByKhoaId(currentKhoaId);
                }
            },
            error: function (jqXHR) {
                const errorResponse = jqXHR.responseJSON;
                let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";
                if (errorResponse && errorResponse.message) {
                    errorMessage = errorResponse.message;
                } else if (errorResponse && errorResponse.errors) {
                    errorMessage = errorResponse.errors.join('\n');
                }
                //console.error("Lỗi khi lưu:", jqXHR.responseText);
                toastr.error(`Thao tác thất bại:\n${errorMessage}`);
            }
        });
    }
    function updateTemplateTrangThai(templateId) {
        const url = `${BASE_URL}/UpdateTrangThai/${templateId}`;

        $.ajax({
            url: url,
            method: 'POST', 
            dataType: 'json',
            success: function (response) {
                //console.log(`Cập nhật trạng thái template ID ${templateId} thành công.`, response);
                toastr.success('Xóa mẫu tường trình thành công!');

                const currentKhoaId = document.querySelector('.cbLocKhoa').tomselect.getValue();

                if (currentKhoaId) {
                    fetchTemplatesByKhoaId(currentKhoaId);
                } else {
                    currentTemplateData = [];
                    renderTemplateTable([]);
                }
            },
            error: function (jqXHR) {
                const errorResponse = jqXHR.responseJSON || { message: "Lỗi không xác định." };
                let errorMessage = errorResponse.message || "Đã có lỗi xảy ra khi xóa. Vui lòng thử lại.";

                //console.error("Lỗi khi cập nhật trạng thái:", jqXHR.responseText);
                toastr.error(`Xóa thất bại:\n${errorMessage}`);
            }
        });
    }
    function handleDeleteTemplate(templateId) {
        if (confirm("Bạn có chắc chắn muốn xóa (vô hiệu hóa) mẫu tường trình này không?")) {
            updateTemplateTrangThai(templateId);
        }
    }
    window.openTemplateModal = function (idKhoa) {
        const khoaIdString = String(idKhoa);

        resetFormState();
        setDefaultKhoaAndFetch(khoaIdString);
    };

    function cleanupAndPreserveBreaks(htmlString) {
        if (!htmlString) {
            return '';
        }

        let text = htmlString
            .replace(/<br\s*\/?>/gi, '\n')      
            .replace(/<\/p>/gi, '\n')          
            .replace(/<p>/gi, '')         
            .replace(/&nbsp;/g, ' ');

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        text = tempDiv.textContent || tempDiv.innerText || '';

        text = text.replace(/\n\s*\n/g, '\n\n').trim();

        return text;
    }
    function convertNewlinesToBr(text) {
        if (!text) {
            return '';
        }
        return text.replace(/\n/g, '<br />');
    }
    // ============ GÁN SỰ KIỆN KHI TRANG ĐÃ TẢI XONG ============
    $(document).ready(function () {
        renderTemplateTable([]);
        initializeApp();
        $('#btnSave').text('Thêm mới');

        $(document).on('click', '#myModal #templateListTable tbody .btn-edit', function (e) {
            e.preventDefault();
            const templateId = $(this).data('id');
            handleEditClick(parseInt(templateId));
        });

        $(document).on('click', '#myModal #templateListTable tbody .btn-delete', function (e) {
            e.preventDefault();
            const templateId = $(this).data('id');
            handleDeleteTemplate(parseInt(templateId));
        });

        $(document).on('click', '#myModal #btnCancel', function () {
            resetFormState();
        });
        $(document).on('click', '#myModal #btnSearchTemplates', function (e) {
            e.preventDefault();
            const searchText = $('#searchTemplateInput').val();
            filterTemplates(searchText);
        });
        $(document).on('click', '#myModal #btnSave', function () {
            const title = $('#chiTietTitleInput').val().trim();
            const currentKhoaId = document.querySelector('.cbLocKhoa').tomselect.getValue();

            if (!currentKhoaId) {
                toastr.error('Vui lòng chọn một khoa phòng!');
                return;
            }
            if (!title) {
                toastr.error('Tên mẫu tường trình không được để trống!');
                $('#chiTietTitleInput').focus();
                return;
            }
            const rawMoTaLuocDo = tinymce.get('moTaLuocDo').getContent();
            const rawNoiDungTrinhTu = tinymce.get('noiDungTrinhTu').getContent();

            const moTaLuocDoContent = cleanupAndPreserveBreaks(rawMoTaLuocDo);
            const noiDungTrinhTuContent = cleanupAndPreserveBreaks(rawNoiDungTrinhTu);

            const editingId = $('#editingTemplateId').val();
            const serverModel = {
                ID: editingId ? parseInt(editingId) : 0,
                Ten: title,
                ThongTinLuocDo: moTaLuocDoContent,
                NoiDung: noiDungTrinhTuContent,
                IDKhoa: parseInt(currentKhoaId),
                Active: true 
            };

            if (editingId) {
                saveTemplate(`${BASE_URL}/CapNhat`, 'POST', serverModel);
            } else {
                saveTemplate(`${BASE_URL}/ThemTemplate`, 'POST', serverModel);
            }
        });


       
    });


})();

