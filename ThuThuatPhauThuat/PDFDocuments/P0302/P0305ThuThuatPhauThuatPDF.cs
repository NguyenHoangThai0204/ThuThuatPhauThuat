using DemoCauTruc.Models.M0302;
using iText.Html2pdf;
using iText.Html2pdf.Resolver.Font;
using iText.Kernel.Pdf;
using iText.Layout.Font;
using System.Text;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;

namespace ThuThuatPhauThuat.PDFDocuments.P0302
{
    public class P0305ThuThuatPhauThuatPDF
    {
        private readonly M0302ThongTinXuatPDFTTPTModel _data;
        private readonly M0302ThongTinDoanhNghiep _thongTinDoanhNghiep;
        private readonly string _logoPath;

        public P0305ThuThuatPhauThuatPDF(M0302ThongTinXuatPDFTTPTModel data, M0302ThongTinDoanhNghiep doanhNghiep)
        {
            _data = data ?? new M0302ThongTinXuatPDFTTPTModel();
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

            // HTML content
            var htmlContent = GenerateHtmlContent();

            // === Load custom fonts ===
            string fontFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "dist", "js", "J0302", "J0302Fonts");

            var fontSet = new FontSet();

            // Đăng ký từng font vào "Times New Roman" family
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
                    margin: 15px 0;
                }
                .bold { font-weight: bold; }
                .border-box {
                    border: 1px solid black;
                    padding: 5px;
                    height: 200px;
                    text-align: center;
                    font-size: 11px;
                    font-style: italic;
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
                    width: 200px;
                }
                .signature-date {
                    font-size: 10px;
                    font-style: italic;
                }
                .signature-title {
                    font-size: 11px;
                    font-weight: bold;
                    margin-top: 5px;
                }
                .signature-note {
                    font-size: 9px;
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
                sb.Append($"<img src='data:image/jpeg;base64,{logoBase64}' style='width:28px; height:31px; margin-right:5px; vertical-align:top;' />");
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
            sb.Append($"<td style='text-align:right;'>Tuổi: <span class='bold'>{tuoi}</span>&nbsp;&nbsp;&nbsp;Giới tính: <span class='bold'>{_data.TenGioiTinh ?? ""}</span></td>");
            sb.Append("</tr>");
            sb.Append("</table>");

            sb.Append("<table>");
            sb.Append("<tr>");
            sb.Append($"<td>- Khoa/Phòng: <span class='bold'>{_data.Khoa ?? ""}</span></td>");
            sb.Append($"<td style='text-align:right;'>Buồng: <span class='bold'>{_data.Buong}</span>&nbsp;&nbsp;&nbsp;Giường: <span class='bold'>{_data.Giuong}</span></td>");
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
            sb.Append($"<div style='margin-left:65px;'>Sau phẫu thuật/ thủ thuật: <span class='bold'>{_data.TenChanDoanSau ?? ""}</span></div>");

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
            sb.Append(@$"<div class='border-box'>
                        <h2> LƯỢC ĐỒ PHẪU THUẬT / THỦ THUẬT (vẽ hoặc mô tả)</h2>
                        <img src='https://vn1.vdrive.vn/alohamedia.vn/2025/02/632fbd20f18a2a1bc6df569b31eda210.jpg' alt='' width ='80' height ='60'>

                        <p class='box-text'>- Dẫn lưu: {_data.DanLuu ?? ""}</p>
                        <p class='box-text'>- Bấc: {_data.Bac ?? ""}</p>
                        <p class='box-text'>- Ngày rút chỉ: {ngayRutChiText}</p>
                        <p class='box-text'>- Ngày cắt chỉ:  {ngayCatChiText}</p>
                        <p class='box-text'>- Khác: {_data.Khac ?? ""}</p>
                    </div>");

            // Page break
            sb.Append("<div class='page-break'></div>");


            // ===== TƯỜNG TRÌNH =====
            sb.Append(@$"<div class='border-box'>
                        <h2> TƯỜNG TRÌNH PHẪU THUẬT / THỦ THUẬT </h2>

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

    }
}
