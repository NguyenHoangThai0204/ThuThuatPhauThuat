namespace ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat
{
    public class M0302ThongTinThuThuatPhauThuatModel
    {
        // Thông tin phiếu
        public long? IDPhieuTTPT { get; set; }
        public string? IDChanDoanVao { get; set; }
        public string? IDChanDoanTruoc { get; set; }
        public string? IDChanDoanSau { get; set; }
        public string? MaChanDoanVao { get; set; }
        public string? TenChanDoanVao { get; set; }
        public string? MaChanDoanTruoc { get; set; }
        public string? TenChanDoanTruoc { get; set; }
        public string? MaChanDoanSau { get; set; }
        public string? TenChanDoanSau { get; set; }

        // Join với DM
        public long? IDPhongThucHien { get; set; }
        public long? IDLoaiTTPT { get; set; }
        public long? IDThietBi { get; set; }
        public string? CanThiepThuThuat { get; set; }
        public long? IDTaiBienBienChung { get; set; }
        public long? IDCheDoThuThuat { get; set; }

        // Các thông tin khác
        public int? SoLanMoLai { get; set; }
        public string? LyDoMoLai { get; set; }
        public long? IDViTriThucHien { get; set; }
        public string? DanLuu { get; set; }
        public DateTime? NgayRutOngDanLuu { get; set; }
        public DateTime? NgayCatChi { get; set; }
        public string? Khac { get; set; }
        public long? MaFNA { get; set; }
        public string? TienCan { get; set; }
        public string? KetQuaXNFNAGBP { get; set; }
        public string? ChiDinhViTriTonThuongFNA { get; set; }
        public string? YeuCauXetNghiem { get; set; }
        public long? IDTuVong { get; set; }
        public long? IDPhuongPhapVoCam { get; set; }
    }
}
