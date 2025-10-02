namespace ThuThuatPhauThuat.Services.S0305.IS0305
{
    public interface IS0305FtpService
    {
        Task<string> UploadFileAsync(IFormFile file, string remoteDirectory = "");
        Task<bool> DeleteFileAsync(string remoteFilePath);
        Task<bool> TestConnectionAsync();
        Task<Stream> DownloadAsync(string remoteFilePath);
    }
}
