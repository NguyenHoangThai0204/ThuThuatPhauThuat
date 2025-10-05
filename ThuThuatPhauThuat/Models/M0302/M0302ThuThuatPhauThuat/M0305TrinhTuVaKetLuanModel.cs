namespace ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat
{
    public class M0305TrinhTuVaKetLuanModel
    {
        public long? IDPhieuTTPT { get; set; }
        public string? TrinhTu { get; set; }
        public string? KetLuan { get; set; }
        public string? ThongTinLuocDo { get; set; }

        public List<AnhLuocDoClient>? AnhTruongTrinhSaveToServer { get; set; }
    }

    public class AnhLuocDoClient
    {
        public string? URL { get; set; }
        public string? TenAnh { get; set; }
    }
}
