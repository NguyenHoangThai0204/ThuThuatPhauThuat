using ThuThuatPhauThuat.Models.M0302;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;

namespace ThuThuatPhauThuat.Services.S0302.IS0302
{
    public interface IS0303TemplateTTPT
    {
        Task<List<M0303Khoa>> GetDSKhoa();
        Task<List<M0303TemplateTTPT>> LayDanhSachTheoIDKhoa(long idKhoa);
        Task<List<M0303TemplateTTPT>> LayTatCaDanhSach();

        Task<M0303TemplateTTPT> LayChiTietTheoID(long id);
        Task<M0303TemplateTTPT> CapNhatTemplateTTPT(M0303TemplateTTPT model);
    }
}
