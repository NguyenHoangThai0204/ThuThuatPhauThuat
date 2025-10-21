using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;

namespace ThuThuatPhauThuat.Services.S0302
{
    public class S0301ICDService
    {
        private readonly IMemoryCache _cache;
        private readonly IWebHostEnvironment _env;
        private const string CacheKey = "IcdMasterData";

        public S0301ICDService(IMemoryCache cache, IWebHostEnvironment env)
        {
            _cache = cache;
            _env = env;
        }

        public List<M0302IcdModel> GetAllIcdData(bool yhct = false)
        {
            if (_cache.TryGetValue(CacheKey, out List<M0302IcdModel> icdList))
            {
                return icdList;
            }
            string fullPath = yhct ? Path.Combine(_env.WebRootPath, "dist/data/json/DM_ICDYHCT.json") : Path.Combine(_env.WebRootPath, "dist/data/json/DM_ICD.json");

            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException("Không tìm thấy file DM_ICD.json");
            }

            string jsonString = File.ReadAllText(fullPath);
            icdList = JsonSerializer.Deserialize<List<M0302IcdModel>>(jsonString);

            _cache.Set(CacheKey, icdList, new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromDays(1) // Giữ cache 1 ngày
            });

            return icdList;
        }
    }
}
