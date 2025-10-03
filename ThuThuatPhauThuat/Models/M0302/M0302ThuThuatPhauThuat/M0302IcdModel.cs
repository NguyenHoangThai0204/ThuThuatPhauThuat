namespace ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat
{
    public class M0302IcdModel
    {
        public int id { get; set; }
        public string ma { get; set; } 
        public string ten { get; set; }
        public string viettat { get; set; } 
        public bool active { get; set; }
    }

    public class M0302IcdSearchItem
    {
        public string Ma { get; set; }
        public string Ten { get; set; }
        public string Ma_Ten { get; set; } 
    }
}
