using System.ComponentModel.DataAnnotations.Schema;

namespace ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat
{
    [Table("DM_NguonBenhTTPT")]
    public class M0302NguonBenhTTPT
    {
        public long ID { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public bool Active { get; set; }
    }
}
