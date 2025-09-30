using CloudinaryDotNet.Actions;

namespace ThuThuatPhauThuat.Services.S0305.IS0305
{
    public interface IS0305CloudinaryService
    {
        Task<string?> UploadFileAsync(IFormFile file, string folderName);
        Task<bool> DeleteFileAsync(string publicId);
        Task<UsageResult> GetUsageAsync();
    }
}
