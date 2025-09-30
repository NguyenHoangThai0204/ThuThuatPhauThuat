using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using ThuThuatPhauThuat.Service.S0302.IS0302;

namespace ThuThuatPhauThuat.Controllers.C0302
{
    [Route("thu_thuat_phau_thuat")]
    public class C0302ThuThuatPhauThuatHomeController : Controller
    {
        //private string _maChucNang = "/thu_thuat_phau_thuat";
        //private IMemoryCachingServices _memoryCache;

        private readonly IS0302ThuThuatPhauThuatInterface _service;
        private readonly Context0302 _context;
        private readonly ILogger<C0302ThuThuatPhauThuatHomeController> _logger;

        public C0302ThuThuatPhauThuatHomeController(IS0302ThuThuatPhauThuatInterface service, Context0302 context, ILogger<C0302ThuThuatPhauThuatHomeController> logger /*, IMemoryCachingServices memoryCache*/)
        {
            _service = service;
            _context = context;
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


            return View("~/Views/V0302/V0302ThuThuatPhauThuat/Index.cshtml");
        }

        [HttpGet("thong_tin_so_phieu")]
        public IActionResult ThongTinSoPhieu(int tabIndex)
        {
            ViewBag.TabIndex = tabIndex;
            return PartialView("_ThongTinSoPhieu");
        }

