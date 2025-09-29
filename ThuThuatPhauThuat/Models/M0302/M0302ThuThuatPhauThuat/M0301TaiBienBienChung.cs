using System.ComponentModel.DataAnnotations.Schema;

namespace ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat
{
    [Table("BA_DM_TaiBienBienChung")]
    public class M0301TaiBienBienChung
    {
        public long ID { get; set; }
        public string Ma { get; set; } = string.Empty; 
        public string Ten { get; set; } = string.Empty;
        public bool Active { get; set; } = true;
    }
}
