using Microsoft.Extensions.Options;
using System.Net;
using ThuThuatPhauThuat.Configurations.FtpConfig;
using ThuThuatPhauThuat.Models.M0302.M0302DTO;
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

            // Tạo tên file unique
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";

            // Xử lý đường dẫn - bỏ "/" đầu nếu có
            remoteDirectory = remoteDirectory.TrimStart('/');
            var remoteFilePath = string.IsNullOrEmpty(remoteDirectory)
                ? fileName
                : $"{remoteDirectory}/{fileName}";

            var ftpUrl = $"ftp://{_ftpSettings.FtpHost}/{remoteFilePath}";

            //_logger.LogInformation($"Attempting to upload to: {ftpUrl}");

            try
            {
                // Tạo thư mục nếu chưa tồn tại
                if (!string.IsNullOrEmpty(remoteDirectory))
                {
                    await CreateDirectoryIfNotExistsAsync(remoteDirectory);
                }

                // Tạo FTP request
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
                //using (FtpWebResponse response = (FtpWebResponse)await request.GetResponseAsync())
                //{
                //    _logger.LogInformation($"Upload Complete, status: {response.StatusDescription}");
                //}

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
                    //_logger.LogInformation($"Delete Complete, status: {response.StatusDescription}");
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

                    //using (var response = (FtpWebResponse)await request.GetResponseAsync())
                    //{
                    //    _logger.LogInformation($"Created directory: {currentPath}");
                    //}
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
                    //_logger.LogInformation($"FTP Connection successful. Root directory content:\n{result}");
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

        public async Task<List<FtpFileInfo>> ListFilesInDirectoryAsync(string remoteDirectory)
        {
            var fileList = new List<FtpFileInfo>();

            remoteDirectory = remoteDirectory?.TrimStart('/') ?? "";
            var ftpUrl = string.IsNullOrEmpty(remoteDirectory)
                ? $"ftp://{_ftpSettings.FtpHost}/"
                : $"ftp://{_ftpSettings.FtpHost}/{remoteDirectory}";

            _logger.LogInformation($"Listing files in directory: {ftpUrl}");

            try
            {
                // ĐẦU TIÊN: Thử list đơn giản để xem format
                _logger.LogInformation("=== RAW FTP LISTING ===");

                FtpWebRequest simpleRequest = (FtpWebRequest)WebRequest.Create(ftpUrl);
                simpleRequest.Method = WebRequestMethods.Ftp.ListDirectory;
                simpleRequest.Credentials = new NetworkCredential(_ftpSettings.FtpUsername, _ftpSettings.FtpPassword);
                simpleRequest.UsePassive = true;

                using (var simpleResponse = (FtpWebResponse)await simpleRequest.GetResponseAsync())
                using (var simpleReader = new StreamReader(simpleResponse.GetResponseStream()))
                {
                    string simpleLine;
                    //while ((simpleLine = await simpleReader.ReadLineAsync()) != null)
                    //{
                    //    _logger.LogInformation($"SIMPLE: {simpleLine}");
                    //}
                }

                //_logger.LogInformation("=== DETAILED FTP LISTING ===");

                // Sau đó lấy detailed listing
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpUrl);
                request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
                request.Credentials = new NetworkCredential(_ftpSettings.FtpUsername, _ftpSettings.FtpPassword);
                request.UsePassive = true;
                request.KeepAlive = false;

                using (FtpWebResponse response = (FtpWebResponse)await request.GetResponseAsync())
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    string line;
                    while ((line = await reader.ReadLineAsync()) != null)
                    {
                        //_logger.LogInformation($"DETAIL: {line}");

                        if (string.IsNullOrWhiteSpace(line)) continue;

                        var fileInfo = ParseFtpListLine(line, remoteDirectory);
                        if (fileInfo != null)
                        {
                            //_logger.LogInformation($"Parsed: {fileInfo.FileName} (Dir: {fileInfo.IsDirectory})");

                            // Chỉ lấy file ảnh
                            var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
                            var extension = Path.GetExtension(fileInfo.FileName).ToLowerInvariant();

                            if (!fileInfo.IsDirectory && imageExtensions.Contains(extension))
                            {
                                fileList.Add(fileInfo);
                            }
                        }
                    }
                }

                _logger.LogInformation($"Found {fileList.Count} image(s) in directory");
                return fileList;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error listing directory: {ex.Message}");
                throw;
            }
        }

        private FtpFileInfo ParseFtpListLine(string line, string currentDirectory)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(line) || line.Contains(" .") || line.Contains(" .."))
                    return null;

                var parts = line.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

                if (parts.Length < 9)
                {
                    return ParseWindowsFormat(line, currentDirectory);
                }

                var permissions = parts[0];
                var isDirectory = permissions.StartsWith("d");

                var dateTimeParts = 0;
                for (int i = 5; i < parts.Length - 1; i++)
                {
                    if (DateTime.TryParse($"{parts[i]} {parts[i + 1]} {parts[i + 2]}", out _))
                    {
                        dateTimeParts = 3;
                        break;
                    }
                    if (DateTime.TryParse($"{parts[i]} {parts[i + 1]}", out _))
                    {
                        dateTimeParts = 2;
                        break;
                    }
                }

                var fileNameStartIndex = 5 + dateTimeParts;
                if (fileNameStartIndex >= parts.Length) return null;

                var fileName = string.Join(" ", parts.Skip(fileNameStartIndex));

                if (string.IsNullOrEmpty(fileName) || fileName == "." || fileName == "..")
                    return null;

                var fileInfo = new FtpFileInfo
                {
                    FileName = fileName,
                    FullPath = string.IsNullOrEmpty(currentDirectory) ? fileName : $"{currentDirectory}/{fileName}",
                    IsDirectory = isDirectory,
                    Size = isDirectory ? 0 : (long.TryParse(parts[4], out var size) ? size : 0),
                    FileType = isDirectory ? "directory" : Path.GetExtension(fileName).ToLowerInvariant().TrimStart('.')
                };

                // Parse modified date
                if (DateTime.TryParse($"{parts[5]} {parts[6]} {parts[7]}", out var modDate))
                {
                    fileInfo.ModifiedDate = modDate;
                }

                return fileInfo;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Failed to parse FTP line: {line}. Error: {ex.Message}");
                return null;
            }
        }

        private FtpFileInfo ParseWindowsFormat(string line, string currentDirectory)
        {
            try
            {
                // Windows format: 12-12-2023 12:00PM <DIR> FolderName
                // Windows format: 12-12-2023 12:00PM 12345 fileName.jpg
                var parts = line.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

                if (parts.Length < 4) return null;

                var isDirectory = line.Contains("<DIR>");
                var size = 0L;
                var fileNameStartIndex = 3;

                if (!isDirectory)
                {
                    // Là file - phần thứ 3 là kích thước
                    if (long.TryParse(parts[2], out var fileSize))
                    {
                        size = fileSize;
                    }
                    fileNameStartIndex = 3;
                }
                else
                {
                    fileNameStartIndex = 3; // Bỏ qua <DIR>
                }

                var fileName = string.Join(" ", parts.Skip(fileNameStartIndex));

                if (string.IsNullOrEmpty(fileName) || fileName == "." || fileName == "..")
                    return null;

                // Parse date
                DateTime? modDate = null;
                if (DateTime.TryParse($"{parts[0]} {parts[1]}", out var parsedDate))
                {
                    modDate = parsedDate;
                }

                return new FtpFileInfo
                {
                    FileName = fileName,
                    FullPath = string.IsNullOrEmpty(currentDirectory) ? fileName : $"{currentDirectory}/{fileName}",
                    IsDirectory = isDirectory,
                    Size = size,
                    ModifiedDate = modDate,
                    FileType = isDirectory ? "directory" : Path.GetExtension(fileName).ToLowerInvariant().TrimStart('.')
                };
            }
            catch
            {
                return null;
            }
        }
    }
}
