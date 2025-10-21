using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;


[Route("CheDoThuThuat")]
public class C0301CheDoThuThuatController : Controller
{
    private readonly Context0302 _context;

    public C0301CheDoThuThuatController(Context0302 context)
    {
        _context = context;
    }

    // Route: /CheDoThuThuat/List
    [HttpGet]
    [Route("List")]
    public async Task<IActionResult> List()
    {
        try
        {
            var data = await _context.CheDoThuThuat
                                     .ToListAsync();

            return Json(data);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Lỗi Database: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Lỗi nội bộ server khi truy vấn DB.", details = ex.Message });
        }
    }

    // Route: /CheDoThuThuat/Create
    [HttpPost]
    [Route("Create")] // Định tuyến rõ ràng
    public async Task<IActionResult> Create([FromBody] M0301CheDoThuThuat model)
    {
        if (ModelState.IsValid)
        {
            model.Active = true;
            _context.CheDoThuThuat.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = model });
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }


    // Route: /CheDoThuThuat/Update/{id}
    [HttpPut] 
    [Route("Update/{id}")]
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
    // Route: /CheDoThuThuat/UpdateTrangThai/{id}
    [HttpPut]
    [Route("UpdateTrangThai/{id}")]
    public async Task<IActionResult> UpdateTrangThai(int id)
    {
        var modelToUpdate = await _context.CheDoThuThuat.FindAsync((long)id);

        if (modelToUpdate == null)
        {
            return NotFound(new { success = false, message = $"Không tìm thấy Tai biến/Biến chứng có ID={id}." });
        }

        try
        {
            modelToUpdate.Active = false;

            _context.Update(modelToUpdate);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = modelToUpdate });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Lỗi server khi cập nhật trạng thái.", error = ex.Message });
        }
    }
}