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
using System.Text;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;

namespace ThuThuatPhauThuat.PDFDocuments.P0302
{
    public class P0305ThuThuatPhauThuatPDF
    {
        private readonly M0302ThongTinXuatPDFTTPTModel2 _data;
        private readonly M0302ThongTinDoanhNghiep _thongTinDoanhNghiep;
        private readonly string _logoPath;

        public P0305ThuThuatPhauThuatPDF(M0302ThongTinXuatPDFTTPTModel2 data, M0302ThongTinDoanhNghiep doanhNghiep)
        {
            _data = data ?? new M0302ThongTinXuatPDFTTPTModel2();
            _thongTinDoanhNghiep = doanhNghiep ?? new M0302ThongTinDoanhNghiep
            {
                TenCSKCB = "Tên đơn vị",
                DiaChi = "",
                DienThoai = ""
            };
            _logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "dist", "img", "Logo-BVUB.jpg");
        }

        public byte[] GeneratePdf()
        {
            using var memoryStream = new MemoryStream();
            var writer = new PdfWriter(memoryStream);
            var pdfDocument = new PdfDocument(writer);

            // === Gắn Event để đánh số trang ===
            pdfDocument.AddEventHandler(PdfDocumentEvent.END_PAGE, new PageNumberHandler());

            // HTML content
            var htmlContent = GenerateHtmlContent();

            // === Load custom fonts ===
            string fontFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "dist", "js", "J0302", "J0302Fonts");

            var fontSet = new FontSet();
            fontSet.AddFont(Path.Combine(fontFolder, "times.ttf"));      // Regular
            fontSet.AddFont(Path.Combine(fontFolder, "timesbd.ttf"));    // Bold
            fontSet.AddFont(Path.Combine(fontFolder, "timesi.ttf"));     // Italic
            fontSet.AddFont(Path.Combine(fontFolder, "timesbi.ttf"));    // Bold Italic

            var fontProvider = new FontProvider(fontSet);

            var converterProperties = new ConverterProperties()
                .SetFontProvider(fontProvider)
                .SetCharset("utf-8");

            htmlContent = "<style> body { font-family: 'Times New Roman'; } </style>" + htmlContent;

            HtmlConverter.ConvertToPdf(htmlContent, pdfDocument, converterProperties);

