using System;

namespace ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat
{
    public class M0302ThuThuatPhauThuatModelList
    {
        public string? MaBenhNhan { get; set; }       // bn.MaBN
        public string? TenBenhNhan { get; set; }      // bn.TenBN
        public string? Khan { get; set; }            // '' as Khan
        public string? NhomDichVuKyThuat { get; set; } // ndvkt.TenDichVu
        public string? DichVuKyThuat { get; set; }    // dvkt.TenDichVu
        public string? ThoiGian { get; set; }         // '' as ThoiGian
        public string? NoiThucHien { get; set; }      // '' as NoiThucHien
        public string? BacSiChiDinh { get; set; }     // nv.TenNhanVien
        public string? NoiChiDinh { get; set; }       // pb.TenPhong
        public int? NamSinh { get; set; }
        public string? GioiTinh { get; set; }
        public long? IdVaoVien { get; set; }
        public long? IDPhieuTTPT { get; set; }
        public long? IdChiDinhChiTiet { get; set; }
        public long? IdKhoa { get; set; }
        public bool? YHocCoTruyen { get; set; }
        public string? MaKhoa { get; set; } = null;
        //public bool? YHocCoTruyen { get; set; }
        public DateTime? NgayGioChiDinh { get; set; }
        public DateTime? BatDauThuThuat { get; set; }
        public DateTime? KetThucThuThuat { get; set; }
    }
}
