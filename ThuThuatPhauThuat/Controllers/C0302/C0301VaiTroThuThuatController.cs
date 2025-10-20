using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;


[Route("VaiTroThuThuat")]
public class C0301VaiTroThuThuatController : Controller
{
    private readonly Context0302 _context;

    public C0301VaiTroThuThuatController(Context0302 context)
    {
        _context = context;
    }

    [Table("DM_VaiTroTTPT")]
    public class M0301VaiTroThuThuat
    {
        public long ID { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int MaVaiTroTTPT { get; set; }
        public bool Active { get; set; }
        public bool BSChinh { get; set; }
    }
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }

    // GET: /VaiTroThuThuat/List
    [HttpGet("List")]
    public async Task<IActionResult> List([FromQuery] string? searchTerm, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
    {
        try
        {
            IQueryable<M0301VaiTroThuThuat> query = _context.VaiTroThuThuat
                                                            .Where(v => v.Active)
                                                            .OrderByDescending(v => v.ID);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(v => v.Ma.Contains(searchTerm) || v.Ten.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();

            var pagedData = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize) 
                .ToListAsync();

            var result = new PagedResult<M0301VaiTroThuThuat>
            {
                Items = pagedData,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Lỗi server khi truy vấn DB.", details = ex.Message });
        }
    }

    // Route: /VaiTroThuThuat/Create
    [HttpPost]
    [Route("Create")] // Định tuyến rõ ràng
    public async Task<IActionResult> Create([FromBody] M0301VaiTroThuThuat model)
    {
        if (ModelState.IsValid)
        {
            model.Active = true;
            _context.VaiTroThuThuat.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = model });
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }


    // Route: /VaiTroThuThuat/Update/{id}
    [HttpPost] 
    [Route("Update/{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] M0301VaiTroThuThuat model)
    {
        if (id != model.ID)
        {
            return NotFound(new { success = false, message = "ID không khớp." });
        }

        if (ModelState.IsValid)
        {
            try
            {
                model.Active = true;
                _context.Update(model);
                await _context.SaveChangesAsync();

                // Trả về HTTP 200 OK
                return Ok(new { success = true, data = model });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (_context.VaiTroThuThuat.Find(id) == null)
                {
                    return NotFound(new { success = false, message = $"Không tìm thấy đối tượng có ID={id}." });
                }
                throw;
            }
        }

        return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors) });
    }
    // Route: /VaiTroThuThuat/UpdateTrangThai/{id}
    [HttpPost]
    [Route("UpdateTrangThai/{id}")]
    public async Task<IActionResult> UpdateTrangThai(int id)
    {
        var modelToUpdate = await _context.VaiTroThuThuat.FindAsync((long)id);

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