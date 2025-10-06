using Microsoft.AspNetCore.Mvc;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using ThuThuatPhauThuat.Services.S0302;
using ThuThuatPhauThuat.Services.S0302.IS0302;

namespace ThuThuatPhauThuat.Controllers.C0302
{
    [Route("template_tuong_trinh")]
    public class C0303TemplateTTPTController : Controller
    {
        //private string _maChucNang = "/thong_tin_phau_thuat";
        //private IMemoryCachingServices _memoryCache;

        private readonly IS0303TemplateTTPT _service;
        private readonly Context0302 _localDb;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<S0303TemplateTTPT> _logger;

        public C0303TemplateTTPTController(IS0303TemplateTTPT service, Context0302 localDb, IWebHostEnvironment env, ILogger<S0303TemplateTTPT> logger /*, IMemoryCachingServices memoryCache*/)
        {
            _service = service;
            _localDb = localDb;
            _env = env;
            _logger = logger;
            //_memoryCache = memoryCache;
        }
        public async Task<IActionResult> Index()
        {
            //var quyenVaiTro = await _memoryCache.getQuyenVaiTro(_maChucNang);
            //if (quyenVaiTro == null)
            //{
            //    return RedirectToAction("NotFound", "Home");
            //}
            //ViewBag.quyenVaiTro = quyenVaiTro;
            //ViewData["Title"] = CommonServices.toEmptyData(quyenVaiTro);

            ViewBag.quyenVaiTro = new
            {
                Them = true,
                Sua = true,
                Xoa = true,
                Xuat = true,
                CaNhan = true,
                Xem = true,
            };


            return View("~/Views/V0302/V0303TemplateTTPT/Index.cshtml");
        }


        [HttpGet("khoa/all")]
        public async Task<List<M0303Khoa>> GetDSKhoa()
        {
            try
            {
                var dsKhoa = await _service.GetDSKhoa();
                return dsKhoa;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi GetDSKhoa: " + ex.Message);
                return new List<M0303Khoa>(); 
            }

        }

        [HttpGet("LayDanhSachTheoIDKhoa/{idKhoa}")]
        public async Task<IActionResult> LayDanhSachTheoIDKhoa(long idKhoa)
        {
            _logger.LogWarning($"ID khoa đang chọn là = {idKhoa}");
            try
            {
                var templates = await _service.LayDanhSachTheoIDKhoa(idKhoa);

                // Trả về JSON
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy template theo KhoaId {id}", idKhoa);
                // Trả về JSON để client có thể parse được
                return StatusCode(500, new { message = "Có lỗi xảy ra", details = ex.Message });
            }
        }

        [HttpGet("LayTatCaDanhSach")]
        public async Task<IActionResult> LayTatCaDanhSach()
        {
            try
            {
                var templates = await _service.LayTatCaDanhSach();

                // Trả về JSON
                return Ok(templates);
            }
            catch (Exception ex)
            {
                // Trả về JSON để client có thể parse được
                return StatusCode(500, new { message = "Có lỗi xảy ra", details = ex.Message });
            }
        }

        [HttpGet("LayChiTietTheoID/{id}")]
        public async Task<IActionResult> LayChiTietTheoID(long id)
        {
            try
            {
                var templates = await _service.LayChiTietTheoID(id);

                // Trả về JSON
                return Ok(templates);
            }
            catch (Exception ex)
            {
                // Trả về JSON để client có thể parse được
                return StatusCode(500, new { message = "Có lỗi xảy ra", details = ex.Message });
            }
        }

        [HttpPost("CapNhat")]
        public async Task<IActionResult> CapNhat([FromBody] M0303TemplateTTPT model)
        {
            if (model == null || model.ID <= 0)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            _logger.LogInformation("CapNhat input: ID={id}, Ten={ten}, NoiDung={nd}",
                model.ID, model.Ten, model.NoiDung);

            var updated = await _service.CapNhatTemplateTTPT(model);

            if (updated == null)
                return StatusCode(500, new { message = "Cập nhật thất bại" });

            return Ok(updated);
        }
        [HttpPost]
        [Route("Create")]
        public async Task<IActionResult> Create([FromBody] M0303TemplateTTPT model)
        {
            if (ModelState.IsValid)
            {
                _localDb.M0303TemplateTTPT.Add(model);
                await _localDb.SaveChangesAsync();

                return Ok(model); // Trả về model không cần success: true nếu status là 200 OK
            }

            // ✅ THÊM LOG ĐỂ IN RA LỖI CHI TIẾT
            var errors = ModelState.Values.SelectMany(v => v.Errors)
                                         .Select(e => e.ErrorMessage);

            foreach (var error in errors)
            {
                _logger.LogError("Validation Error: {Error}", error);
            }
            // ✅ END LOG

            return BadRequest(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
        }

    }
}
