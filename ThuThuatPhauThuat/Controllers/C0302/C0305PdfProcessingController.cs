using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Services.S0305;

namespace ThuThuatPhauThuat.Controllers.C0302
{
    [Route("api/pdf")]
    [ApiController]
    public class C0305PdfProcessingController : ControllerBase
    {
        private readonly S0305PdfExtractionService _pdfService;
        private readonly Context0302 _context;

        public C0305PdfProcessingController(S0305PdfExtractionService pdfService, Context0302 context)
        {
            _pdfService = pdfService;
            _context = context;
        }

        //[HttpPost("extract")]
        //public async Task<IActionResult> ExtractPdfData(IFormFile pdfFile, [FromQuery] long idPhieuTTPT)
        //{
        //    if (pdfFile == null || pdfFile.Length == 0)
        //        return BadRequest(new { success = false, message = "File PDF không hợp lệ" });

        //    if (Path.GetExtension(pdfFile.FileName).ToLower() != ".pdf")
        //        return BadRequest(new { success = false, message = "Chỉ chấp nhận file PDF" });

        //    try
        //    {
        //        using var stream = pdfFile.OpenReadStream();
        //        var extractedData = _pdfService.ExtractStructuredDataFromPdf(stream);

        //        // Lưu dữ liệu vào database
        //        await SaveExtractedDataToDatabase(extractedData, idPhieuTTPT);

        //        return Ok(new
        //        {
        //            success = true,
        //            data = extractedData,
        //            message = "Trích xuất PDF thành công"
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { success = false, message = ex.Message });
        //    }
        //}

        //private async Task SaveExtractedDataToDatabase(Dictionary<string, string> data, long idPhieuTTPT)
        //{
        //    // Cập nhật thông tin vào bảng trình tự
        //    var trinhTuRecord = await _context.TrinhTuVaKetLuan
        //        .FirstOrDefaultAsync(t => t.IDPhieuTTPT == idPhieuTTPT);

        //    if (trinhTuRecord != null)
        //    {
        //        // Chỉ cập nhật các trường được phép (lược đồ, tường trình)
        //        var luocDoContent = data.ContainsKey("LuocDoSection") ? "Đã import lược đồ từ PDF" : "";
        //        var tuongTrinhContent = data.ContainsKey("TuongTrinhSection") ? "Đã import tường trình từ PDF" : "";

        //        // Kết hợp với nội dung hiện tại (nếu có)
        //        trinhTuRecord.TrinhTu = $"{trinhTuRecord.TrinhTu}\n\n--- IMPORT TỪ PDF ---\n{tuongTrinhContent}";
        //        trinhTuRecord.KetLuan = $"{trinhTuRecord.KetLuan}\n\n--- IMPORT TỪ PDF ---\n{luocDoContent}";

        //        await _context.SaveChangesAsync();
        //    }
        //}

        [HttpPost("extract-formatted")]
        public async Task<IActionResult> ExtractFormattedPdf(IFormFile pdfFile, [FromQuery] long idPhieuTTPT)
        {
            if (pdfFile == null || pdfFile.Length == 0)
                return BadRequest(new { success = false, message = "File PDF không hợp lệ" });

            try
            {
                using var stream = pdfFile.OpenReadStream();
                var result = await _pdfService.ExtractFormattedContentFromPdf(stream);

                // Lưu ảnh từ PDF lên FTP
                var uploadedImages = new List<object>();
                foreach (var image in result.Images)
                {
                    var imageBytes = Convert.FromBase64String(image.Base64Data);
                    var fileName = $"pdf_img_page{image.PageNumber}_{Guid.NewGuid()}.jpg";

                    // TODO: Upload lên FTP và lưu vào DB
                    // var ftpUrl = await UploadImageToFtp(imageBytes, fileName, idPhieuTTPT);

                    uploadedImages.Add(new
                    {
                        page = image.PageNumber,
                        position = image.Position,
                        // url = ftpUrl
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        htmlContent = result.HtmlContent.ToString(),
                        structuredData = result.StructuredData,
                        images = uploadedImages
                    },
                    message = "Trích xuất PDF với định dạng thành công"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
