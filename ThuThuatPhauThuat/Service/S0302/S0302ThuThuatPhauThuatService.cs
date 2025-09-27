
using C0302_HoangThai.Models.M0302;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.Json;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using ThuThuatPhauThuat.Service.S0302.IS0302;

namespace ThuThuatPhauThuat.Service.S0302
{
    public class S0302ThuThuatPhauThuatService : IS0302ThuThuatPhauThuatInterface
    {
        private readonly Context0302 _dbService;
        private readonly ILogger<S0302ThuThuatPhauThuatService> _logger;

        public S0302ThuThuatPhauThuatService(  Context0302 dbService, ILogger<S0302ThuThuatPhauThuatService> logger)
        {
            _dbService = dbService;
            _logger = logger;
        }

        //public async Task<(bool Success, string Message, object Data)> LocDanhSachAsync(long IdChiNhanh, string Ngay, long IdPhongBuong, int TrangThai)
        //{
        //    try
        //    {


        //        var paramIdChiNhanh = new SqlParameter("@IdChiNhanh", IdChiNhanh);
        //        var paramNgay = new SqlParameter("@Ngay", string.IsNullOrEmpty(Ngay) ? DBNull.Value : (object)Ngay);
        //        var paramIdPhongBuong = new SqlParameter("@IDPhongBuong", IdPhongBuong == 0 ? DBNull.Value : (object)IdPhongBuong);
        //        var paramTrangThai = new SqlParameter("@TrangThai", TrangThai);

        //        var allData = await _dbService.M0302ThuThuatPhauThuatModelLists
        //            .FromSqlRaw("EXEC S0302_XuatDanhSachThuThuatPhauThuat @IdChiNhanh, @Ngay, @IDPhongBuong, @TrangThai",
        //                paramIdChiNhanh, paramNgay, paramIdPhongBuong, paramTrangThai)
        //            .AsNoTracking()
        //            .ToListAsync();

        //        if (allData == null || allData.Count == 0)
        //        {
        //            _logger.LogInformation("Không có dữ liệu ");
        //            return (true, "Không có dữ liệu", new { Data = new List<object>() });
        //        }
        //        else
        //        {
        //            _logger.LogInformation("Có dữ liệu: {AllData}", JsonSerializer.Serialize(allData));

        //        }


        //            return (true, "Thành công", new { Data = allData });
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Lỗi khi lọc danh sách thủ thuật phẫu thuật");
        //        return (false, ex.Message, null);
        //    }
        //}
        public async Task<(bool Success, string Message, object Data)> LocDanhSachAsync(
    long IdChiNhanh,
    string Ngay,
    long IdPhongBuong,
    int TrangThai,
    string MaVaoVien = null,
    string MaBenhNhan = null,
    string TenBenhNhan = null,
    string CCCD = null,
    string MaThe = null,
    string SoDienThoai = null)
        {
            try
            {
                // Chuẩn bị parameters
                var parameters = new[]
                {
            new SqlParameter("@IdChiNhanh", IdChiNhanh),
            new SqlParameter("@Ngay", string.IsNullOrEmpty(Ngay) ? DBNull.Value : (object)Ngay),
            new SqlParameter("@IDPhongBuong", IdPhongBuong == 0 ? DBNull.Value : (object)IdPhongBuong),
            new SqlParameter("@TrangThai", TrangThai),
            // Thêm các parameters tìm kiếm nâng cao
            new SqlParameter("@MaVaoVien", string.IsNullOrEmpty(MaVaoVien) ? DBNull.Value : (object)MaVaoVien),
            new SqlParameter("@MaBenhNhan", string.IsNullOrEmpty(MaBenhNhan) ? DBNull.Value : (object)MaBenhNhan),
            new SqlParameter("@TenBenhNhan", string.IsNullOrEmpty(TenBenhNhan) ? DBNull.Value : (object)TenBenhNhan),
            new SqlParameter("@CCCD", string.IsNullOrEmpty(CCCD) ? DBNull.Value : (object)CCCD),
            new SqlParameter("@MaThe", string.IsNullOrEmpty(MaThe) ? DBNull.Value : (object)MaThe),
            new SqlParameter("@SoDienThoai", string.IsNullOrEmpty(SoDienThoai) ? DBNull.Value : (object)SoDienThoai)
        };

                // Câu lệnh SQL với đầy đủ parameters
                var sql = @"EXEC S0302_XuatDanhSachThuThuatPhauThuat 
                    @IdChiNhanh, @Ngay, @IDPhongBuong, @TrangThai,
                    @MaVaoVien, @MaBenhNhan, @TenBenhNhan, @CCCD, @MaThe, @SoDienThoai";

                var allData = await _dbService.M0302ThuThuatPhauThuatModelLists
                    .FromSqlRaw(sql, parameters)
                    .AsNoTracking()
                    .ToListAsync();

                if (allData == null || allData.Count == 0)
                {
                    _logger.LogInformation("Không có dữ liệu thỏa mãn điều kiện tìm kiếm");
                    return (true, "Không có dữ liệu", new { Data = new List<object>() });
                }

                _logger.LogInformation("Tìm thấy {Count} bản ghi", allData.Count);
                return (true, "Thành công", new { Data = allData });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lọc danh sách thủ thuật phẫu thuật");
                return (false, ex.Message, null);
            }
        }
    }
}