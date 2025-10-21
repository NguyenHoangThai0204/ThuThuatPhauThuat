using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ThuThuatPhauThuat.Models.M0302
{
    [Table("DM_TemplateTTPT")]
    public class M0303TemplateTTPT
    {
        [Key]
        public long ID { get; set; }
        public long IDKhoa { get; set; }
        public string Ten { get; set; }
        public string NoiDung { get; set; }
        public string ThongTinLuocDo { get; set; }
        public bool Active { get; set; }
    }
}
