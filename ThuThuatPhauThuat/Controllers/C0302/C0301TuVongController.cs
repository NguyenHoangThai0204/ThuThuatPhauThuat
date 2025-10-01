using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using System.Collections.Generic;
using System.Threading.Tasks;

// Giữ nguyên Route cơ sở cho Controller
[Route("TuVong")]
public class C0301TuVongController : Controller
{
    private readonly Context0302 _context;
    private readonly ILogger<C0301TuVongController> _logger;
    public C0301TuVongController(Context0302 context, ILogger<C0301TuVongController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // Route: /TuVong/List
    // Dùng tên List thay vì Index để tránh xung đột với route mặc định của MVC
    [HttpGet]
    [Route("List")]
    public async Task<IActionResult> List()
    {
        try
        {
            var data = await _context.TuVong.ToListAsync();
            return Json(data);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Lỗi Database: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Lỗi nội bộ server khi truy vấn DB.", details = ex.Message });
        }
    }

    // Route: /TuVong/Create
    [HttpPost]
    [Route("Create")] 
    public async Task<IActionResult> Create([FromBody] M0301TuVong model)
    {
        _logger.LogWarning($"Save tu vong: {ModelState.IsValid}");
        if (ModelState.IsValid)
        {
            _context.TuVong.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = model });
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }


    // Route: /TuVong/Update/{id}
    [HttpPut]
    [Route("Update/{id}")] 
    public async Task<IActionResult> Update(int id, [FromBody] M0301TuVong model)
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
                if (_context.TuVong.Find(id) == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy đối tượng có ID={id}." });
                }
                throw;
            }
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }
}