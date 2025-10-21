using DemoCauTruc.Models.M0302;
using iText.Html2pdf;
using iText.Html2pdf.Resolver.Font;
using iText.Kernel.Events;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Font;
using iText.Layout.Properties;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Text;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302DTO;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using ThuThuatPhauThuat.Services.S0305.IS0305;

namespace ThuThuatPhauThuat.PDFDocuments.P0302
{
    public class P0305ThuThuatPhauThuatPDF
    {
        private readonly M0302ThongTinXuatPDFTTPTModel2 _data;
        private readonly M0302ThongTinDoanhNghiep _thongTinDoanhNghiep;
        private readonly string _logoPath;
        private readonly Context0302 _context;
        private readonly IS0305FtpService _ftpService;

        public P0305ThuThuatPhauThuatPDF(
            M0302ThongTinXuatPDFTTPTModel2 data,
            M0302ThongTinDoanhNghiep doanhNghiep,
            Context0302 context,
            IS0305FtpService ftpService
        )
        {
            _data = data ?? new M0302ThongTinXuatPDFTTPTModel2();
            _thongTinDoanhNghiep = doanhNghiep ?? new M0302ThongTinDoanhNghiep
            {
                TenCSKCB = "Tên đơn vị",
                DiaChi = "",
                DienThoai = ""
            };
            _logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "dist", "img", "Logo-BVUB.jpg");
            _context = context;
            _ftpService = ftpService;
        }

        public async Task<byte[]> GeneratePdf()
        {
            using var memoryStream = new MemoryStream();
            var writer = new PdfWriter(memoryStream);
            var pdfDocument = new PdfDocument(writer);

            string fontFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "dist", "js", "J0302", "J0302Fonts");
            pdfDocument.AddEventHandler(PdfDocumentEvent.END_PAGE, new PageNumberHandler(fontFolder));

            // Await the async HTML generation
            var htmlContent = await GenerateHtmlContent();

            var fontSet = new FontSet();
            fontSet.AddFont(Path.Combine(fontFolder, "times.ttf"));
            fontSet.AddFont(Path.Combine(fontFolder, "timesbd.ttf"));
            fontSet.AddFont(Path.Combine(fontFolder, "timesi.ttf"));
            fontSet.AddFont(Path.Combine(fontFolder, "timesbi.ttf"));

            var fontProvider = new FontProvider(fontSet);

            var converterProperties = new ConverterProperties()
                .SetFontProvider(fontProvider)
                .SetCharset("utf-8");

            htmlContent = "<style> body { font-family: 'Times New Roman'; } </style>" + htmlContent;

            HtmlConverter.ConvertToPdf(htmlContent, pdfDocument, converterProperties);

