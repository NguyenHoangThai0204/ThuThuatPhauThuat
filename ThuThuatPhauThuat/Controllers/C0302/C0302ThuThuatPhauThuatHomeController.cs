using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using System.Data;
using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using ThuThuatPhauThuat.PDFDocuments.P0302;
using ThuThuatPhauThuat.Services.S0302;
using ThuThuatPhauThuat.Services.S0302.IS0302;
using ThuThuatPhauThuat.Services.S0305.IS0305;

namespace ThuThuatPhauThuat.Controllers.C0302
{
    [Route("thu_thuat_phau_thuat")]
    public class C0302ThuThuatPhauThuatHomeController : Controller
    {
        //private string _maChucNang = "/thu_thuat_phau_thuat";
        //private IMemoryCachingServices _memoryCache;

        private readonly IS0302ThuThuatPhauThuatInterface _service;
        private readonly IS0305FtpService _ftpService;
        private readonly S0301ICDService _icdService;
        private readonly Context0302 _context;
        private readonly ILogger<C0302ThuThuatPhauThuatHomeController> _logger;

        public C0302ThuThuatPhauThuatHomeController(
            IS0302ThuThuatPhauThuatInterface service,
            Context0302 context,
            ILogger<C0302ThuThuatPhauThuatHomeController> logger,
            IS0305FtpService ftpService,
            S0301ICDService icdService
        /*, IMemoryCachingServices memoryCache*/
        )
        {
            _service = service;
            _context = context;
            _logger = logger;
            _ftpService = ftpService;
            _icdService = icdService;
            //_memoryCache = memoryCache;
        }
        public class ExportPdfRequest
        {
            public long IDVaoVien { get; set; }
            public long IDChiDinhChiTiet { get; set; }
            public long IDChiNhanh { get; set; }
        }



        [HttpPost("xuat-pdf-bang-html")]
        public async Task<IActionResult> ExportToPDFHTML([FromBody] ExportPdfRequest request)
        {
            _logger.LogInformation("Bắt đầu ExportToPDFHTML với tham số: IDVaoVien={IDVaoVien}, IDChiDinhChiTiet={IDChiDinhChiTiet}, IDChiNhanh={IDChiNhanh}",
                request.IDVaoVien, request.IDChiDinhChiTiet, request.IDChiNhanh);
            try
            {
                // Lấy dữ liệu từ stored procedure
                var parameters = new[]
                {
            new SqlParameter("@IdVaoVien", request.IDVaoVien),
            new SqlParameter("@IdChiNhanh", request.IDChiNhanh),
            new SqlParameter("@IdChiDinhCT", request.IDChiDinhChiTiet)
        };
                var sql = @"EXEC TTPT_S0302_GetThongTinXuatPDFTTPT @IdVaoVien, @IdChiNhanh, @IdChiDinhCT";
                var data = _context.M0302ThongTinXuatPDFTTPTModel2s
                    .FromSqlRaw(sql, parameters)
                    .AsNoTracking()
                    .AsEnumerable()
                    .FirstOrDefault();

                if (data == null)
                    return NotFound(new { success = false, message = "Không có dữ liệu để xuất PDF" });

                _logger.LogInformation(@"✅ DEBUG FULL DATA:
            • MaVaoVien: {MaVaoVien}
            • TenBN: {TenBN}
            • BatDauThuThuat: {BatDauThuThuat}
            • BatDauThuThuat Type: {BatDauType}
            • KetThucThuThuat: {KetThucThuThuat}
            • VaoVienLuc: {VaoVienLuc}
            • IDPhieuTTPT: {IDPhieuTTPT}",
             data.MaVaoVien,
             data.TenBN,
             data.BatDauThuThuat,
             data.BatDauThuThuat?.GetType()?.Name ?? "NULL",
             data.KetThucThuThuat,
             data.VaoVienLuc,
             data.IDPhieuTTPT);
                // Lấy thông tin doanh nghiệp
                var parameters1 = new[] { new SqlParameter("@IdChiNhanh", request.IDChiNhanh) };
                var sql1 = @"EXEC TTPT_S0302_GetThongTinDoanhNghiep @IdChiNhanh";
                var doanhN = _context.ThongTinDoanhNghieps
                    .FromSqlRaw(sql1, parameters1)
                    .AsNoTracking()
                    .AsEnumerable()
                    .FirstOrDefault();

                // Sử dụng class P0305ThuThuatPhauThuatPDF để generate PDF từ HTML
                var pdfGenerator = new P0305ThuThuatPhauThuatPDF(data, doanhN, _context, _ftpService);
                var pdfBytes = await pdfGenerator.GeneratePdf(); // ← Add await here
                var fileName = $"ThuThuatPhauThuat_HTML_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xuất PDF từ HTML");
                return StatusCode(500, new { success = false, message = $"Lỗi xuất PDF: {ex.Message}" });
            }
        }