            pdfDocument.Close();
            return memoryStream.ToArray();
        }

        public void SavePdf(string outputPath)
        {
            var pdfBytes = GeneratePdf();
            File.WriteAllBytes(outputPath, pdfBytes);
        }

        private string GenerateHtmlContent()
        {
            var sb = new StringBuilder();

            // Logo base64
            string logoBase64 = "";
            if (File.Exists(_logoPath))
            {
                byte[] imageBytes = File.ReadAllBytes(_logoPath);
                logoBase64 = Convert.ToBase64String(imageBytes);
            }

            sb.Append(@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                @page {
                    size: A4;
                    margin: 25px;
                }
                body {
                    font-family: 'Times New Roman', serif;
                    font-size: 14px;
                    color: black;
                    line-height: 1.4;
                }
                .title {
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .bold { font-weight: bold; }
                .border-box {
                    border: 1px solid black;
                    padding: 5px;
                    height: max-content ;
                    font-size: 14px;
                    margin-top: 10px;
                }
                .page-break { page-break-after: always; }
                .signature-section {
                    margin-top: 20px;
                    text-align: right;
                }
                .signature-box {
                    display: inline-block;
                    text-align: center;
                    width: 250px;
                }
                .signature-date {
                    font-size: 13px;
                    font-style: italic;
                }
                .signature-title {
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 5px;
                }
                .signature-note {
                    font-size: 13px;
                    font-style: italic;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                td {
                    vertical-align: top;
                }

                                .box-title {
                                    margin-top: 5px;
                                    margin-bottom: 5px;
                                }
    
                                .box-text {
                                    font-size: 14px !important; 
                                    text-align: left;
                                    margin-top: 2px;
                                    margin-bottom: 2px;;
                                }
                            </style>
                        </head>
                        <body>");

            // ===== HEADER =====
            sb.Append("<table style='width:100%; margin-bottom:10px;'>");
            sb.Append("<tr>");
            sb.Append("<td style='width:70%;'>");

            if (!string.IsNullOrEmpty(logoBase64))
            {
                sb.Append($"<img src='data:image/jpeg;base64,{logoBase64}' style='width:32px; height:33px; margin-right:5px; vertical-align:top;' />");
            }
            sb.Append("<div style='display:inline-block;'>");
            sb.Append($"<div class='bold'>{_thongTinDoanhNghiep.TenCoQuanChuyenMon ?? ""}</div>");
            sb.Append($"<div class='bold'>{_thongTinDoanhNghiep.TenCSKCB ?? ""}</div>");
            sb.Append("</div>");
            sb.Append("</td>");

            sb.Append("<td style='width:30%; font-size:10px; font-style:italic;'>");
            sb.Append("<div>Mã số: 14/BV-01</div>");
            sb.Append($"<div>Mã số đợt/MYT: <span class='bold'>{_data.MaVaoVien ?? ""}</span></div>");
            sb.Append("</td>");
            sb.Append("</tr>");
            sb.Append("</table>");

            // ===== TIÊU ĐỀ =====
            sb.Append("<div class='title'>PHIẾU PHẪU THUẬT / THỦ THUẬT</div>");

            // ===== THÔNG TIN NGƯỜI BỆNH =====
            int tuoi = DateTime.Now.Year - (_data.NamSinh ?? DateTime.Now.Year);

            sb.Append("<table>");
            sb.Append("<tr>");
            sb.Append($"<td>- Họ tên người bệnh: <span class='bold'>{_data.TenBN ?? ""}</span></td>");
            sb.Append($"<td style='text-align:right;'>Tuổi: <span class='bold' style='margin-right:8px;'>{tuoi}</span>&nbsp;&nbsp;&nbsp;Giới tính: <span class='bold' style='margin-right:5px;'>{_data.TenGioiTinh ?? ""}</span></td>");
            sb.Append("</tr>");
            sb.Append("</table>");

            sb.Append("<table>");
            sb.Append("<tr>");
            sb.Append($"<td>- Khoa/Phòng: <span class='bold'>{_data.Khoa ?? ""}</span></td>");
            sb.Append($"<td style='text-align:right;'>Buồng: <span class='bold' style='margin-right:20px;'>{_data.Buong}</span>&nbsp;&nbsp;&nbsp;Giường: <span class='bold' style='margin-right:10px;'>{_data.Giuong}</span></td>");
            sb.Append("</tr>");
            sb.Append("</table>");

            // Vào viện lúc
            string vaoVienText = "";
            if (_data.VaoVienLuc.HasValue)
            {
                var dt = _data.VaoVienLuc.Value;
                vaoVienText = $"{dt:HH} giờ {dt:mm} phút {dt:ss} giây, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
            }
            sb.Append($"<div>- Vào viện lúc: <span class='bold'>{vaoVienText}</span></div>");

            // Bắt đầu thủ thuật
            string batDauText = "";
            if (_data.BatDauThuThuat.HasValue)
            {
                var dt = _data.BatDauThuThuat.Value;
                batDauText = $"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
            }
            sb.Append($"<div>- Phẫu thuật/ Thủ thuật lúc: <span class='bold'>{batDauText}</span></div>");

            // Kết thúc thủ thuật
            string ketThucText = "";
            if (_data.KetThucThuThuat.HasValue)
            {
                var dt = _data.KetThucThuThuat.Value;
                ketThucText = $"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
            }
            sb.Append($"<div>- Phẫu thuật/ Thủ thuật kết thúc: <span class='bold'>{ketThucText}</span></div>");

            // Chẩn đoán
            sb.Append($"<div>- Chẩn đoán: Trước phẫu thuật/ thủ thuật: <span class='bold'>{_data.TenChanDoanTruoc ?? ""}</span></div>");
            sb.Append($"<div style='margin-left:72px;'>Sau phẫu thuật/ thủ thuật: <span class='bold'>{_data.TenChanDoanSau ?? ""}</span></div>");

            // Phương pháp
            sb.Append($"<div>- Phương pháp phẫu thuật/ thủ thuật: <span class='bold'>{_data.PhuongPhapTTPT ?? ""}</span></div>");
            sb.Append("<table>");
            sb.Append("<tr>");
            sb.Append($"<td>- Phương pháp vô cảm: <span class='bold'>{_data.PhuongPhapVoCam ?? ""}</span></td>");
            sb.Append($"<td style='text-align:right;'>Loại: <span class='bold'>{_data.LoaiTTPT ?? ""}</span></td>");
            sb.Append("</tr>");
            sb.Append("</table>");

            sb.Append($"<div>- Can thiệp phẫu thuật: <span class='bold'>{_data.CanThiepPhauThuat ?? ""}</span></div>");
            sb.Append($"<div>- Bác sĩ phẫu thuật: <span class='bold'>{_data.BacSiPhauThuat ?? ""}</span></div>");
            sb.Append($"<div>- Phụ mổ: <span class='bold'>{_data.PhuTTPT ?? ""}</span></div>");
            sb.Append($"<div>- Bác sĩ gây mê: <span class='bold'>{_data.BacSiGayMe ?? ""}</span></div>");
            sb.Append($"<div>- KTV gây mê: <span class='bold'>{_data.KyThuatVienGayMe ?? ""}</span></div>");
            string ngayRutChiText = "";
            if (_data.NgayRut.HasValue)
            {
                var dt = _data.NgayRut.Value;
                ngayRutChiText = $"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
            }
            string ngayCatChiText = "";
            if (_data.NgayCatChi.HasValue)
            {
                var dt = _data.NgayCatChi.Value;
                ngayCatChiText = $"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
            }
            // ===== LƯỢC ĐỒ =====
            // ===== LƯỢC ĐỒ =====
            sb.Append(@$"<div class='border-box' >
                        <h2 style='text-align:center'> LƯỢC ĐỒ PHẪU THUẬT / THỦ THUẬT (vẽ hoặc mô tả)</h2>
                        <img src='https://vn1.vdrive.vn/alohamedia.vn/2025/02/632fbd20f18a2a1bc6df569b31eda210.jpg' alt='' width ='300' height ='150'>
                        <img src='https://vn1.vdrive.vn/alohamedia.vn/2025/02/632fbd20f18a2a1bc6df569b31eda210.jpg' alt='' width ='300' height ='150'>
                        <img src='https://vn1.vdrive.vn/alohamedia.vn/2025/02/632fbd20f18a2a1bc6df569b31eda210.jpg' alt='' width ='300' height ='150'>

                        <p class='box-text'>- Dẫn lưu: <span class='bold'> {_data.DanLuu ?? ""}</span></p>
                        <p class='box-text'>- Bấc: <span class='bold'></span>{_data.Bac ?? ""}</p>
                        <p class='box-text'>- Ngày rút chỉ: <span class='bold'>{ngayRutChiText}</span></p>
                        <p class='box-text'>- Ngày cắt chỉ: <span class='bold'> {ngayCatChiText}</span></p>
                        <p class='box-text'>- Khác: <span class='bold'>{_data.Khac ?? ""}</span></p>
                    </div>");
            // Page break
            sb.Append("<div class='page-break'></div>");


            // ===== TƯỜNG TRÌNH =====
            sb.Append(@$"<div class='border-box'>
                        <h2 style='text-align:center'> TƯỜNG TRÌNH PHẪU THUẬT / THỦ THUẬT </h2>
                         {_data.TrinhTu}
                           <p class='box-text bold'>KẾT LUẬN: {_data.KetLuan ?? ""}</p>
                    </div>");

            // ===== CHỮ KÝ =====
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

        // === Handler đánh số trang ===
        private class PageNumberHandler : IEventHandler
        {
            public void HandleEvent(Event @event)
            {
                var docEvent = (PdfDocumentEvent)@event;
                var pdfDoc = docEvent.GetDocument();
                var page = docEvent.GetPage();

                int pageNumber = pdfDoc.GetPageNumber(page);
                int totalPages = pdfDoc.GetNumberOfPages();

                var canvas = new PdfCanvas(page.NewContentStreamAfter(), page.GetResources(), pdfDoc);
                var document = new Document(pdfDoc);

                // Vẽ số trang ở góc phải dưới
                document.ShowTextAligned(
                    new Paragraph($"Trang {pageNumber}/{totalPages}").SetFontSize(10),
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
    }
}




//using DemoCauTruc.Models.M0302;
//using iText.Html2pdf;
//using iText.Html2pdf.Resolver.Font;
//using iText.Kernel.Pdf;
//using iText.Layout.Font;
//using System.Text;
//using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;

//namespace ThuThuatPhauThuat.PDFDocuments.P0302
//{
//    public class P0305ThuThuatPhauThuatPDF
//    {
//        private readonly M0302ThongTinXuatPDFTTPTModel2 _data;
//        private readonly M0302ThongTinDoanhNghiep _thongTinDoanhNghiep;
//        private readonly string _logoPath;

//        public P0305ThuThuatPhauThuatPDF(M0302ThongTinXuatPDFTTPTModel2 data, M0302ThongTinDoanhNghiep doanhNghiep)
//        {
//            _data = data ?? new M0302ThongTinXuatPDFTTPTModel2();
//            _thongTinDoanhNghiep = doanhNghiep ?? new M0302ThongTinDoanhNghiep
//            {
//                TenCSKCB = "Tên đơn vị",
//                DiaChi = "",
//                DienThoai = ""
//            };
//            _logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "dist", "img", "Logo-BVUB.jpg");
//        }

//        public byte[] GeneratePdf()
//        {
//            using var memoryStream = new MemoryStream();
//            var writer = new PdfWriter(memoryStream);
//            var pdfDocument = new PdfDocument(writer);

//            // HTML content
//            var htmlContent = GenerateHtmlContent();

//            // === Load custom fonts ===
//            string fontFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "dist", "js", "J0302", "J0302Fonts");

//            var fontSet = new FontSet();

//            // Đăng ký từng font vào "Times New Roman" family
//            fontSet.AddFont(Path.Combine(fontFolder, "times.ttf"));      // Regular
//            fontSet.AddFont(Path.Combine(fontFolder, "timesbd.ttf"));    // Bold
//            fontSet.AddFont(Path.Combine(fontFolder, "timesi.ttf"));     // Italic
//            fontSet.AddFont(Path.Combine(fontFolder, "timesbi.ttf"));    // Bold Italic

//            var fontProvider = new FontProvider(fontSet);

//            var converterProperties = new ConverterProperties()
//                .SetFontProvider(fontProvider)
//                .SetCharset("utf-8");

//            htmlContent = "<style> body { font-family: 'Times New Roman'; } </style>" + htmlContent;

//            HtmlConverter.ConvertToPdf(htmlContent, pdfDocument, converterProperties);

//            pdfDocument.Close();
//            return memoryStream.ToArray();
//        }

//        public void SavePdf(string outputPath)
//        {
//            var pdfBytes = GeneratePdf();
//            File.WriteAllBytes(outputPath, pdfBytes);
//        }


//        private string GenerateHtmlContent()
//        {
//            var sb = new StringBuilder();

//            // Logo base64
//            string logoBase64 = "";
//            if (File.Exists(_logoPath))
//            {
//                byte[] imageBytes = File.ReadAllBytes(_logoPath);
//                logoBase64 = Convert.ToBase64String(imageBytes);
//            }

//            sb.Append(@"
//        <!DOCTYPE html>
//        <html>
//        <head>
//            <meta charset='UTF-8'>
//            <style>
//                @page {
//                    size: A4;
//                    margin: 25px;
//                }
//                body {
//                    font-family: 'Times New Roman', serif;
//                    font-size: 14px;
//                    color: black;
//                    line-height: 1.4;
//                }
//                .title {
//                    text-align: center;
//                    font-size: 16px;
//                    font-weight: bold;
//                    margin: 10px 0;
//                }
//                .bold { font-weight: bold; }
//                .border-box {
//                    border: 1px solid black;
//                    padding: 5px;
//                    min-height: 1000px;
//                    font-size: 14px;
//                    margin-top: 10px;
//                }
//                .page-break { page-break-after: always; }
//                .signature-section {
//                    margin-top: 20px;
//                    text-align: right;
//                }
//                .signature-box {
//                    display: inline-block;
//                    text-align: center;
//                    width: 250px;
//                }
//                .signature-date {
//                    font-size: 13px;
//                    font-style: italic;
//                }
//                .signature-title {
//                    font-size: 14px;
//                    font-weight: bold;
//                    margin-top: 5px;
//                }
//                .signature-note {
//                    font-size: 13px;
//                    font-style: italic;
//                }
//                table {
//                    width: 100%;
//                    border-collapse: collapse;
//                }
//                td {
//                    vertical-align: top;
//                }

//                                .box-title {
//                                    margin-top: 5px;
//                                    margin-bottom: 5px;
//                                }

//                                .box-text {
//                                    font-size: 14px !important; 
//                                    text-align: left;
//                                    margin-top: 2px;
//                                    margin-bottom: 2px;;
//                                }
//                            </style>
//                        </head>
//                        <body>");

//            // ===== HEADER =====
//            sb.Append("<table style='width:100%; margin-bottom:10px;'>");
//            sb.Append("<tr>");
//            sb.Append("<td style='width:70%;'>");

//            if (!string.IsNullOrEmpty(logoBase64))
//            {
//                sb.Append($"<img src='data:image/jpeg;base64,{logoBase64}' style='width:32px; height:33px; margin-right:5px; vertical-align:top;' />");
//            }
//            sb.Append("<div style='display:inline-block;'>");
//            sb.Append($"<div class='bold'>{_thongTinDoanhNghiep.TenCoQuanChuyenMon ?? ""}</div>");
//            sb.Append($"<div class='bold'>{_thongTinDoanhNghiep.TenCSKCB ?? ""}</div>");
//            sb.Append("</div>");
//            sb.Append("</td>");

//            sb.Append("<td style='width:30%; font-size:10px; font-style:italic;'>");
//            sb.Append("<div>Mã số: 14/BV-01</div>");
//            sb.Append($"<div>Mã số đợt/MYT: <span class='bold'>{_data.MaVaoVien ?? ""}</span></div>");
//            sb.Append("</td>");
//            sb.Append("</tr>");
//            sb.Append("</table>");

//            // ===== TIÊU ĐỀ =====
//            sb.Append("<div class='title'>PHIẾU PHẪU THUẬT / THỦ THUẬT</div>");

//            // ===== THÔNG TIN NGƯỜI BỆNH =====
//            int tuoi = DateTime.Now.Year - (_data.NamSinh ?? DateTime.Now.Year);

//            sb.Append("<table>");
//            sb.Append("<tr>");
//            sb.Append($"<td>- Họ tên người bệnh: <span class='bold'>{_data.TenBN ?? ""}</span></td>");
//            sb.Append($"<td style='text-align:right;'>Tuổi: <span class='bold' style='margin-right:8px;'>{tuoi}</span>&nbsp;&nbsp;&nbsp;Giới tính: <span class='bold' style='margin-right:5px;'>{_data.TenGioiTinh ?? ""}</span></td>");
//            sb.Append("</tr>");
//            sb.Append("</table>");

//            sb.Append("<table>");
//            sb.Append("<tr>");
//            sb.Append($"<td>- Khoa/Phòng: <span class='bold'>{_data.Khoa ?? ""}</span></td>");
//            sb.Append($"<td style='text-align:right;'>Buồng: <span class='bold' style='margin-right:20px;'>{_data.Buong}</span>&nbsp;&nbsp;&nbsp;Giường: <span class='bold' style='margin-right:10px;'>{_data.Giuong}</span></td>");
//            sb.Append("</tr>");
//            sb.Append("</table>");

//            // Vào viện lúc
//            string vaoVienText = "";
//            if (_data.VaoVienLuc.HasValue)
//            {
//                var dt = _data.VaoVienLuc.Value;
//                vaoVienText = $"{dt:HH} giờ {dt:mm} phút {dt:ss} giây, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
//            }
//            sb.Append($"<div>- Vào viện lúc: <span class='bold'>{vaoVienText}</span></div>");

//            // Bắt đầu thủ thuật
//            string batDauText = "";
//            if (_data.BatDauThuThuat.HasValue)
//            {
//                var dt = _data.BatDauThuThuat.Value;
//                batDauText = $"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
//            }
//            sb.Append($"<div>- Phẫu thuật/ Thủ thuật lúc: <span class='bold'>{batDauText}</span></div>");

//            // Kết thúc thủ thuật
//            string ketThucText = "";
//            if (_data.KetThucThuThuat.HasValue)
//            {
//                var dt = _data.KetThucThuThuat.Value;
//                ketThucText = $"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
//            }
//            sb.Append($"<div>- Phẫu thuật/ Thủ thuật kết thúc: <span class='bold'>{ketThucText}</span></div>");

//            // Chẩn đoán
//            sb.Append($"<div>- Chẩn đoán: Trước phẫu thuật/ thủ thuật: <span class='bold'>{_data.TenChanDoanTruoc ?? ""}</span></div>");
//            sb.Append($"<div style='margin-left:72px;'>Sau phẫu thuật/ thủ thuật: <span class='bold'>{_data.TenChanDoanSau ?? ""}</span></div>");

//            // Phương pháp
//            sb.Append($"<div>- Phương pháp phẫu thuật/ thủ thuật: <span class='bold'>{_data.PhuongPhapTTPT ?? ""}</span></div>");
//            sb.Append("<table>");
//            sb.Append("<tr>");
//            sb.Append($"<td>- Phương pháp vô cảm: <span class='bold'>{_data.PhuongPhapVoCam ?? ""}</span></td>");
//            sb.Append($"<td style='text-align:right;'>Loại: <span class='bold'>{_data.LoaiTTPT ?? ""}</span></td>");
//            sb.Append("</tr>");
//            sb.Append("</table>");

//            sb.Append($"<div>- Can thiệp phẫu thuật: <span class='bold'>{_data.CanThiepPhauThuat ?? ""}</span></div>");
//            sb.Append($"<div>- Bác sĩ phẫu thuật: <span class='bold'>{_data.BacSiPhauThuat ?? ""}</span></div>");
//            sb.Append($"<div>- Phụ mổ: <span class='bold'>{_data.PhuTTPT ?? ""}</span></div>");
//            sb.Append($"<div>- Bác sĩ gây mê: <span class='bold'>{_data.BacSiGayMe ?? ""}</span></div>");
//            sb.Append($"<div>- KTV gây mê: <span class='bold'>{_data.KyThuatVienGayMe ?? ""}</span></div>");
//            string ngayRutChiText = "";
//            if (_data.NgayRut.HasValue)
//            {
//                var dt = _data.NgayRut.Value;
//                ngayRutChiText = $"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
//            }
//            string ngayCatChiText = "";
//            if (_data.NgayCatChi.HasValue)
//            {
//                var dt = _data.NgayCatChi.Value;
//                ngayCatChiText = $"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}";
//            }
//            // ===== LƯỢC ĐỒ =====
//            // ===== LƯỢC ĐỒ =====
//            sb.Append(@$"<div class='border-box' >
//                        <h2 style='text-align:center'> LƯỢC ĐỒ PHẪU THUẬT / THỦ THUẬT (vẽ hoặc mô tả)</h2>
//                        <img src='https://vn1.vdrive.vn/alohamedia.vn/2025/02/632fbd20f18a2a1bc6df569b31eda210.jpg' alt='' width ='300' height ='150'>
//                        <img src='https://vn1.vdrive.vn/alohamedia.vn/2025/02/632fbd20f18a2a1bc6df569b31eda210.jpg' alt='' width ='300' height ='150'>
//                        <img src='https://vn1.vdrive.vn/alohamedia.vn/2025/02/632fbd20f18a2a1bc6df569b31eda210.jpg' alt='' width ='300' height ='150'>

//                        <p class='box-text'>- Dẫn lưu: <span class='bold'> {_data.DanLuu ?? ""}</span></p>
//                        <p class='box-text'>- Bấc: <span class='bold'></span>{_data.Bac ?? ""}</p>
//                        <p class='box-text'>- Ngày rút chỉ: <span class='bold'>{ngayRutChiText}</span></p>
//                        <p class='box-text'>- Ngày cắt chỉ: <span class='bold'> {ngayCatChiText}</span></p>
//                        <p class='box-text'>- Khác: <span class='bold'>{_data.Khac ?? ""}</span></p>
//                    </div>");
//            // Page break
//            sb.Append("<div class='page-break'></div>");


//            // ===== TƯỜNG TRÌNH =====
//            sb.Append(@$"<div class='border-box'>
//                        <h2 style='text-align:center'> TƯỜNG TRÌNH PHẪU THUẬT / THỦ THUẬT </h2>
//                         {_data.TrinhTu}
//                           <p class='box-text bold'>KẾT LUẬN: {_data.KetLuan ?? ""}</p>
//                    </div>");

//            // ===== CHỮ KÝ =====
//            sb.Append("<div class='signature-section'>");
//            sb.Append("<div class='signature-box'>");
//            sb.Append($"<div class='signature-date'>Ngày {DateTime.Now:dd} tháng {DateTime.Now:MM} năm {DateTime.Now:yyyy}</div>");
//            sb.Append("<div class='signature-title'>PHẪU THUẬT/ THỦ THUẬT VIÊN</div>");
//            sb.Append("<div class='signature-note'>(Ký, ghi rõ họ tên)</div>");
//            sb.Append("</div>");
//            sb.Append("</div>");

//            sb.Append("</body></html>");

//            return sb.ToString();
//        }

//    }
//}