            pdfDocument.Close();
            return memoryStream.ToArray();
        }

        public async Task SavePdf(string outputPath)
        {
            var pdfBytes = await GeneratePdf();
            File.WriteAllBytes(outputPath, pdfBytes);
        }

        private async Task<string> GenerateHtmlContent()
        {
            var sb = new StringBuilder();

            string logoBase64 = "";
            if (File.Exists(_logoPath))
            {
                byte[] imageBytes = File.ReadAllBytes(_logoPath);
                logoBase64 = Convert.ToBase64String(imageBytes);
            }

            // Lấy danh sách ảnh từ database
            List<AnhTruongTrinhDTO> listAnhTruongTrinh = await GetListAnhTuIDPhieuTTPT(_data.IDPhieuTTPT);

            sb.Append(@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='UTF-8'>
                    <style>
                        @page {
                            size: A4;
                            margin: 20px 25px;
                        }
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 13pt !important;
                            color: black;
                            line-height: 1.3;
                        }
                        .title {
                            text-align: center;
                            font-size: 16pt !important; 
                            font-weight: bold;
                            margin: 8px 0;
                        }
                        * {
                            font-size: 13pt !important;
                        }
                        .bold { font-weight: bold; }
                        .border-box {
                            border: 1px solid black;
                            padding: 5px;
                        }
                        .page-break { page-break-after: always; }
                        .signature-section {
                            margin-top: 15px;
                            text-align: right;
                        }
                        .signature-box {
                            display: inline-block;
                            text-align: center;
                            width: 250px;
                        }
                        .signature-date {
                            font-size: 12px;
                            font-style: italic;
                        }
                        .signature-title {
                            font-size: 13px;
                            padding-right: 10px;
                            margin-top: 5px;
                            white-space: nowrap;
                        }
                        .signature-note {
                            font-size: 12px;
                            font-style: italic;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        td {
                            vertical-align: top;
                        }
                        .info-row {
                            margin: 3px 0;
                        }
                        .luoc-do-title {
                            text-align: center;
                            font-size: 15pt !important;
                            font-weight: bold;
                        }
                        .image-container {
                            text-align: left;
                            margin: 10px 0;
                        }
                        .luoc-do-image {
                            max-width: 350px;
                            max-height: 250px;
                            margin: 5px;
                            display: inline-block;
                        }
                        .luoc-do-content {
                            margin: 10px 0;
                            font-size: 13pt !important;
                        }
                        .tuong-trinh-content {
                            margin: 10px 0;
                            font-size: 13pt !important;
                        }
                        .compact-text {
                            margin: 2px 0;
                            line-height: 1.2;
                        }
                    </style>
                </head>
                <body>");

            // ===== TRANG 1: HEADER + THÔNG TIN =====
            sb.Append("<table style='width:100%; margin-bottom:8px;'>");
            sb.Append("<tr>");
            sb.Append("<td style='width:65%;'>");

            if (!string.IsNullOrEmpty(logoBase64))
            {
                sb.Append($"<img src='data:image/jpeg;base64,{logoBase64}' style='width:35px; height:35px; margin-right:5px; vertical-align:top;' />");
            }
            sb.Append("<div style='display:inline-block;'>");
            sb.Append($"<div class='bold'>{_thongTinDoanhNghiep.TenCoQuanChuyenMon ?? ""}</div>");
            sb.Append($"<div class='bold'>{_thongTinDoanhNghiep.TenCSKCB ?? ""}</div>");
            sb.Append("</div>");
            sb.Append("</td>");

            sb.Append("<td style='width:35%; font-size:12px; font-style:italic;'>");
            sb.Append("<div>Mã số: 14/BV-01</div>");
            sb.Append($"<div>Mã số đợt/MYT: <span class='bold'>{_data.MaVaoVien ?? ""}</span></div>");
            sb.Append("</td>");
            sb.Append("</tr>");
            sb.Append("</table>");

            sb.Append("<div class='title'>PHIẾU PHẪU THUẬT / THỦ THUẬT</div>");

            // THÔNG TIN NGƯỜI BỆNH - compact
            int tuoi = DateTime.Now.Year - (_data.NamSinh ?? DateTime.Now.Year);

            sb.Append("<table>");
            sb.Append("<tr>");
            sb.Append($"<td>- Họ tên người bệnh: <span class='bold'>{(_data.TenBN ?? "").ToUpper()}</span></td>");
            sb.Append($"<td style='text-align:right;'>Tuổi: <span class='bold'>{tuoi}</span>&nbsp;&nbsp;Giới tính: <span class='bold'>{_data.TenGioiTinh ?? ""}</span></td>");
            sb.Append("</tr>");
            sb.Append("</table>");

            sb.Append("<table>");
            sb.Append("<tr>");
            sb.Append($"<td>- Khoa/Phòng: <span class='bold'>{(_data.Khoa ?? "").ToUpper()}</span></td>");
            sb.Append($"<td style='text-align:right;'>Buồng: <span class='bold'>{_data.Buong}</span>&nbsp;&nbsp;Giường: <span class='bold'>{_data.Giuong}</span></td>");
            sb.Append("</tr>");
            sb.Append("</table>");

            // Thời gian
            string vaoVienText = _data.VaoVienLuc.HasValue ?
                $"{_data.VaoVienLuc.Value:HH} giờ {_data.VaoVienLuc.Value:mm} phút {_data.VaoVienLuc.Value:ss} giây, ngày {_data.VaoVienLuc.Value:dd}/{_data.VaoVienLuc.Value:MM}/{_data.VaoVienLuc.Value:yyyy}" : "";

            string batDauText = _data.BatDauThuThuat.HasValue ?
                $"{_data.BatDauThuThuat.Value:HH} giờ {_data.BatDauThuThuat.Value:mm} phút, ngày {_data.BatDauThuThuat.Value:dd}/{_data.BatDauThuThuat.Value:MM}/{_data.BatDauThuThuat.Value:yyyy}" : "";

            string ketThucText = _data.KetThucThuThuat.HasValue ?
                $"{_data.KetThucThuThuat.Value:HH} giờ {_data.KetThucThuThuat.Value:mm} phút, {_data.KetThucThuThuat.Value:dd}/{_data.KetThucThuThuat.Value:MM}/{_data.KetThucThuThuat.Value:yyyy}" : "";

            sb.Append($"<div class='compact-text'>- Vào viện lúc: <span class='bold'>{vaoVienText}</span></div>");
            sb.Append($"<div class='compact-text'>- Phẫu thuật/ Thủ thuật lúc: <span class='bold'>{batDauText}</span></div>");
            sb.Append($"<div class='compact-text'>- Phẫu thuật/ Thủ thuật kết thúc: <span class='bold'>{ketThucText}</span></div>");

            // Chẩn đoán
            sb.Append($"<div class='compact-text'>- Chẩn đoán: Trước phẫu thuật/ thủ thuật: <span class='bold'>{_data.TenChanDoanTruoc ?? ""}</span></div>");
            sb.Append($"<div class='compact-text' style='margin-left:75px;'>Sau phẫu thuật/ thủ thuật: <span class='bold'>{_data.TenChanDoanSau ?? ""}</span></div>");

            // Phương pháp
            sb.Append($"<div class='compact-text'>- Phương pháp phẫu thuật/ thủ thuật: <span class='bold'>{_data.PhuongPhapTTPT ?? ""}</span></div>");

            sb.Append("<table>");
            sb.Append("<tr>");
            sb.Append($"<td>- Phương pháp vô cảm: <span class='bold'>{_data.PhuongPhapVoCam ?? ""}</span></td>");
            sb.Append($"<td style='text-align:right;'>Loại: <span class='bold'>{_data.LoaiTTPT ?? ""}</span></td>");
            sb.Append("</tr>");
            sb.Append("</table>");

            sb.Append($"<div class='compact-text'>- Can thiệp phẫu thuật: <span class='bold'>{_data.CanThiepPhauThuat ?? ""}</span></div>");
            sb.Append($"<div class='compact-text'>- Bác sĩ phẫu thuật: <span class='bold'>{_data.BacSiPhauThuat ?? ""}</span></div>");
            sb.Append($"<div class='compact-text'>- Phụ mổ: <span class='bold'>{_data.PhuTTPT ?? ""}</span></div>");
            sb.Append($"<div class='compact-text'>- Bác sĩ gây mê: <span class='bold'>{_data.BacSiGayMe ?? ""}</span></div>");
            sb.Append($"<div class='compact-text' style='margin-bottom:20px;'>- KTV gây mê: <span class='bold'>{_data.KyThuatVienGayMe ?? ""}</span></div>");

            // Lược đồ mô tả text trên trang 1
            sb.Append("<div class='border-box'>");
            sb.Append("<div class='luoc-do-title'>LƯỢC ĐỒ PHẪU THUẬT / THỦ THUẬT</div>");
            sb.Append("</div>");

            // PAGE BREAK
            sb.Append("<div class='page-break'></div>");

            // ===== TRANG 2: HÌNH ẢNH + TƯỜNG TRÌNH =====

            // HÌNH ẢNH LƯỢC ĐỒ
            if (listAnhTruongTrinh != null && listAnhTruongTrinh.Any())
            {
                sb.Append("<div class='border-box'>");
                sb.Append("<div class='image-container'>");

                foreach (var anh in listAnhTruongTrinh)
                {
                    if (!string.IsNullOrEmpty(anh.URL))
                    {
                        string base64Image = await DownloadImageFromFtpAsBase64(anh.URL);
                        if (!string.IsNullOrEmpty(base64Image))
                        {
                            string mimeType = GetMimeType(anh.URL);
                            sb.Append($"<img src='data:{mimeType};base64,{base64Image}' class='luoc-do-image' alt='{anh.TenAnh ?? ""}' />");
                        }
                    }
                }
                sb.Append("</div>");
                sb.Append($"<div class='luoc-do-content'>{_data.ThongTinLuocDo ?? ""}</div>");

                // Thông tin bổ sung
                string ngayRutChiText = _data.NgayRut.HasValue ?
                    $"{_data.NgayRut.Value:HH} giờ {_data.NgayRut.Value:mm} phút, ngày {_data.NgayRut.Value:dd}/{_data.NgayRut.Value:MM}/{_data.NgayRut.Value:yyyy}" : "";

                string ngayCatChiText = _data.NgayCatChi.HasValue ?
                    $"{_data.NgayCatChi.Value:HH} giờ {_data.NgayCatChi.Value:mm} phút, ngày {_data.NgayCatChi.Value:dd}/{_data.NgayCatChi.Value:MM}/{_data.NgayCatChi.Value:yyyy}" : "";

                sb.Append($"<div class='compact-text' style='text-align:left; margin-top:50px;'>- Dẫn lưu: <span class='bold'>{_data.DanLuu ?? ""}</span></div>");
                sb.Append($"<div class='compact-text' style='text-align:left;'>- Bấc: <span class='bold'>{_data.Bac ?? ""}</span></div>");
                sb.Append($"<div class='compact-text' style='text-align:left;'>- Ngày rút chỉ: <span class='bold'>{ngayRutChiText}</span></div>");
                sb.Append($"<div class='compact-text' style='text-align:left;'>- Ngày cắt chỉ: <span class='bold'>{ngayCatChiText}</span></div>");
                sb.Append($"<div class='compact-text' style='text-align:left;'>- Khác: <span class='bold'>{_data.Khac ?? ""}</span></div>");

                sb.Append("</div>");
            }

            // TƯỜNG TRÌNH
            sb.Append("<div class='border-box'>");
            sb.Append("<div class='luoc-do-title'>TƯỜNG TRÌNH PHẪU THUẬT / THỦ THUẬT</div>");
            sb.Append($"<div class='tuong-trinh-content'>{_data.TrinhTu}</div>");

            if (!string.IsNullOrWhiteSpace(_data.KetLuan))
            {
                sb.Append($"<div class='compact-text bold'>Kết luận: {_data.KetLuan}</div>");
            }
            sb.Append("</div>");

            // CHỮ KÝ
            sb.Append("<div class='signature-section'>");
            sb.Append("<div class='signature-box'>");
            sb.Append($"<div class='signature-date'>Ngày {DateTime.Now:dd} tháng {DateTime.Now:MM} năm {DateTime.Now:yyyy}</div>");
            sb.Append("<div class='signature-title'>PHẪU THUẬT/ THỦ THUẬT VIÊN</div>");
            sb.Append("<div class='signature-note'>(Ký, ghi rõ họ tên)</div>");
            sb.Append("</div>");
            sb.Append("</div>");

            sb.Append("</body></html>");

            return sb.ToString();
        }

        private async Task<string> DownloadImageFromFtpAsBase64(string ftpPath)
        {
            try
            {
                if (string.IsNullOrEmpty(ftpPath))
                    return null;

                using (var stream = await _ftpService.DownloadAsync(ftpPath))
                {
                    if (stream == null || stream.Length == 0)
                        return null;

                    using (var memoryStream = new MemoryStream())
                    {
                        await stream.CopyToAsync(memoryStream);
                        byte[] imageBytes = memoryStream.ToArray();
                        return Convert.ToBase64String(imageBytes);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tải ảnh: {ex.Message}");
            }
        }

        private string GetMimeType(string filePath)
        {
            var extension = Path.GetExtension(filePath)?.ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".webp" => "image/webp",
                _ => "image/jpeg" 
            };
        }


        // === Handler đánh số trang và ngày in ===
        private class PageNumberHandler : IEventHandler
        {
            private readonly string _fontFolder;

            public PageNumberHandler(string fontFolder)
            {
                _fontFolder = fontFolder;
            }

            public void HandleEvent(Event @event)
            {
                var docEvent = (PdfDocumentEvent)@event;
                var pdfDoc = docEvent.GetDocument();
                var page = docEvent.GetPage();
                int pageNumber = pdfDoc.GetPageNumber(page);
                int totalPages = pdfDoc.GetNumberOfPages();
                var canvas = new PdfCanvas(page.NewContentStreamAfter(), page.GetResources(), pdfDoc);
                var document = new Document(pdfDoc);
                var fontSet = new FontSet();
                fontSet.AddFont(Path.Combine(_fontFolder, "timesi.ttf"));
                var fontProvider = new FontProvider(fontSet);
                document.SetFontProvider(fontProvider);

                string ngayIn = $"(In ngày: {DateTime.Now:dd/MM/yyyy HH:mm})";
                document.ShowTextAligned(
                    new Paragraph(ngayIn).SetFontSize(10).SetFontFamily("Times New Roman"),
                    40,
                    20, 
                    pageNumber,
                    TextAlignment.LEFT,
                    VerticalAlignment.BOTTOM,
                    0
                );
                document.ShowTextAligned(
                    new Paragraph($"Trang {pageNumber}/{totalPages}").SetFontSize(10).SetFontFamily("Times New Roman"),
                    pdfDoc.GetDefaultPageSize().GetWidth() - 40,
                    20,
                    pageNumber,
                    TextAlignment.RIGHT,
                    VerticalAlignment.BOTTOM,
                    0
                );
                canvas.Release();
            }
        }

        private async Task<List<AnhTruongTrinhDTO>> GetListAnhTuIDPhieuTTPT(long idPhieuTTPT)
        {
            var sql = "EXEC dbo.S0305_TTPT_GetAnhTruongTrinhTheoIDPhieuTTPT @IDPhieuTTPT";
            var idParam = new SqlParameter("@IDPhieuTTPT", idPhieuTTPT);

            var images = await _context.AnhTruongTrinh
                                       .FromSqlRaw(sql, idParam)
                                       .ToListAsync();

            return images.Select(img => new AnhTruongTrinhDTO
            {
                ID = img.ID,
                TenAnh = img.TenAnh,
                ThoiGianTao = img.ThoiGianTao,
                URL = img.URL,
                HttpUrl = $"/thu_thuat_phau_thuat/image/view?path={Uri.EscapeDataString(img.URL)}"
            }).ToList();
        }
    }
}