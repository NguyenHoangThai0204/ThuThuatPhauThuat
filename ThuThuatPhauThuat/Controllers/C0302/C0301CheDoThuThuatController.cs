using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using System.Collections.Generic;
using System.Threading.Tasks;

// Giữ nguyên Route cơ sở cho Controller
[Route("CheDoThuThuat")]
public class C0301CheDoThuThuatController : Controller
{
    private readonly Context0302 _context;

    public C0301CheDoThuThuatController(Context0302 context)
    {
        _context = context;
    }

    // --- 1. LẤY DANH SÁCH (READ) ---
    // Route: /CheDoThuThuat/List
    // Dùng tên List thay vì Index để tránh xung đột với route mặc định của MVC
    [HttpGet]
    [Route("List")]
    public async Task<IActionResult> List()
    {
        try
        {
            // Thử lấy dữ liệu
            var data = await _context.CheDoThuThuat
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

    // --- 2. TẠO MỚI (CREATE) ---
    // Route: /CheDoThuThuat/Create
    [HttpPost]
    [Route("Create")] // Định tuyến rõ ràng
    // Lưu ý: [FromBody] là cần thiết nếu bạn gửi JSON từ JS
    public async Task<IActionResult> Create([FromBody] M0301CheDoThuThuat model)
    {
        if (ModelState.IsValid)
        {
            _context.CheDoThuThuat.Add(model);
            await _context.SaveChangesAsync();

            // Trả về HTTP 201 Created hoặc HTTP 200 OK với đối tượng đã tạo
            return Ok(new { success = true, data = model });
        }

        // Trả về lỗi Validation dưới dạng JSON (HTTP 400 Bad Request)
        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }


    // --- 3. CẬP NHẬT (UPDATE) ---
    // Route: /CheDoThuThuat/Update/{id}
    [HttpPut] // Nên dùng PUT cho Update trong API
    [Route("Update/{id}")] // Định tuyến rõ ràng
    public async Task<IActionResult> Update(int id, [FromBody] M0301CheDoThuThuat model)
    {
        if (id != model.ID)
        {
            return NotFound(new { success = false, message = "ID không khớp." });
        }

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(model);
                await _context.SaveChangesAsync();

                // Trả về HTTP 200 OK
                return Ok(new { success = true, data = model });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (_context.CheDoThuThuat.Find(id) == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy đối tượng có ID={id}." });
                }
                throw;
            }
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }
}