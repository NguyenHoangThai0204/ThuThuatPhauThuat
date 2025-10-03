namespace ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat
{
    public class M0301DoiNguEkip
    {
        public long ID { get; set; } // Khóa chính
        public long IDPhieuTTPT { get; set; }
        public long IDNhanVien { get; set; }
        public long IDVaiTro { get; set; }
        public string GhiChu { get; set; }

    }
}