        [HttpPost("XoaPhieuTTPT")]
        public async Task<IActionResult> XoaPhieuTTPT(long idPhieuTTPT)
        {
            try
            {

                if (idPhieuTTPT <= 0)
                    return BadRequest(new { success = false, message = "ID phiếu không hợp lệ!" });

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC [dbo].[TTPT_S0302_XoaPhieuTTPT] @p0", idPhieuTTPT
                );

                return Ok(new { success = true, message = "Đã xóa phiếu và toàn bộ dữ liệu liên quan thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi xóa phiếu: " + ex.Message });
            }
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

        //[HttpGet("thong_tin_so_phieu")]
        //public IActionResult ThongTinSoPhieu(int tabIndex)
        //{
        //    ViewBag.TabIndex = tabIndex;
        //    return PartialView("_ThongTinSoPhieu");
        //}
        [HttpGet("thong_tin_so_phieu")]
        public async Task<IActionResult> ThongTinSoPhieu(int tabIndex, long idVaoVien, long idcn, long idChiDinhChiTiet)
        {

            var parameters = new[]
            {
            new SqlParameter("@IdVaoVien", idVaoVien),

            new SqlParameter("@IdChiNhanh", idcn),
                    new SqlParameter("@IdChiDinhCT", idChiDinhChiTiet)

        };

            var sql = @"EXEC TTPT_S0302_GetSoPhieuThuThuatPhauThuat @IdVaoVien, @IdChiNhanh, @IdChiDinhCT";

            var data = _context.M0302PhieuThuThuatPhauThuatModels
                .FromSqlRaw(sql, parameters)
                .AsNoTracking()
                .AsEnumerable() // ← đưa query về client
                .FirstOrDefault();

            if (data == null)
            {
                data = new ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat.M0302PhieuThuThuatPhauThuatModel();
            }

            return PartialView("_ThongTinSoPhieu", data);
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
        public async Task<IActionResult> GetThongTinChiTiet(long idVaoVien, long idChiNhanh, long idChiDinhChiTiet)
        {
            try
            {
                // Sử dụng stored procedure chuyên cho chi tiết
                var parameters = new[]
                {
                    new SqlParameter("@IdVaoVien", idVaoVien),
                    new SqlParameter("@IdChiNhanh", idChiNhanh),
                    new SqlParameter("@IdChiDinhCT", idChiDinhChiTiet)

                };


                var data = await _context.M0302ThongTinThuThuatPhauThuatModels
                    .FromSqlRaw("EXEC TTPT_S0302_GetThongTinThuThuatPhauThuat @IdVaoVien, @IdChiNhanh, @IdChiDinhCT", parameters)
                    .AsNoTracking()
                    .ToListAsync();   // Lấy tất cả về client

                var record = data.FirstOrDefault();  // Chọn 1 record trên client

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

        [HttpPost("create-phieu")]
        public async Task<IActionResult> CreatePhieu([FromBody] M0302PhieuThuThuatPhauThuatModel model)
        {
            if (model == null)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ" });

            try
            {
                using var conn = _context.Database.GetDbConnection();
                await conn.OpenAsync();

                using var cmd = conn.CreateCommand();
                cmd.CommandText = "TTPT_S0302_TaoPhieuTTPT";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                //cmd.Parameters.Add(new SqlParameter("@SoPhieu", model.SoPhieu ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter(
    "@SoPhieu",
    string.IsNullOrWhiteSpace(model.SoPhieu) ? (object)DBNull.Value : model.SoPhieu
));

                cmd.Parameters.Add(new SqlParameter("@IDNguonBenh", model.IDNguonBenh ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@BatDauThuThuat", model.BatDauThuThuat ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@KetThucThuThuat", model.KetThucThuThuat ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@ThoiGianKhoa", model.ThoiGianKhoa ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@NhomMau", model.NhomMau ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@YeuToRh", model.YeuToRh ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@IDChiDinhChiTiet", model.IDChiDinhChiTiet ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@IDVaoVien", model.IDVaoVien ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@NguoiKhoa", model.NguoiKhoa ?? (object)DBNull.Value));

                using var reader = await cmd.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    var idPhieuTTPT = reader["IDPhieuTTPT"] != DBNull.Value ? Convert.ToInt64(reader["IDPhieuTTPT"]) : 0;
                    var soPhieu = reader["SoPhieu"]?.ToString();

                    return Ok(new { success = true, idPhieuTTPT, soPhieu });
                }

                return BadRequest(new { success = false, message = "Không thể tạo phiếu." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi Server: {ex.Message}" });
            }
        }
        //[HttpPut("update-phieu")]
        //public async Task<IActionResult> UpdatePhieu([FromBody] M0302PhieuThuThuatPhauThuatModel model)
        //{
        //    if (model == null || model.IDPhieuTTPT == null || model.IDPhieuTTPT == 0)
        //        return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ" });

        //    try
        //    {
        //        using var conn = _context.Database.GetDbConnection();
        //        await conn.OpenAsync();

        //        using var cmd = conn.CreateCommand();
        //        cmd.CommandText = "TTPT_S0302_CapNhatPhieuTTPT";
        //        cmd.CommandType = System.Data.CommandType.StoredProcedure;

        //        cmd.Parameters.Add(new SqlParameter("@IDPhieuTTPT", model.IDPhieuTTPT));
        //        cmd.Parameters.Add(new SqlParameter("@SoPhieu", model.SoPhieu ?? (object)DBNull.Value));
        //        cmd.Parameters.Add(new SqlParameter("@IDNguonBenh", model.IDNguonBenh ?? (object)DBNull.Value));
        //        cmd.Parameters.Add(new SqlParameter("@BatDauThuThuat", model.BatDauThuThuat ?? (object)DBNull.Value));
        //        cmd.Parameters.Add(new SqlParameter("@KetThucThuThuat", model.KetThucThuThuat ?? (object)DBNull.Value));
        //        cmd.Parameters.Add(new SqlParameter("@ThoiGianKhoa", model.ThoiGianKhoa ?? (object)DBNull.Value));
        //        cmd.Parameters.Add(new SqlParameter("@NhomMau", model.NhomMau ?? (object)DBNull.Value));
        //        cmd.Parameters.Add(new SqlParameter("@YeuToRh", model.YeuToRh ?? (object)DBNull.Value));
        //        cmd.Parameters.Add(new SqlParameter("@IDChiDinhChiTiet", model.IDChiDinhChiTiet ?? (object)DBNull.Value));
        //        cmd.Parameters.Add(new SqlParameter("@IDVaoVien", model.IDVaoVien ?? (object)DBNull.Value));
        //        cmd.Parameters.Add(new SqlParameter("@NguoiKhoa", model.NguoiKhoa ?? (object)DBNull.Value));

        //        await cmd.ExecuteNonQueryAsync();

        //        return Ok(new { success = true, message = "Cập nhật phiếu thành công" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { success = false, message = $"Lỗi Server: {ex.Message}" });
        //    }
        //}
        //// C0302ThuThuatPhauThuatHomeController.cs
        ///
        [HttpPost("update-phieu")]
        public async Task<IActionResult> UpdatePhieu([FromBody] M0302PhieuThuThuatPhauThuatModel model)
        {
            if (model == null || model.IDPhieuTTPT == null || model.IDPhieuTTPT == 0)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ" });

            try
            {
                using var conn = _context.Database.GetDbConnection();
                await conn.OpenAsync();

                using var cmd = conn.CreateCommand();
                cmd.CommandText = "TTPT_S0302_CapNhatPhieuTTPT";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.Add(new SqlParameter("@IDPhieuTTPT", model.IDPhieuTTPT));
                cmd.Parameters.Add(new SqlParameter("@SoPhieu", model.SoPhieu ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@IDNguonBenh", model.IDNguonBenh ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@BatDauThuThuat", model.BatDauThuThuat ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@KetThucThuThuat", model.KetThucThuThuat ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@ThoiGianKhoa", model.ThoiGianKhoa ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@NhomMau", model.NhomMau ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@YeuToRh", model.YeuToRh ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@IDChiDinhChiTiet", model.IDChiDinhChiTiet ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@IDVaoVien", model.IDVaoVien ?? (object)DBNull.Value));
                cmd.Parameters.Add(new SqlParameter("@NguoiKhoa", model.NguoiKhoa ?? (object)DBNull.Value));

                await cmd.ExecuteNonQueryAsync();

                return Ok(new { success = true, message = "Cập nhật phiếu thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi Server: {ex.Message}" });
            }
        }
        [HttpGet]
        [Route("icd/init")]
        public IActionResult SearchICD([FromQuery] string query, [FromQuery] int offset = 0, [FromQuery] int limit = 50, [FromQuery] bool yhct = false)
        {
            var allIcdData = _icdService.GetAllIcdData(yhct);

            IEnumerable<M0302IcdModel> filteredData = allIcdData;

            if (!string.IsNullOrEmpty(query))
            {
                query = query.ToLower();
                filteredData = allIcdData.Where(i =>
                    i.ma.ToLower().Contains(query) ||
                    i.ten.ToLower().Contains(query)
                );
            }

            // 2. Áp dụng Phân trang (Lấy 50 item)
            var pagedData = filteredData
                .Skip(offset) // Bỏ qua số lượng item đã tải (offset = 0 cho lần load đầu tiên)
                .Take(limit)  // Lấy tối đa 50 item
                .ToList();

            // 3. Trả về định dạng mà TomSelect hiểu
            // TomSelect cần một mảng các item
            return Ok(pagedData);
        }

        [HttpGet("thong-tin/search-icd")]
        public IActionResult SearchIcd(
                    [FromQuery] string query,
                    [FromQuery] int limit = 50,
                    [FromQuery] bool yhct = false
                    )
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                var defaultList = _icdService.GetAllIcdData(yhct)
                                             .Where(i => i.active)
                                             .Take(limit)
                                             .ToList();
                var defaultResults = defaultList
             .Select(i => new {
                 id = i.id,
                 ma = i.ma,
                 ten = i.ten,
                 text = $"{i.ma} - {i.ten}"
             })
             .ToList();

                return Ok(defaultResults);
            }

            string lowerQuery = query.Trim().ToLower();


            var allIcd = _icdService.GetAllIcdData(yhct);

            var results = allIcd
                .Where(i => i.active &&
                            (i.ma.ToLower().Contains(lowerQuery) ||
                             i.ten.ToLower().Contains(lowerQuery) ||
                             i.viettat?.ToLower().Contains(lowerQuery) == true))
                .Take(limit)
                .Select(i => new {
                    id = i.id,
                    ma = i.ma,
                    ten = i.ten,
                    viettat = i.viettat,
                    text = $"{i.ma} - {i.ten}"
                })
                .ToList();


            return Ok(results);
        }
        [HttpGet("thong-tin/init-icd")]
        public IActionResult GetIcdDetails([FromQuery] bool yhct = false, [FromQuery] int limit = 50)
        {
            var allIcd = _icdService.GetAllIcdData(yhct);

            var pagedData = allIcd
                .Take(limit) 
                .ToList();

            var results = pagedData
                .Select(i => new
                {
                    id = i.id, 
                    ma = i.ma, 
                    ten = i.ten,
                    viettat = i.viettat,
                    text = $"{i.ma} - {i.ten}"
                })
                .ToList();

            return Ok(results);
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

                string sqlQuery = @"EXEC TTPT_S0301_ThemThongTinTTPT 
            @IDPhieuTTPT, @IDChanDoanVao, @IDChanDoanTruoc, @IDChanDoanSau, @MaChanDoanVao, @TenChanDoanVao, @MaChanDoanTruoc, @TenChanDoanTruoc, @MaChanDoanSau, @TenChanDoanSau,
            @IDPhongThucHien, @IDLoaiTTPT, @IDThietBi, @IDTaiBienBienChung, @IDCheDoThuThuat, @CanThiepThuThuat, @SoLanMoLai, 
            @LyDoMoLai, @IDViTriThucHien, @IDTuVong, @DanLuu, @NgayRutOngDanLuu, @NgayCatChi, @Khac,
            @MaFNA, @TienCan, @KetQuaXNFNAGBP, @ChiDinhViTriTonThuongFNA, @YeuCauXetNghiem, @IDPhuongPhapVoCam";

                await _context.Database.ExecuteSqlRawAsync(sqlQuery,
                    new SqlParameter("@IDPhieuTTPT", model.IDPhieuTTPT ?? (object)DBNull.Value),
                    new SqlParameter("@IDChanDoanVao", model.IDChanDoanVao ?? (object)DBNull.Value),
                    new SqlParameter("@IDChanDoanTruoc", model.IDChanDoanTruoc ?? (object)DBNull.Value),
                    new SqlParameter("@IDChanDoanSau", model.IDChanDoanSau ?? (object)DBNull.Value),
                    new SqlParameter("@MaChanDoanVao", model.MaChanDoanVao ?? (object)DBNull.Value),
                    new SqlParameter("@TenChanDoanVao", model.TenChanDoanVao ?? (object)DBNull.Value),
                    new SqlParameter("@MaChanDoanTruoc", model.MaChanDoanTruoc ?? (object)DBNull.Value),
                    new SqlParameter("@TenChanDoanTruoc", model.TenChanDoanTruoc ?? (object)DBNull.Value),
                    new SqlParameter("@MaChanDoanSau", model.MaChanDoanSau ?? (object)DBNull.Value),
                    new SqlParameter("@TenChanDoanSau", model.TenChanDoanSau ?? (object)DBNull.Value),

                    new SqlParameter("@IDPhongThucHien", model.IDPhongThucHien ?? (object)DBNull.Value),
                    new SqlParameter("@IDLoaiTTPT", model.IDLoaiTTPT ?? (object)DBNull.Value),
                    new SqlParameter("@IDThietBi", model.IDThietBi ?? (object)DBNull.Value),

                    // ĐÃ SỬA: Thêm ?? (object)DBNull.Value cho các trường long?
                    new SqlParameter("@IDTaiBienBienChung", model.IDTaiBienBienChung ?? (object)DBNull.Value),
                    new SqlParameter("@IDCheDoThuThuat", model.IDCheDoThuThuat ?? (object)DBNull.Value),
                    new SqlParameter("@CanThiepThuThuat", model.CanThiepThuThuat ?? (object)DBNull.Value),

                    new SqlParameter("@SoLanMoLai", model.SoLanMoLai ?? (object)DBNull.Value),
                    new SqlParameter("@LyDoMoLai", model.LyDoMoLai ?? (object)DBNull.Value),

                    // ĐÃ SỬA: Thêm ?? (object)DBNull.Value
                    new SqlParameter("@IDViTriThucHien", model.IDViTriThucHien ?? (object)DBNull.Value),

                    // ĐÃ SỬA: Thêm ?? (object)DBNull.Value
                    new SqlParameter("@IDTuVong", model.IDTuVong ?? (object)DBNull.Value),

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
        public async Task<IActionResult> TrinhTuVaKetLuan(long? idVaoVien, int tabIndex = 0)
        {

         

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
                string sqlQuery1 = @"EXEC TTPT_S0305_TaoTrinhTuVaKetLuan 
                          @IDPhieuTTPT, @TrinhTu, @KetLuan, @ThongTinLuocDo";
                string sqlQuery2 = @"DELETE FROM QL_TTPT_AnhTruongTrinh WHERE IDPhieuTTPT = @IDPhieuTTPT;";
                string sqlQuery3 = @"EXEC TTPT_S0305_TaoAnhTruongTrinh @IDPhieuTTPT, @URL, @TenAnh, @NewImageId OUTPUT";

                await _context.Database.ExecuteSqlRawAsync(sqlQuery1,
                    new SqlParameter("@IDPhieuTTPT", model.IDPhieuTTPT),
                    new SqlParameter("@TrinhTu", model.TrinhTu ?? (object)DBNull.Value),
                    new SqlParameter("@KetLuan", model.KetLuan ?? (object)DBNull.Value),
                    new SqlParameter("@ThongTinLuocDo", model.ThongTinLuocDo ?? (object)DBNull.Value)
                );
                await _context.Database.ExecuteSqlRawAsync(sqlQuery2,
                    new SqlParameter("@IDPhieuTTPT", model.IDPhieuTTPT)
                );
                foreach (var anh in model.AnhTruongTrinhSaveToServer ?? [])
                {
                    var newImageIdParam = new SqlParameter("@NewImageId", SqlDbType.BigInt)
                    {
                        Direction = ParameterDirection.Output
                    };
                    //_logger.LogInformation("  - URL: {url}, TenAnh: {ten}", anh.URL, anh.TenAnh);
                    await _context.Database.ExecuteSqlRawAsync(sqlQuery3,
                        new SqlParameter("@IDPhieuTTPT", model.IDPhieuTTPT),
                        new SqlParameter("@URL", anh.URL ?? (object)DBNull.Value),
                        new SqlParameter("@TenAnh", anh.TenAnh ?? (object)DBNull.Value),
                        newImageIdParam
                    );
                    _logger.LogInformation("  - NewImageId: {newImageId}", newImageIdParam.Value);
                }

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

                var sql = "EXEC dbo.TTPT_S0305_GetTrinhTuVaKetLuanTheoIDPhieuTTPT @IDPhieuTTPT";
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
        [HttpGet]
        [Route("trinh-tu/vai-tro-ttpt")]
        public async Task<IActionResult> GetVaiTroTTPT()
        {
            try
            {
                var result = new List<object>();

                using (var connection = _context.Database.GetDbConnection())
                {
                    await connection.OpenAsync();

                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = "SELECT ID, Ma, Ten, Active FROM DM_VaiTroTTPT";
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                result.Add(new
                                {
                                    ID = reader.GetInt64(0),
                                    Ma = reader.GetString(1),
                                    Ten = reader.GetString(2),
                                    Active = reader.GetBoolean(3)
                                });
                            }
                        }
                    }
                }

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi Server: {ex.Message}" });
            }
        }