        [HttpGet("danh_sach")]
        public async Task<IActionResult> Home()
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
            return PartialView("~/Views/V0302/V0302ThuThuatPhauThuat/V0302DanhSachThuThuatPhauThuat.cshtml");
        }
        [HttpGet("get_thong_tin_chi_tiet")]
        public async Task<IActionResult> GetThongTinChiTiet(long idVaoVien, long idChiNhanh, long soPhieu)
        {
            try
            {
                // Sử dụng stored procedure chuyên cho chi tiết
                var parameters = new[]
                {
                    new SqlParameter("@IdVaoVien", idVaoVien),
                    new SqlParameter("@IdChiNhanh", idChiNhanh),
                    new SqlParameter("@SoPhieu", soPhieu)

                };

                var sql = @"EXEC S0302_GetThongTinThuThuatPhauThuat @IdVaoVien, @IdChiNhanh,@SoPhieu ";

                var data = await _context.M0302PhieuThuThuatPhauThuatModels
                     .FromSqlRaw(sql, parameters)
                     .AsNoTracking()
                     .ToListAsync();

                var record = data.FirstOrDefault();

                return Ok(new
                {
                    success = true,
                    data = record
                });

            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
        [HttpPost("loc_danh_sach")]
        public async Task<IActionResult> LocDanhSach(
            long IdChiNhanh,
            string Ngay,
            long IdPhongBuong,
            int TrangThai,
            // Thêm các tham số tìm kiếm nâng cao (có thể null)
            string MaVaoVien = null,
            string MaBenhNhan = null,
            string TenBenhNhan = null,
            string CCCD = null,
            string MaThe = null,
            string SoDienThoai = null)
        {
            var (success, message, data) = await _service.LocDanhSachAsync(
                IdChiNhanh, Ngay, IdPhongBuong, TrangThai,
                MaVaoVien, MaBenhNhan, TenBenhNhan, CCCD, MaThe, SoDienThoai);

            if (!success)
                return Json(new { Success = false, Message = message, Data = new List<object>() });

            return Json(new { Success = true, Message = message, Data = data });
        }
      

        [HttpGet("thong_tin")]
        public IActionResult ThongTin(long? idVaoVien, int tabIndex = 0)
        {
            //var quyenVaiTro = await _memoryCache.getQuyenVaiTro(_maChucNang);
            //if (quyenVaiTro == null)
            //{
            //    return RedirectToAction("NotFound", "Home");
            //}
            //ViewBag.quyenVaiTro = quyenVaiTro;
            //ViewData["Title"] = CommonServices.toEmptyData(quyenVaiTro);

            ViewBag.IdVaoVien = idVaoVien;
            ViewBag.TabIndex = tabIndex;
            ViewBag.quyenVaiTro = new
            {
                Them = true,
                Sua = true,
                Xoa = true,
                Xuat = true,
                CaNhan = true,
                Xem = true,
            };

            return PartialView("~/Views/V0302/V0302ThuThuatPhauThuat/V0302ThongTinThuThuatPhauThuat.cshtml");
        }
        [HttpGet("trinh_tu")]
        public async Task<IActionResult> TrinhTuVaKetLuan(long? idVaoVien, int tabIndex = 0)
        {

            //var quyenVaiTro = await _memoryCache.getQuyenVaiTro(_maChucNang);
            //if (quyenVaiTro == null)
            //{
            //    return RedirectToAction("NotFound", "Home");
            //}
            //ViewBag.quyenVaiTro = quyenVaiTro;
            //ViewData["Title"] = CommonServices.toEmptyData(quyenVaiTro);

            ViewBag.IdVaoVien = idVaoVien;
            ViewBag.TabIndex = tabIndex;
            ViewBag.quyenVaiTro = new
            {
                Them = true,
                Sua = true,
                Xoa = true,
                Xuat = true,
                CaNhan = true,
                Xem = true,
            };
            return PartialView("~/Views/V0302/V0302ThuThuatPhauThuat/V0302TrinhTuVaKeLuanTTPT.cshtml");
        }

        [HttpGet("ekip")]
        public async Task<IActionResult> EkipThucHien(long? idVaoVien, int tabIndex = 0)
        {
            //var quyenVaiTro = await _memoryCache.getQuyenVaiTro(_maChucNang);
            //if (quyenVaiTro == null)
            //{
            //    return RedirectToAction("NotFound", "Home");
            //}
            //ViewBag.quyenVaiTro = quyenVaiTro;
            //ViewData["Title"] = CommonServices.toEmptyData(quyenVaiTro);

            ViewBag.IdVaoVien = idVaoVien;
            ViewBag.TabIndex = tabIndex;
            ViewBag.quyenVaiTro = new
            {
                Them = true,
                Sua = true,
                Xoa = true,
                Xuat = true,
                CaNhan = true,
                Xem = true,
            };
            return PartialView("~/Views/V0302/V0302ThuThuatPhauThuat/V0302EkipThucHienTTPT.cshtml");
        }
        [HttpPost]
        [Route("ekip/create")]
        public IActionResult CreateEkip([FromBody] List<EkipRequest> ekipList)
        {
            if (ekipList == null || ekipList.Count == 0)
            {
                return BadRequest(new { success = false, message = "Danh sách ekip rỗng, không có dữ liệu để lưu." });
            }

            // --- BƯỚC 1: CHUYỂN ĐỔI LIST SANG DATATABLE CHO TVP ---
            var dt = new DataTable();
            // Tên cột phải khớp chính xác với Type Table 'udt_EkipThucHien' trong SQL Server
            dt.Columns.Add("IDPhieuTTPT", typeof(long));
            dt.Columns.Add("IDNhanVien", typeof(long));
            dt.Columns.Add("TenVaiTro", typeof(string));
            dt.Columns.Add("GhiChu", typeof(string));

            foreach (var item in ekipList)
            {
                dt.Rows.Add(item.IDPhieuTTPT, item.IDNhanVien, item.TenVaiTro, item.GhiChu);
            }

            // --- BƯỚC 2: TẠO THAM SỐ SQL TVP ---
            var tvpParam = new SqlParameter("@EkipData", dt)
            {
                SqlDbType = SqlDbType.Structured,
                TypeName = "dbo.T0301_EkipThucHien" // Phải khớp với tên Type Table SQL
            };

            try
            {
                var sql = "EXEC dbo.S0301_ThemEkipThucHien @EkipData";

                // --- BƯỚC 3: GỌI STORED PROCEDURE VÀ ĐỌC KẾT QUẢ ---
                // _context.DoiNguEkip là DbSet<M0301DoiNguEkip> đã được cấu hình HasNoKey()
                var result = _context.EkipResult
                                     .FromSqlRaw(sql, tvpParam)
                                     .AsEnumerable()
                                     .FirstOrDefault();

                if (result == null)
                {
                    return StatusCode(500, new { success = false, message = "Store Procedure đã thực thi nhưng không trả về kết quả (SELECT Result, Message)." });
                }

                // Xử lý kết quả trả về
                if (result.Result == 1) // Thành công
                {
                    return Ok(new { success = true, message = result.Message });
                }
                else // Lỗi từ Store Procedure (Result = -1)
                {
                    return StatusCode(500, new { success = false, message = result.Message });
                }
            }
            catch (Exception ex)
            {
                // Xử lý lỗi kết nối, lỗi SQL syntax, hoặc lỗi khác trong quá trình thực thi
                return StatusCode(500, new { success = false, message = $"Lỗi Server: Không thể thực thi Store Procedure. Chi tiết: {ex.Message}" });
            }
        }
        [HttpGet]
        [Route("ekip/list-by-idttpt/{idPhieuTTPT}")]
        public async Task<IActionResult> GetEkipByPhieuId(long idPhieuTTPT)
        {
            try
            {
                if (idPhieuTTPT <= 0)
                {
                    return BadRequest(new { success = false, message = "ID Phiếu không hợp lệ." });
                }

                var sql = "EXEC dbo.S0301_DocEkipThucHien @IDPhieuTTPT";
                var idParam = new SqlParameter("@IDPhieuTTPT", idPhieuTTPT);

                var ekipList = await _context.DoiNguEkip
                                             .FromSqlRaw(sql, idParam)
                                             .ToListAsync();

                if (ekipList == null || ekipList.Count == 0)
                {
                    // --- SỬA LỖI: Trả về 200 OK với mảng data rỗng
                    return Ok(new
                    {
                        success = true,
                        message = "Không tìm thấy ekip nào cho phiếu này.",
                        data = new List<object>() // Quan trọng: trả về mảng rỗng
                    });
                }

                _logger.LogWarning($"Sucess : {ekipList}");

                return Ok(new { success = true, data = ekipList });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi Server: Không thể đọc dữ liệu ekip. Chi tiết: {ex.Message}" });
            }
        }
        public class EkipRequest
        {
            public long IDPhieuTTPT { get; set; }
            public long IDNhanVien { get; set; }
            public string TenVaiTro { get; set; }
            public string GhiChu { get; set; }
        }
        public class EkipResult
        {
            public int Result { get; set; }
            public string Message { get; set; }
        }


        [HttpGet("ghi_nhan_thuoc_vat_tu")]
        public async Task<IActionResult> GhiNhanThuocVatTu(long? idVaoVien, int tabIndex = 0)
        {
            //var quyenVaiTro = await _memoryCache.getQuyenVaiTro(_maChucNang);
            //if (quyenVaiTro == null)
            //{
            //    return RedirectToAction("NotFound", "Home");
            //}
            //ViewBag.quyenVaiTro = quyenVaiTro;
            //ViewData["Title"] = CommonServices.toEmptyData(quyenVaiTro);

            ViewBag.IdVaoVien = idVaoVien;
            ViewBag.TabIndex = tabIndex;
            ViewBag.quyenVaiTro = new
            {
                Them = true,
                Sua = true,
                Xoa = true,
                Xuat = true,
                CaNhan = true,
                Xem = true,
            };
            return PartialView("~/Views/V0302/V0302ThuThuatPhauThuat/V0302GhiNhanVatTuTTPT.cshtml");
        }

    }
}
