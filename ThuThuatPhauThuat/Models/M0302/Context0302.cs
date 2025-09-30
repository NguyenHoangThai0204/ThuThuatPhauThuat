
using DemoCauTruc.Models.M0302;
using Microsoft.EntityFrameworkCore;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;
using static ThuThuatPhauThuat.Controllers.C0302.C0302ThuThuatPhauThuatHomeController;

namespace ThuThuatPhauThuat.Models.M0302
{
    public class Context0302 : DbContext
    {

        public Context0302(DbContextOptions<Context0302> options) : base(options) { }

        public DbSet<M0302ThongTinDoanhNghiep> ThongTinDoanhNghieps { get; set; }
        public DbSet<M0302ThuThuatPhauThuatModelList> M0302ThuThuatPhauThuatModelLists { get; set; }
        public DbSet<M0303TemplateTTPT> M0303TemplateTTPT { get; set; }
        public DbSet<M0303Khoa> M0303Khoa { get; set; }
        public DbSet<M0301DoiNguEkip> DoiNguEkip { get; set; }
        public DbSet<HH_DM_KhoHang> HH_DM_KhoHang { get; set; }
        public DbSet<EkipResult> EkipResult { get; set; }
        public DbSet<M0301ViTriThucHienTTPT> ViTriThucHien { get; set; }
        public DbSet<M0302PhieuThuThuatPhauThuatModel> M0302PhieuThuThuatPhauThuatModels { get; set; }
        public DbSet<M0301CheDoThuThuat> CheDoThuThuat { get; set; }
        public DbSet<M0301TaiBienBienChung> TaiBienBienChung { get; set; }
        public DbSet<M0301ThietBiTTPT> ThietBi { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<M0302ThongTinDoanhNghiep>().HasNoKey();
            modelBuilder.Entity<M0301DoiNguEkip>().ToTable("QL_TTPT_Ekip");
            modelBuilder.Entity<EkipResult>().HasNoKey().ToView(null);

            modelBuilder.Entity<HH_DM_KhoHang>().HasNoKey();
            modelBuilder.Entity<M0302PhieuThuThuatPhauThuatModel>().HasNoKey();
            modelBuilder.Entity<M0302ThuThuatPhauThuatModelList>().HasNoKey();
            modelBuilder.Entity<M0303TemplateTTPT>().HasIndex(v => v.ID)
                .IsUnique();
            modelBuilder.Entity<M0301ViTriThucHienTTPT>().HasIndex(v => v.ID)
                .IsUnique();
            modelBuilder.Entity<M0301CheDoThuThuat>().HasIndex(v => v.ID)
                .IsUnique();
            modelBuilder.Entity<M0301TaiBienBienChung>().HasIndex(v => v.ID)
                .IsUnique();
            modelBuilder.Entity<M0301ThietBiTTPT>().HasIndex(v => v.ID)
                .IsUnique();
            modelBuilder.Entity<M0303Khoa>().HasNoKey();
            base.OnModelCreating(modelBuilder);
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
