using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

// Sử dụng tên rút gọn của Controller cho Base Route
// Base Route: /ViTriThucHien
[Route("ViTriThucHien")]
public class C0301ViTriThucHienController : Controller // <-- Kế thừa Controller (MVC)
{
    private readonly Context0302 _context;

    public C0301ViTriThucHienController(Context0302 context)
    {
        _context = context;
    }

    // -----------------------------------------------------
    // --- 1. LẤY DANH SÁCH (READ) ---
    // Route: GET /ViTriThucHien/List
    [HttpGet]
    [Route("List")] // Đã đồng bộ tên Action thành List
    public async Task<IActionResult> List() // Trả về IActionResult
    {
        var data = await _context.ViTriThucHien
                                 .ToListAsync();

        // Trả về dữ liệu dưới dạng JSON
        return Json(data);
    }

    // -----------------------------------------------------
    // --- 2. TẠO MỚI (CREATE) ---
    // Route: POST /ViTriThucHien/Create
    [HttpPost]
    [Route("Create")]
    public async Task<IActionResult> Create([FromBody] M0301ViTriThucHienTTPT model)
    {
        if (ModelState.IsValid)
        {
            _context.ViTriThucHien.Add(model);
            await _context.SaveChangesAsync();

            // Trả về HTTP 200 OK với đối tượng đã tạo
            return Ok(new { success = true, data = model });
        }

        // Trả về lỗi 400 Bad Request
        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }

    // -----------------------------------------------------
    // --- 3. CẬP NHẬT (UPDATE) ---
    // Route: PUT /ViTriThucHien/Update/{id}
    [HttpPut]
    [Route("Update/{id}")]
    // SỬA LỖI: Dùng M0301ViTriThucHienTTPT và kiểu dữ liệu ID (int/long) phải khớp
    public async Task<IActionResult> Update(int id, [FromBody] M0301ViTriThucHienTTPT model)
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

                return Ok(new { success = true, data = model });
            }
            catch (DbUpdateConcurrencyException)
            {
                // SỬA LỖI: Dùng DbSet ViTriThucHien
                if (_context.ViTriThucHien.Find(id) == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy đối tượng có ID={id}." });
                }
                throw;
            }
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }

    // -----------------------------------------------------
    // --- 4. CHI TIẾT (DETAILS) ---
    // Route: GET /ViTriThucHien/{id}
    [HttpGet]
    [Route("{id}")]
    // SỬA LỖI: Dùng M0301ViTriThucHienTTPT và kiểu dữ liệu ID
    public async Task<IActionResult> Details(int id)
    {
        // SỬA LỖI: Dùng DbSet ViTriThucHien
        var item = await _context.ViTriThucHien.FindAsync(id);
        if (item == null) return NotFound();
        return Json(item);
    }
}