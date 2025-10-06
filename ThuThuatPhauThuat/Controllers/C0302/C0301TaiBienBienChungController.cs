using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

// Sử dụng tên rút gọn của Controller cho Base Route
[Route("TaiBienBienChung")]
public class C0301TaiBienBienChungController : Controller // <-- Kế thừa Controller (MVC)
{
    private readonly Context0302 _context;

    public C0301TaiBienBienChungController(Context0302 context)
    {
        _context = context;
    }

    // --- 1. LẤY DANH SÁCH (READ) ---
    // Route: /TaiBienBienChung/List
    [HttpGet]
    [Route("List")] // Định tuyến rõ ràng
    public async Task<IActionResult> List() // Trả về IActionResult
    {
        var data = await _context.TaiBienBienChung
                                 .OrderBy(c => c.Ma) // Sắp xếp theo mã nếu có field 'Ma'
                                 .ToListAsync();

        // Trả về dữ liệu dưới dạng JSON
        return Json(data);
    }

    // --- 2. TẠO MỚI (CREATE) ---
    // Route: /TaiBienBienChung/Create
    [HttpPost]
    [Route("Create")] // Định tuyến rõ ràng
    // Sử dụng [FromBody] để nhận JSON từ JavaScript
    public async Task<IActionResult> Create([FromBody] M0301TaiBienBienChung model)
    {
        if (ModelState.IsValid)
        {
            _context.TaiBienBienChung.Add(model);
            await _context.SaveChangesAsync();
            var result = new
            {
                Id = model.ID, // Lấy ID đã được gán
                Ten = model.Ten,
                Ma = model.Ma,
                Active = model.Active,
            };
            // Trả về HTTP 200 OK với đối tượng đã tạo
            return Ok(new { success = true, data = result });
        }

        // Trả về lỗi 400 Bad Request
        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }


    // --- 3. CẬP NHẬT (UPDATE) ---
    // Route: /TaiBienBienChung/Update/{id}
    [HttpPut] // Sử dụng PUT
    [Route("Update/{id}")] // Định tuyến rõ ràng với tham số ID
    public async Task<IActionResult> Update(int id, [FromBody] M0301TaiBienBienChung model)
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
                if (_context.TaiBienBienChung.Find(id) == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy đối tượng có ID={id}." });
                }
                throw;
            }
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }

    // --- 4. CHI TIẾT (DETAILS) ---
    // Route: /TaiBienBienChung/{id}
    // Chuyển từ Details API sang Details MVC (trả về JSON)
    [HttpGet]
    [Route("{id}")]
    public async Task<IActionResult> Details(int id)
    {
        var item = await _context.TaiBienBienChung.FindAsync(id);
        if (item == null) return NotFound();
        return Json(item);
    }
}