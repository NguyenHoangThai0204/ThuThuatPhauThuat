using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using ThuThuatPhauThuat.Services.S0302.IS0302;

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

        public IActionResult Index()
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
        //[HttpPost("loc_danh_sach")]
        //public async Task<IActionResult> LocDanhSach(long IdChiNhanh, string Ngay, long IdPhongBuong, int TrangThai)
        //{
        //    var (success, message, data) = await _service.LocDanhSachAsync(IdChiNhanh, Ngay, IdPhongBuong, TrangThai);
        //    if (!success)
        //        return Json(new { Success = false, Message = message, Data = new List<object>() });

        //    // Trả về đúng cấu trúc object
        //    return Json(new { Success = true, Message = message, Data = data });
        //}
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
        public async Task<IActionResult> ThongTin()
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
            return PartialView("~/Views/V0302/V0302ThuThuatPhauThuat/V0302ThongTinThuThuatPhauThuat.cshtml");
        }

        [HttpPost("thong-tin/save-thong-tin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SaveThongTin([FromBody] M0302ThongTinThuThuatPhauThuatModel model)
        {
            if (model == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu gửi lên không hợp lệ." });
            }

            try
            {
                // Cần phải parse các trường string (từ FE) sang kiểu số (BIGINT trong SP)
                long.TryParse(model.IDTaiBienBienChung, out long idTaiBien);
                long.TryParse(model.IDTuVong, out long idTuVong);
                // Giả sử IDViTriThucHien cũng cần parse
                long.TryParse(model.IDViTriThucHien, out long idViTriThucHien);

                // Tạo câu lệnh SQL gọi Stored Procedure, truyền các tham số
                // @p0, @p1, ... là các placeholder cho tham số, EF Core sẽ tự động ánh xạ
                string sqlQuery = @"EXEC S0301_ThemThongTinTTPT 
            @IDPhieuTTPT, @MaChanDoanVao, @TenChanDoanVao, @MaChanDoanTruoc, @TenChanDoanTruoc, @MaChanDoanSau, @TenChanDoanSau,
            @IDPhongThucHien, @IDLoaiTTPT, @IDThietBi, @IDTaiBienBienChung, @IDCheDoThuThuat, @CanThiepThuThuat, @SoLanMoLai, 
            @LyDoMoLai, @IDViTriThucHien, @IDTuVong, @DanLuu, @NgayRutOngDanLuu, @NgayCatChi, @Khac,
            @MaFNA, @TienCan, @KetQuaXNFNAGBP, @ChiDinhViTriTonThuongFNA, @YeuCauXetNghiem, @PhuongPhapVoCam";

                await _context.Database.ExecuteSqlRawAsync(sqlQuery,
                    new SqlParameter("@IDPhieuTTPT", model.IDPhieuTTPT ?? (object)DBNull.Value),
                    new SqlParameter("@MaChanDoanVao", model.MaChanDoanVao ?? (object)DBNull.Value),
                    new SqlParameter("@TenChanDoanVao", model.TenChanDoanVao ?? (object)DBNull.Value),
                    new SqlParameter("@MaChanDoanTruoc", model.MaChanDoanTruoc ?? (object)DBNull.Value),
                    new SqlParameter("@TenChanDoanTruoc", model.TenChanDoanTruoc ?? (object)DBNull.Value),
                    new SqlParameter("@MaChanDoanSau", model.MaChanDoanSau ?? (object)DBNull.Value),
                    new SqlParameter("@TenChanDoanSau", model.TenChanDoanSau ?? (object)DBNull.Value),

                    new SqlParameter("@IDPhongThucHien", model.IDPhongThucHien ?? (object)DBNull.Value),
                    new SqlParameter("@IDLoaiTTPT", model.IDLoaiTTPT ?? (object)DBNull.Value),
                    new SqlParameter("@IDThietBi", model.IDThietBi ?? (object)DBNull.Value),

                    new SqlParameter("@IDTaiBienBienChung", model.IDTaiBienBienChung),
                    new SqlParameter("@IDCheDoThuThuat", model.IDCheDoThuThuat ?? (object)DBNull.Value),
                    new SqlParameter("@CanThiepThuThuat", model.CanThiepThuThuat ?? (object)DBNull.Value),

                    new SqlParameter("@SoLanMoLai", model.SoLanMoLai ?? (object)DBNull.Value),
                    new SqlParameter("@LyDoMoLai", model.LyDoMoLai ?? (object)DBNull.Value),

                    new SqlParameter("@IDViTriThucHien", model.IDViTriThucHien),

                    new SqlParameter("@IDTuVong", model.IDTuVong),

                    new SqlParameter("@DanLuu", model.DanLuu ?? (object)DBNull.Value),
                    new SqlParameter("@NgayRutOngDanLuu", model.NgayRutOngDanLuu ?? (object)DBNull.Value),
                    new SqlParameter("@NgayCatChi", model.NgayCatChi ?? (object)DBNull.Value),
                    new SqlParameter("@Khac", model.Khac ?? (object)DBNull.Value),

                    new SqlParameter("@MaFNA", model.MaFNA ?? (object)DBNull.Value),
                    new SqlParameter("@TienCan", model.TienCan ?? (object)DBNull.Value),
                    new SqlParameter("@KetQuaXNFNAGBP", model.KetQuaXNFNAGBP ?? (object)DBNull.Value),
                    new SqlParameter("@ChiDinhViTriTonThuongFNA", model.ChiDinhViTriTonThuongFNA ?? (object)DBNull.Value),
                    new SqlParameter("@YeuCauXetNghiem", model.YeuCauXetNghiem ?? (object)DBNull.Value),

                    new SqlParameter("@IDPhuongPhapVoCam", model.IDPhuongPhapVoCam ?? (object)DBNull.Value)
                );

                return Ok(new { success = true, message = "Lưu thông tin thủ thuật/phẫu thuật thành công." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi gọi SP: {ex.Message}");
                return StatusCode(500, new { success = false, message = $"Lỗi Server: {ex.Message}" });
            }
        }

        [HttpGet("trinh_tu")]
        public async Task<IActionResult> TrinhTuVaKetLuan()
        {
            //var quyenVaiTro = await _memoryCache.getQuyenVaiTro(_maChucNang);
            //if (quyenVaiTro == null)
            //{
            //    return RedirectToAction("NotFound", "Home");
            //}
            //ViewBag.quyenVaiTro = quyenVaiTro;
            //ViewData["Title"] = CommonServices.toEmptyData(quyenVaiTro);

            //var model = await _context.TrinhTuVaKetLuan
            //    .FromSqlRaw("EXEC S0305_TTPT_GetTrinhTuVaKetLuanTheoIDPhieuTTPT @IDPhieuTTPT",
            //    new SqlParameter("@IDPhieuTTPT", 1))
            //    .AsNoTracking()
            //    .FirstOrDefault();

            ViewBag.quyenVaiTro = new
            {
                Them = true,
                Sua = true,
                Xoa = true,
                Xuat = true,
                CaNhan = true,
                Xem = true,
            };

            return PartialView("~/Views/V0302/V0302ThuThuatPhauThuat/V0302TrinhTuVaKetLuanTTPT.cshtml");
        }

        [HttpPost("trinh-tu/save")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SaveTrinhTu([FromBody] M0305TrinhTuVaKetLuanModel model)
        {
            if (model == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            try
            {
                string sqlQuery = @"EXEC S0305_TTPT_TaoTrinhTuVaKetLuan 
                          @IDPhieuTTPT, @TrinhTu, @KetLuan";

                await _context.Database.ExecuteSqlRawAsync(sqlQuery,
                    new SqlParameter("@IDPhieuTTPT", model.IDPhieuTTPT),
                    new SqlParameter("@TrinhTu", model.TrinhTu ?? (object)DBNull.Value),
                    new SqlParameter("@KetLuan", model.KetLuan ?? (object)DBNull.Value)
                );

                return Ok(new { success = true, message = "Lưu trình tự thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpGet]
        [Route("trinh-tu/list-by-idttpt/{idPhieuTTPT}")]
        public async Task<IActionResult> GetTrinhTuByPhieuId(long idPhieuTTPT)
        {
            try
            {
                if (idPhieuTTPT <= 0)
                {
                    return BadRequest(new { success = false, message = "ID Phiếu không hợp lệ." });
                }

                var sql = "EXEC dbo.S0305_TTPT_GetTrinhTuVaKetLuanTheoIDPhieuTTPT @IDPhieuTTPT";
                var idParam = new SqlParameter("@IDPhieuTTPT", idPhieuTTPT);

                var trinhTuList = await _context.TrinhTuVaKetLuan
                                             .FromSqlRaw(sql, idParam)
                                             .ToListAsync();

                if (trinhTuList == null || trinhTuList.Count == 0)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Không tìm thấy trình tự nào cho phiếu này.",
                        data = new List<object>() 
                    });
                }

                return Ok(new { success = true, data = trinhTuList });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi Server: Không thể đọc dữ liệu trình tự. Chi tiết: {ex.Message}" });
            }
        }

        [HttpGet("ekip")]
        public async Task<IActionResult> EkipThucHien()
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
        public async Task<IActionResult> GhiNhanThuocVatTu()
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
            return PartialView("~/Views/V0302/V0302ThuThuatPhauThuat/V0302GhiNhanVatTuTTPT.cshtml");
        }


    }
}
