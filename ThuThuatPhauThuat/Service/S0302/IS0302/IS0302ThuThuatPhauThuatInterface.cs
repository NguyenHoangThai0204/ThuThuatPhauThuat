using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;

namespace ThuThuatPhauThuat.Service.S0302.IS0302
{
    public interface IS0302ThuThuatPhauThuatInterface
    {
        Task<(bool Success, string Message, object Data)> LocDanhSachAsync(long IdChiNhanh,
    string Ngay,
    long IdPhongBuong,
    int TrangThai,
    string MaVaoVien = null,
    string MaBenhNhan = null,
    string TenBenhNhan = null,
    string CCCD = null,
    string MaThe = null,
    string SoDienThoai = null);
        //Task<(bool Success, string Message, object Data)> LocDanhSachAsync(long IdChiNhanh, string Ngay, long IdPhongBuong, int TrangThai);
    }
}
