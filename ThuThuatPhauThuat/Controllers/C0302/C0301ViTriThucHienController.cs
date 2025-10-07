using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

[Route("ViTriThucHien")]
public class C0301ViTriThucHienController : Controller 
{
    private readonly Context0302 _context;

    public C0301ViTriThucHienController(Context0302 context)
    {
        _context = context;
    }

    // Route: GET /ViTriThucHien/List
    [HttpGet]
    [Route("List")] 
    public async Task<IActionResult> List() 
    {
        var data = await _context.ViTriThucHien
                                 .ToListAsync();

        // Trả về dữ liệu dưới dạng JSON
        return Json(data);
    }

    // -----------------------------------------------------
    // Route: POST /ViTriThucHien/Create
    [HttpPost]
    [Route("Create")]
    public async Task<IActionResult> Create([FromBody] M0301ViTriThucHienTTPT model)
    {
        if (ModelState.IsValid)
        {
            model.Active = true;
            _context.ViTriThucHien.Add(model);
            await _context.SaveChangesAsync();

            // Trả về HTTP 200 OK với đối tượng đã tạo
            return Ok(new { success = true, data = model });
        }

        // Trả về lỗi 400 Bad Request
        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }

    // -----------------------------------------------------
    // Route: PUT /ViTriThucHien/Update/{id}
    [HttpPut]
    [Route("Update/{id}")]
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
                if (_context.ViTriThucHien.Find(id) == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy đối tượng có ID={id}." });
                }
                throw;
            }
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }

    // Route: GET /ViTriThucHien/{id}
    [HttpGet]
    [Route("{id}")]
    public async Task<IActionResult> Details(int id)
    {
        var item = await _context.ViTriThucHien.FindAsync(id);
        if (item == null) return NotFound();
        return Json(item);
    }
    [HttpPut]
    [Route("UpdateTrangThai/{id}")]
    public async Task<IActionResult> UpdateTrangThai(int id)
    {
        var modelToUpdate = await _context.ViTriThucHien.FindAsync((long)id);

        if (modelToUpdate == null)
        {
            return NotFound(new { success = false, message = $"Không tìm thấy đối tượng có ID={id}." });
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