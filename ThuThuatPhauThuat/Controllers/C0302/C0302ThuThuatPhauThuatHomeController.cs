using Microsoft.AspNetCore.Mvc;
using ThuThuatPhauThuat.Service.S0302.IS0302;

namespace ThuThuatPhauThuat.Controllers.C0302
{
    [Route("thu_thuat_phau_thuat")]
    public class C0302ThuThuatPhauThuatHomeController : Controller
    {
        //private string _maChucNang = "/thu_thuat_phau_thuat";
        //private IMemoryCachingServices _memoryCache;

        private readonly IS0302ThuThuatPhauThuatInterface _service;

        public C0302ThuThuatPhauThuatHomeController(IS0302ThuThuatPhauThuatInterface service /*, IMemoryCachingServices memoryCache*/)
        {
            _service = service;
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
        [HttpPost("loc_danh_sach")]
        public async Task<IActionResult> LocDanhSach(long IdChiNhanh, string Ngay, long IdPhongBuong, int TrangThai)
        {
            var (success, message, data) = await _service.LocDanhSachAsync(IdChiNhanh, Ngay, IdPhongBuong, TrangThai);
            if (!success)
                return Json(new { Success = false, Message = message, Data = new List<object>() });

            // Trả về đúng cấu trúc object
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
