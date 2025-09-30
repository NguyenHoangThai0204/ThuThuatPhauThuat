namespace ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat
{
    public class M0305TrinhTuVaKetLuanModel
    {
        public long? IDPhieuTTPT { get; set; }
        public string? TrinhTu { get; set; }
        public string? KetLuan { get; set; }
        public List<HinhAnhModel?> DanhSachHinhAnh { get; set; }
    }

    public class HinhAnhModel
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string?  Src { get; set; }
    }
}
