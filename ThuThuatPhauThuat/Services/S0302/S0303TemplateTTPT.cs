
using ThuThuatPhauThuat.Models.M0302;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using ThuThuatPhauThuat.Services.S0302.IS0302;

namespace ThuThuatPhauThuat.Services.S0302
{
    
    public class S0303TemplateTTPT : IS0303TemplateTTPT
    {
        private readonly Context0302 _localDb;
        private readonly ILogger<S0303TemplateTTPT> _logger;

        public S0303TemplateTTPT(
           Context0302 localDb,
           ILogger<S0303TemplateTTPT> logger)
        {
            _localDb = localDb;
            _logger = logger;
        }

        public async Task<List<M0303Khoa>> GetDSKhoa()
        {
            var dsKhoa = await _localDb.Set<M0303Khoa>()
                .FromSqlRaw(@"
                    SELECT 
                        ID AS id, 
                        TenKhoa AS ten, 
                        MaKhoa AS viettat
                    FROM [dbo].[DM_Khoa]
                ")
                .ToListAsync();

            return dsKhoa;
        }

        public async Task<List<M0303TemplateTTPT>> LayDanhSachTheoIDKhoa(long idKhoa)
        {
            try
            {
                var data = await _localDb.M0303TemplateTTPT
                    .FromSqlRaw("EXEC TTPT_S0303DM_TemplateTTPT @Action={0}, @IDKhoa={1}", "GET_BY_KHOA", idKhoa)
                    .ToListAsync();


                return data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi chạy SP TTPT_S0303DM_TemplateTTPT với IDKhoa={idKhoa}", idKhoa);
                return new List<M0303TemplateTTPT>();
            }
        }

        public async Task<List<M0303TemplateTTPT>> LayTatCaDanhSach()
        {
            try
            {
                var data = await _localDb.M0303TemplateTTPT
                    .FromSqlRaw("EXEC TTPT_S0303DM_TemplateTTPT @Action={0}", "GET")
                    .ToListAsync();


                return data;
            }
            catch (Exception ex)
            {
                return new List<M0303TemplateTTPT>();
            }
        }


        // 🔥 Thêm hàm lấy chi tiết theo ID (cho bảng bên phải)
        public async Task<M0303TemplateTTPT> LayChiTietTheoID(long id)
        {
            try
            {
                var data = await _localDb.M0303TemplateTTPT
                    .FromSqlRaw("EXEC TTPT_S0303DM_TemplateTTPT @Action={0}, @ID={1}", "GET_BY_ID", id)
                    .ToListAsync();

                return data.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi chạy SP TTPT_S0303DM_TemplateTTPT GET_BY_ID với ID={id}", id);
                return null;
            }
        }

        public async Task<M0303TemplateTTPT?> CapNhatTemplateTTPT(M0303TemplateTTPT model)
        {
            if (model == null || model.ID <= 0)
                return null;

            try
            {
                // Nếu Ten hoặc NoiDung khác null thì cập nhật, giữ nguyên cái còn lại
                var result = await _localDb.M0303TemplateTTPT
                    .FromSqlRaw("EXEC TTPT_S0303DM_TemplateTTPT @Action={0}, @ID={1}, @Ten={2}, @NoiDung={3}, @ThongTinLuocDo={4}",
                        "UPDATE", model.ID, model.Ten, model.NoiDung, model.ThongTinLuocDo)
                    .ToListAsync();

                return result.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi cập nhật TemplateTTPT ID={id}", model.ID);
                return null;
            }
        }
        public async Task<bool> CapNhatTrangThaiActive(long id, bool activeStatus = false)
        {
            if (id <= 0)
            {
                _logger.LogWarning("Không thể cập nhật trạng thái: ID không hợp lệ.");
                return false;
            }

            try
            {
                var entityToUpdate = new M0303TemplateTTPT
                {
                    ID = id,
                    Active = activeStatus
                };

                _localDb.M0303TemplateTTPT.Attach(entityToUpdate);

                _localDb.Entry(entityToUpdate).Property(e => e.Active).IsModified = true;

                var changes = await _localDb.SaveChangesAsync();

                return changes > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi cập nhật trạng thái Active (Sử dụng DbContext) TemplateTTPT ID={id} thành {status}", id, activeStatus);
                return false;
            }
        }


    }
}