        [HttpPost("trinh-tu/upload-image")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] long idPhieuTTPT)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "File không hợp lệ." });
            }

            try
            {
                var remoteFilePath = await _ftpService.UploadFileAsync(file, "ttpt_images");

                var newImageIdParam = new SqlParameter("@NewImageId", SqlDbType.BigInt)
                {
                    Direction = ParameterDirection.Output
                };

                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC TTPT_S0305_TaoAnhTruongTrinh @IDPhieuTTPT, @URL, @TenAnh, @NewImageId OUTPUT",
                    new SqlParameter("@IDPhieuTTPT", idPhieuTTPT),
                    new SqlParameter("@URL", remoteFilePath),
                    new SqlParameter("@TenAnh", file.FileName),
                    newImageIdParam
                );

                var newImageId = (long)newImageIdParam.Value;

                return Ok(new
                {
                    success = true,
                    message = "Upload ảnh thành công.",
                    data = new
                    {
                        id = newImageId,
                        url = remoteFilePath,
                        fileName = file.FileName,
                        httpUrl = $"/thu_thuat_phau_thuat/image/view?path={Uri.EscapeDataString(remoteFilePath)}"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi upload ảnh: {ex.Message}" });
            }
        }

        [HttpPost("trinh-tu/upload-image-temp")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadImageTemp([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, message = "File không hợp lệ." });
            }

            try
            {
                // Upload file lên FTP vào thư mục tạm
                var remoteFilePath = await _ftpService.UploadFileAsync(file, "ttpt_images/temp");

                return Ok(new
                {
                    success = true,
                    message = "Upload ảnh tạm thời thành công.",
                    data = new
                    {
                        // Không có ID từ DB
                        url = remoteFilePath,
                        fileName = file.FileName,
                        httpUrl = $"/thu_thuat_phau_thuat/image/view?path={Uri.EscapeDataString(remoteFilePath)}",
                        isTemp = true // Đánh dấu đây là ảnh tạm
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi upload ảnh: {ex.Message}" });
            }
        }

        [HttpPost("trinh-tu/confirm-temp-images")]
        public async Task<IActionResult> ConfirmTempImages([FromBody] ConfirmImagesRequest request)
        {
            if (request.IDPhieuTTPT <= 0 || request.TempImages == null || !request.TempImages.Any())
            {
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });
            }

            try
            {
                var confirmedImages = new List<object>();

                foreach (var tempImage in request.TempImages)
                {
                    var finalPath = tempImage.Url.Replace("/temp/", "/");
                    await _ftpService.MoveFileAsync(tempImage.Url, finalPath);

                    // Lưu vào DB
                    var newImageIdParam = new SqlParameter("@NewImageId", SqlDbType.BigInt)
                    {
                        Direction = ParameterDirection.Output
                    };

                    await _context.Database.ExecuteSqlRawAsync(
                        "EXEC TTPT_S0305_TaoAnhTruongTrinh @IDPhieuTTPT, @URL, @TenAnh, @NewImageId OUTPUT",
                        new SqlParameter("@IDPhieuTTPT", request.IDPhieuTTPT),
                        new SqlParameter("@URL", finalPath),
                        new SqlParameter("@TenAnh", tempImage.FileName),
                        newImageIdParam
                    );

                    var newImageId = (long)newImageIdParam.Value;

                    confirmedImages.Add(new
                    {
                        id = newImageId,
                        url = finalPath,
                        fileName = tempImage.FileName,
                        httpUrl = $"/thu_thuat_phau_thuat/image/view?path={Uri.EscapeDataString(finalPath)}"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Xác nhận ảnh thành công.",
                    data = confirmedImages
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi xác nhận ảnh: {ex.Message}" });
            }
        }


        [HttpGet("trinh-tu/get-images/{idPhieuTTPT}")]
        public async Task<IActionResult> GetImagesByPhieuId(long idPhieuTTPT)
        {
            try
            {
                var sql = "EXEC dbo.TTPT_S0305_GetAnhTruongTrinhTheoIDPhieuTTPT @IDPhieuTTPT";
                var idParam = new SqlParameter("@IDPhieuTTPT", idPhieuTTPT);

                var images = await _context.AnhTruongTrinh
                                         .FromSqlRaw(sql, idParam)
                                         .ToListAsync();

                var imagesWithHttpUrl = images.Select(img => new
                {
                    img.ID,
                    img.TenAnh,
                    img.ThoiGianTao,
                    URL = img.URL, // FTP URL gốc (để xóa)
                    HttpUrl = $"/thu_thuat_phau_thuat/image/view?path={Uri.EscapeDataString(img.URL)}" // HTTP URL để hiển thị
                }).ToList();

                return Ok(new { success = true, data = imagesWithHttpUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpGet("trinh-tu/list-anh-truong-trinh-by-makhoa")]
        public async Task<IActionResult> GetAnhTruongTrinhByMaKhoa(string maKhoa)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(maKhoa))
                {
                    return Ok(new
                    {
                        success = true,
                        directory = "",
                        count = 0,
                        images = new List<object>(),
                        message = "Mã khoa không hợp lệ"
                    });
                }

                var directoryPath = $"ttpt_images/khoa/{maKhoa}";
                var images = await _ftpService.ListFilesInDirectoryAsync(directoryPath);

                return Ok(new
                {
                    success = true,
                    directory = directoryPath,
                    count = images.Count,
                    images = images.Select(img => new
                    {
                        tenAnh = img.FileName,
                        fullPath = img.FullPath,
                        size = img.Size,
                        sizeFormatted = FormatFileSize(img.Size),
                        modifiedDate = img.ModifiedDate,
                        fileType = img.FileType,
                        httpUrl = $"/thu_thuat_phau_thuat/image/view?path={Uri.EscapeDataString(img.FullPath)}"
                    }),
                    message = images.Count == 0 ? "Thư mục rỗng hoặc không tồn tại" : null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetAnhTruongTrinhByMaKhoa: {ex.Message}");

                return Ok(new
                {
                    success = true,
                    directory = $"ttpt_images/khoa/{maKhoa}",
                    count = 0,
                    images = new List<object>(),
                    message = "Không thể tải danh sách ảnh"
                });
            }
        }

        [HttpDelete("trinh-tu/delete-image/{id}")]
        public async Task<IActionResult> DeleteImage(long id)
        {
            try
            {
                // Lấy thông tin ảnh trước khi xóa
                var image = await _context.AnhTruongTrinh
                                        .FromSqlRaw(@"SELECT ID, IDPhieuTTPT, URL, TenAnh, ThoiGianTao
                                                      FROM QL_TTPT_AnhTruongTrinh 
                                                      WHERE ID = @ID", new SqlParameter("@ID", id))
                                        .AsNoTracking()
                                        .FirstOrDefaultAsync();
                if (image == null)
                {
                    return NotFound(new { success = false, message = "Không tìm thấy ảnh." });
                }

                // Xóa file từ FTP 
                await _ftpService.DeleteFileAsync(image.URL);

                // Xóa record từ database
                var sqlQuery = @"EXEC TTPT_S0305_XoaAnhTruongTrinh @ID";
                await _context.Database.ExecuteSqlRawAsync(sqlQuery, new SqlParameter("@ID", id));

                return Ok(new { success = true, message = "Xóa ảnh thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Lỗi xóa ảnh: {ex.Message}" });
            }
        }

        [HttpGet("image/view")]
        public async Task<IActionResult> ViewImage(string path)
        {
            try
            {
                var stream = await _ftpService.DownloadAsync(path);

                var extension = Path.GetExtension(path).ToLower();
                var contentType = extension switch
                {
                    ".png" => "image/png",
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".gif" => "image/gif",
                    ".bmp" => "image/bmp",
                    _ => "application/octet-stream"
                };

                return File(stream, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error viewing image: {ex.Message}");
                return NotFound();
            }
        }

        public class ConfirmImagesRequest
        {
            public long IDPhieuTTPT { get; set; }
            public List<TempImageInfo> TempImages { get; set; }
        }

        public class TempImageInfo
        {
            public string Url { get; set; }
            public string FileName { get; set; }
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

            var dt = new DataTable();
            dt.Columns.Add("IDPhieuTTPT", typeof(long));
            dt.Columns.Add("IDNhanVien", typeof(long));
            dt.Columns.Add("IDVaiTro", typeof(long));
            dt.Columns.Add("GhiChu", typeof(string));

            foreach (var item in ekipList)
            {
                dt.Rows.Add(item.IDPhieuTTPT, item.IDNhanVien, item.IDVaiTro, item.GhiChu);
                _logger.LogWarning($"item : {item.IDPhieuTTPT}");
            }

            // --- BƯỚC 2: TẠO THAM SỐ SQL TVP ---
            var tvpParam = new SqlParameter("@EkipData", dt)
            {
                SqlDbType = SqlDbType.Structured,
                TypeName = "dbo.T0301_EkipThucHienUpdate"
            };

            try
            {
                var sql = "EXEC dbo.TTPT_S0301_ThemEkipThucHien @EkipData";

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

                var sql = "EXEC dbo.TTPT_S0301_DocEkipThucHien @IDPhieuTTPT";
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
            public long IDVaiTro { get; set; }
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
        [HttpPost("xuat-pdf")]
        public async Task<IActionResult> ExportToPDF([FromBody] ExportPdfRequest request)
        {
            _logger.LogInformation("Bắt đầu ExportToPDF với tham số: IDVaoVien={IDVaoVien}, IDChiDinhChiTiet={IDChiDinhChiTiet}, IDChiNhanh={IDChiNhanh}",
                request.IDVaoVien, request.IDChiDinhChiTiet, request.IDChiNhanh);

            var parameters = new[]
                    {
                new SqlParameter("@IdVaoVien", request.IDVaoVien),
                new SqlParameter("@IdChiNhanh", request.IDChiNhanh),
                new SqlParameter("@IdChiDinhCT", request.IDChiDinhChiTiet)
            };

            var sql = @"EXEC TTPT_S0302_GetThongTinXuatPDFTTPT @IdVaoVien, @IdChiNhanh, @IdChiDinhCT";

            var data = _context.M0302ThongTinXuatPDFTTPTModels
                .FromSqlRaw(sql, parameters)
                .AsNoTracking()
                .AsEnumerable()
                .FirstOrDefault();

            if (data == null)
                return NotFound("Không có dữ liệu để xuất PDF");

            var parameters1 = new[] { new SqlParameter("@IdChiNhanh", request.IDChiNhanh) };
            var sql1 = @"EXEC TTPT_S0302_GetThongTinDoanhNghiep @IdChiNhanh ";

            var doanhN = _context.ThongTinDoanhNghieps
                .FromSqlRaw(sql1, parameters1)
                .AsNoTracking()
                .AsEnumerable()
                .FirstOrDefault();

            var document = new P0302ThuThuatPhauThuatPDF(data, doanhN);

            using var stream = new MemoryStream();
            document.GeneratePdf(stream);

            var fileName = $"ThuThuatPhauThuat_{DateTime.Now:yyyyMMddHHmmss}.pdf";
            stream.Position = 0; // Reset stream trước khi trả về

            return File(stream.ToArray(), "application/pdf", fileName);
        }

        // Helper method format size
        private string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }
}

