
using DemoCauTruc.Models.M0302;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;

namespace C0302_HoangThai.Models.M0302
{
    public class Context0302 : DbContext
    {

        public Context0302(DbContextOptions<Context0302> options) : base(options) { }

        public DbSet<M0302ThongTinDoanhNghiep> ThongTinDoanhNghieps { get; set; }
        public DbSet<M0302ThuThuatPhauThuatModelList> M0302ThuThuatPhauThuatModelLists { get; set; }

        public DbSet<HH_DM_KhoHang> HH_DM_KhoHang { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<M0302ThongTinDoanhNghiep>().HasNoKey();
           
            modelBuilder.Entity<HH_DM_KhoHang>().HasNoKey();
            modelBuilder.Entity<M0302ThuThuatPhauThuatModelList>().HasNoKey();

        }

        public bool TestConnection()
        {
            try
            {
                return Database.CanConnect();
            }
            catch (Exception)
            {
                return false;
            }
        }


    }
}
