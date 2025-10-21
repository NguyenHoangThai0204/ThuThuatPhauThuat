using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302;


namespace ThuThuatPhauThuat.Controllers.C0302
{
    [Route("NguonBenhTTPT")]
    public class C0302NguonBenhTTPTController : Controller
    {

        private readonly Context0302 _context;

        public C0302NguonBenhTTPTController(Context0302 context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("List")]
        public async Task<IActionResult> List()
        {
            try
            {

                // Thử lấy dữ liệu
                var data = await _context.NguonBenhTTPT
                                         .ToListAsync();

                // Nếu không có lỗi, trả về JSON
                return Json(data);
            }
            catch (Exception ex)
            {
                // In lỗi ra console/log/debug và trả về lỗi 500 rõ ràng
                System.Diagnostics.Debug.WriteLine($"Lỗi Database: {ex.Message}");
                // Trả về lỗi 500 kèm thông báo nội bộ
                return StatusCode(500, new { success = false, message = "Lỗi nội bộ server khi truy vấn DB.", details = ex.Message });
            }
        }
    }
}
