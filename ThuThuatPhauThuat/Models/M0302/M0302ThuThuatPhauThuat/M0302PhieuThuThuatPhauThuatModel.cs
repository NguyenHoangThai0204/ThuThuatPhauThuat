namespace ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat
{
    public class M0302PhieuThuThuatPhauThuatModel
    {
        public string? SoPhieu { get; set; }
        public long? IDNguonBenh { get; set; }
        public DateTime? BatDauThuThuat { get; set; }
        public DateTime? KetThucThuThuat { get; set; }
        public string? NhomMau { get; set; }
        public string? NguoiKhoa { get; set; }
        public string? YeuToRh { get; set; }
        public long? IDPhieuTTPT { get; set; }
        //public long? ID { get; set; }
        //public string? NguoiKhoa { get; set; }
        public DateTime? ThoiGianKhoa { get; set; }
        public long? IDVaoVien { get; set; }
        public long? IDChiDinhChiTiet {  get; set; }
    }
    public class TaoPhieuResult
    {
        public long? IDPhieuTTPT { get; set; }
        public string? SoPhieu { get; set; }
    }
}
