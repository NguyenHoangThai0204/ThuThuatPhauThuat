using Microsoft.Extensions.Options;
using System.Net;
using ThuThuatPhauThuat.Configurations.FtpConfig;
using ThuThuatPhauThuat.Services.S0305.IS0305;

namespace ThuThuatPhauThuat.Services.S0305
{
    public class S0305FtpService : IS0305FtpService
    {
        private readonly FtpSettings _ftpSettings;
        private readonly ILogger<S0305FtpService> _logger;

        public S0305FtpService(IOptions<FtpSettings> ftpSettings, ILogger<S0305FtpService> logger)
        {
            _ftpSettings = ftpSettings.Value;
            _logger = logger;
        }

        public async Task<string> UploadFileAsync(IFormFile file, string remoteDirectory = "")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";

            remoteDirectory = remoteDirectory.TrimStart('/');
            var remoteFilePath = string.IsNullOrEmpty(remoteDirectory)
                ? fileName
                : $"{remoteDirectory}/{fileName}";

            var ftpUrl = $"ftp://{_ftpSettings.FtpHost}/{remoteFilePath}";

            _logger.LogInformation($"Attempting to upload to: {ftpUrl}");

            try
            {
                if (!string.IsNullOrEmpty(remoteDirectory))
                {
                    await CreateDirectoryIfNotExistsAsync(remoteDirectory);
                }

                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpUrl);
                request.Method = WebRequestMethods.Ftp.UploadFile;
                request.Credentials = new NetworkCredential(_ftpSettings.FtpUsername, _ftpSettings.FtpPassword);
                request.UseBinary = true;
                request.UsePassive = false; // Thử đổi sang Active mode
                request.KeepAlive = false;

                // Upload file
                using (var fileStream = file.OpenReadStream())
                using (var ftpStream = await request.GetRequestStreamAsync())
                {
                    await fileStream.CopyToAsync(ftpStream);
                }

                // Verify upload
                using (FtpWebResponse response = (FtpWebResponse)await request.GetResponseAsync())
                {
                    _logger.LogInformation($"Upload Complete, status: {response.StatusDescription}");
                }

                return remoteFilePath; // Trả về đường dẫn file trên FTP
            }
            catch (Exception ex)
            {
                _logger.LogError($"FTP Upload Error: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeleteFileAsync(string remoteFilePath)
        {
            var ftpUrl = $"ftp://{_ftpSettings.FtpHost}{remoteFilePath}";

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpUrl);
                request.Method = WebRequestMethods.Ftp.DeleteFile;
                request.Credentials = new NetworkCredential(_ftpSettings.FtpUsername, _ftpSettings.FtpPassword);

                using (FtpWebResponse response = (FtpWebResponse)await request.GetResponseAsync())
                {
                    _logger.LogInformation($"Delete Complete, status: {response.StatusDescription}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"FTP Delete Error: {ex.Message}");
                return false;
            }
        }

        // Thêm method tạo thư mục
        private async Task CreateDirectoryIfNotExistsAsync(string remoteDirectory)
        {
            var directories = remoteDirectory.Split('/');
            var currentPath = "";

            foreach (var dir in directories)
            {
                if (string.IsNullOrEmpty(dir)) continue;

                currentPath += $"/{dir}";
                var ftpUrl = $"ftp://{_ftpSettings.FtpHost}{currentPath}";

                try
                {
                    FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpUrl);
                    request.Method = WebRequestMethods.Ftp.MakeDirectory;
                    request.Credentials = new NetworkCredential(_ftpSettings.FtpUsername, _ftpSettings.FtpPassword);
                    request.UsePassive = true;

                    using (var response = (FtpWebResponse)await request.GetResponseAsync())
                    {
                        _logger.LogInformation($"Created directory: {currentPath}");
                    }
                }
                catch (WebException ex)
                {
                    // Thư mục đã tồn tại - bỏ qua lỗi
                    if (ex.Response is FtpWebResponse response)
                    {
                        if (response.StatusCode == FtpStatusCode.ActionNotTakenFileUnavailable)
                        {
                            _logger.LogInformation($"Directory already exists: {currentPath}");
                        }
                    }
                }
            }
        }

        // Thêm method test connection
        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                var ftpUrl = $"ftp://{_ftpSettings.FtpHost}/";
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpUrl);
                request.Method = WebRequestMethods.Ftp.ListDirectory;
                request.Credentials = new NetworkCredential(_ftpSettings.FtpUsername, _ftpSettings.FtpPassword);
                request.UsePassive = true;

                using (var response = (FtpWebResponse)await request.GetResponseAsync())
                using (var reader = new StreamReader(response.GetResponseStream()))
                {
                    var result = await reader.ReadToEndAsync();
                    _logger.LogInformation($"FTP Connection successful. Root directory content:\n{result}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"FTP Connection failed: {ex.Message}");
                return false;
            }
        }

        public async Task<Stream> DownloadAsync(string remoteFilePath)
        {
            if (string.IsNullOrWhiteSpace(remoteFilePath))
                throw new ArgumentException("Invalid file path");

            if (!remoteFilePath.StartsWith("/"))
                remoteFilePath = "/" + remoteFilePath;

            var ftpUrl = $"ftp://{_ftpSettings.FtpHost}{remoteFilePath}";

            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpUrl);
                request.Method = WebRequestMethods.Ftp.DownloadFile;
                request.Credentials = new NetworkCredential(_ftpSettings.FtpUsername, _ftpSettings.FtpPassword);
                request.UseBinary = true;
                request.UsePassive = true;
                request.KeepAlive = false;

                using (var response = (FtpWebResponse)await request.GetResponseAsync())
                using (var responseStream = response.GetResponseStream())
                {
                    var memoryStream = new MemoryStream();
                    await responseStream.CopyToAsync(memoryStream);
                    memoryStream.Position = 0;

                    _logger.LogInformation($"Download Complete, status: {response.StatusDescription}");
                    return memoryStream;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"FTP Download Error: {ex.Message}");
                throw;
            }
        }
    }
}
