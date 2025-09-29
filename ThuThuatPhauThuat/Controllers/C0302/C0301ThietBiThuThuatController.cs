using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

// Sử dụng tên rút gọn của Controller cho Base Route
[Route("ThietBiThuThuat")]
public class C0301ThietBiThuThuatController : Controller // <-- Kế thừa Controller (MVC)
{
    private readonly Context0302 _context;

    public C0301ThietBiThuThuatController(Context0302 context)
    {
        _context = context;
    }

    // --- 1. LẤY DANH SÁCH (READ) ---
    // Route: /ThietBiThuThuat/List
    [HttpGet]
    [Route("List")] // Đã đổi tên Action thành List và định tuyến rõ ràng
    public async Task<IActionResult> List() // Trả về IActionResult
    {
        var data = await _context.ThietBi
                                 // Có thể thêm OrderBy để đảm bảo thứ tự
                                 // .OrderBy(c => c.Ma) 
                                 .ToListAsync();

        // Trả về dữ liệu dưới dạng JSON
        return Json(data);
    }

    // --- 2. TẠO MỚI (CREATE) ---
    // Route: POST /ThietBiThuThuat/Create
    [HttpPost]
    [Route("Create")] // Định tuyến rõ ràng
    // Sử dụng [FromBody] để nhận JSON từ JavaScript
    public async Task<IActionResult> Create([FromBody] M0301ThietBiTTPT model)
    {
        if (ModelState.IsValid)
        {
            _context.ThietBi.Add(model);
            await _context.SaveChangesAsync();

            // Trả về HTTP 200 OK với đối tượng đã tạo
            return Ok(new { success = true, data = model });
        }

        // Trả về lỗi 400 Bad Request
        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }


    // --- 3. CẬP NHẬT (UPDATE) ---
    // Route: PUT /ThietBiThuThuat/Update/{id}
    [HttpPut] // Sử dụng PUT
    [Route("Update/{id}")] // Định tuyến rõ ràng với tham số ID
    public async Task<IActionResult> Update(int id, [FromBody] M0301ThietBiTTPT model)
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
                if (_context.ThietBi.Find(id) == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy đối tượng có ID={id}." });
                }
                throw;
            }
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }

    // --- 4. CHI TIẾT (DETAILS) ---
    // Route: GET /ThietBiThuThuat/{id}
    [HttpGet]
    [Route("{id}")]
    public async Task<IActionResult> Details(int id)
    {
        var item = await _context.ThietBi.FindAsync(id);
        if (item == null) return NotFound();
        // Trả về JSON cho chi tiết
        return Json(item);
    }
}