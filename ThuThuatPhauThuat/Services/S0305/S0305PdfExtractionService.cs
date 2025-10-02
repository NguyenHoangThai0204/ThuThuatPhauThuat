using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using iText.Layout;
using System.Text;
using System.Text.RegularExpressions;

namespace ThuThuatPhauThuat.Services.S0305
{
    public class S0305PdfExtractionService
    {
        public async Task<PdfExtractionResult> ExtractFormattedContentFromPdf(Stream pdfStream)
        {
            try
            {
                using var pdfReader = new PdfReader(pdfStream);
                using var pdfDocument = new PdfDocument(pdfReader);

                var result = new PdfExtractionResult
                {
                    HtmlContent = new StringBuilder(),
                    StructuredData = new Dictionary<string, string>(),
                    Images = new List<PdfImageData>()
                };

                for (int pageNum = 1; pageNum <= pdfDocument.GetNumberOfPages(); pageNum++)
                {
                    var page = pdfDocument.GetPage(pageNum);

                    // Trích xuất text
                    var strategy = new LocationTextExtractionStrategy();
                    var pageText = PdfTextExtractor.GetTextFromPage(page, strategy);

                    // Convert sang HTML
                    var htmlContent = ConvertTextToHtml(pageText, pageNum);
                    result.HtmlContent.Append(htmlContent);

                    // Trích xuất ảnh
                    var images = ExtractImagesFromPage(page, pageNum);
                    result.Images.AddRange(images);
                }

                // Parse structured data
                result.StructuredData = ParseStructuredData(result.HtmlContent.ToString());

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi trích xuất PDF: {ex.Message}", ex);
            }
        }

        private string ConvertTextToHtml(string text, int pageNum)
        {
            var html = new StringBuilder();
            var lines = text.Split('\n');

            html.Append($"<div class='pdf-page' data-page='{pageNum}'>");

            foreach (var line in lines)
            {
                var trimmed = line.Trim();
                if (string.IsNullOrEmpty(trimmed)) continue;

                if (IsHeader(trimmed))
                {
                    html.Append($"<h6 class='pdf-header'><strong>{trimmed}</strong></h6>");
                }
                else if (IsLabel(trimmed))
                {
                    var parts = trimmed.Split(new[] { ':' }, 2);
                    if (parts.Length == 2)
                    {
                        html.Append($"<p class='pdf-field'><span class='label'>{parts[0]}:</span> <span class='value'>{parts[1].Trim()}</span></p>");
                    }
                    else
                    {
                        html.Append($"<p>{trimmed}</p>");
                    }
                }
                else
                {
                    html.Append($"<p>{trimmed}</p>");
                }
            }

            html.Append("</div>");
            return html.ToString();
        }

        private bool IsHeader(string text)
        {
            if (string.IsNullOrEmpty(text)) return false;
            var upperCount = text.Count(char.IsUpper);
            return upperCount > text.Length * 0.7 ||
                   text.Contains("PHIẾU") ||
                   text.Contains("LƯỢC ĐỒ") ||
                   text.Contains("TƯỜNG TRÌNH");
        }

        private bool IsLabel(string text)
        {
            return text.StartsWith("-") && text.Contains(":");
        }

        private List<PdfImageData> ExtractImagesFromPage(iText.Kernel.Pdf.PdfPage page, int pageNum)
        {
            var images = new List<PdfImageData>();

            try
            {
                var resources = page.GetResources();
                var xObjects = resources.GetResource(PdfName.XObject) as PdfDictionary;

                if (xObjects != null)
                {
                    foreach (var entry in xObjects.EntrySet())
                    {
                        var xObject = entry.Value;
                        if (xObject != null && xObject.IsStream())
                        {
                            var stream = (PdfStream)xObject;
                            try
                            {
                                var imageXObject = new iText.Kernel.Pdf.Xobject.PdfImageXObject(stream);
                                byte[] imageBytes = imageXObject.GetImageBytes();

                                string mimeType = GetImageMimeType(imageXObject);

                                images.Add(new PdfImageData
                                {
                                    PageNumber = pageNum,
                                    Base64Data = Convert.ToBase64String(imageBytes),
                                    MimeType = mimeType,
                                    Position = "top-left"
                                });
                            }
                            catch
                            {
                                // bỏ qua nếu không phải image
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi trích xuất ảnh: {ex.Message}");
            }

            return images;
        }

        private string GetImageMimeType(iText.Kernel.Pdf.Xobject.PdfImageXObject imageXObject)
        {
            var stream = imageXObject.GetPdfObject();
            var filter = stream.GetAsName(PdfName.Filter);

            if (PdfName.DCTDecode.Equals(filter))
                return "image/jpeg";
            if (PdfName.FlateDecode.Equals(filter))
                return "image/png";
            if (PdfName.CCITTFaxDecode.Equals(filter))
                return "image/tiff";

            return "application/octet-stream";
        }

        private Dictionary<string, string> ParseStructuredData(string htmlContent)
        {
            var data = new Dictionary<string, string>();

            var fieldPattern = @"<span class='label'>(.*?):</span>\s*<span class='value'>(.*?)</span>";
            var matches = Regex.Matches(htmlContent, fieldPattern);

            foreach (Match match in matches)
            {
                var label = match.Groups[1].Value.Trim().Replace("- ", "");
                var value = match.Groups[2].Value.Trim();

                var fieldName = MapLabelToFieldName(label);
                if (!string.IsNullOrEmpty(fieldName))
                {
                    data[fieldName] = value;
                }
            }

            return data;
        }

        private string MapLabelToFieldName(string label)
        {
            var mapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "Họ tên người bệnh", "HoTen" },
                { "Tuổi", "Tuoi" },
                { "Giới tính", "GioiTinh" },
                { "Khoa/Phòng", "Khoa" },
                { "Buồng", "Buong" },
                { "Giường", "Giuong" },
                { "Chẩn đoán", "ChanDoan" },
                { "Trước phẫu thuật/ thủ thuật", "ChanDoanTruoc" },
                { "Sau phẫu thuật/ thủ thuật", "ChanDoanSau" },
                { "Phương pháp phẫu thuật/ thủ thuật", "PhuongPhapTTPT" }
            };

            return mapping.TryGetValue(label, out var fieldName) ? fieldName : null;
        }
    }

    public class PdfExtractionResult
    {
        public StringBuilder HtmlContent { get; set; }
        public Dictionary<string, string> StructuredData { get; set; }
        public List<PdfImageData> Images { get; set; }
    }

    public class PdfImageData
    {
        public int PageNumber { get; set; }
        public string Base64Data { get; set; }
        public string MimeType { get; set; }
        public string Position { get; set; }
    }
}
