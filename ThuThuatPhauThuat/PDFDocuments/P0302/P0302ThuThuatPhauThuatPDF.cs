using DemoCauTruc.Models.M0302;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ThuThuatPhauThuat.Models.M0302.M0302ThuThuatPhauThuat;

public class P0302ThuThuatPhauThuatPDF : IDocument
{
    private readonly M0302ThongTinXuatPDFTTPTModel _data;
    private readonly M0302ThongTinDoanhNghiep _thongTinDoanhNghiep;
    private readonly string _logoPath;

    public P0302ThuThuatPhauThuatPDF(M0302ThongTinXuatPDFTTPTModel data, M0302ThongTinDoanhNghiep doanhNghiep)
    {
        _data = data ?? new M0302ThongTinXuatPDFTTPTModel();
        _thongTinDoanhNghiep = doanhNghiep ?? new M0302ThongTinDoanhNghiep
        {
            TenCSKCB = "Tên đơn vị",
            DiaChi = "",
            DienThoai = ""
        };
        _logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "dist", "img", "Logo-BVUB.jpg");
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(25);
            page.PageColor(Colors.White);
            page.DefaultTextStyle(x => x.FontFamily("Times New Roman").FontSize(12).FontColor(Colors.Black));

            page.Content().Column(column =>
            {
                // ===== HEADER =====
                column.Item().Row(row =>
                {
                    // Cột trái: logo + thông tin đơn vị
                    row.RelativeColumn(0.7f).Row(leftRow =>
                    {
                        // Logo
                        if (File.Exists(_logoPath))
                        {
                            leftRow.ConstantColumn(28).Height(28)
                                .Image(_logoPath, ImageScaling.FitArea);
                        }

                        // Khối text đặt trong một Column để xuống 2 dòng
                        leftRow.RelativeColumn().PaddingLeft(2).Column(col =>
                        {
                            col.Item().Text(_thongTinDoanhNghiep.TenCoQuanChuyenMon ?? "")
                                .Bold().FontSize(12).FontFamily("Times New Roman");
                            col.Item().Text(_thongTinDoanhNghiep.TenCSKCB ?? "")
                                .Bold().FontSize(12).FontFamily("Times New Roman");
                        });
                    });


                    // Cột phải: mã số
                    row.RelativeColumn(0.3f).Column(right =>
                    {
                        right.Item().Row(r =>
                        {
                            r.ConstantColumn(80).Text("Mã số:").Italic().FontSize(10).FontFamily("Times New Roman");
                            r.RelativeColumn().Text("14/BV-01").Italic().FontSize(10).FontFamily("Times New Roman");
                        });
                        right.Item().Row(r =>
                        {
                            r.ConstantColumn(80).Text("Mã số đợt/MYT:").Italic().FontSize(10).FontFamily("Times New Roman");
                            r.RelativeColumn().Text(_data.MaVaoVien ?? "")
                                .Bold().Italic().FontSize(10).FontFamily("Times New Roman");
                        });
                    });
                });

                //column.Item().Row(row =>
                //{
                //    // Cột trái: thông tin đơn vị
                //    row.RelativeColumn(0.7f).Column(left =>
                //    {
                //        left.Item().Text(_thongTinDoanhNghiep.TenCoQuanChuyenMon ?? "")
                //            .Bold().FontSize(12);
                //        left.Item().Text(_thongTinDoanhNghiep.TenCSKCB ?? "")
                //            .Bold().FontSize(12);
                //    });

                //    // Cột phải: mã số
                //    row.RelativeColumn(0.3f).Column(right =>
                //    {
                //        right.Item().Row(r =>
                //        {
                //            r.ConstantColumn(80).Text("Mã số:").Italic().FontSize(10);
                //            r.RelativeColumn().Text("14/BV-01").Italic().FontSize(10);
                //        });
                //        right.Item().Row(r =>
                //        {
                //            r.ConstantColumn(80).Text("Mã số đợt/MYT:").Italic().FontSize(10);
                //            r.RelativeColumn().Text(_data.MaVaoVien ?? "").Bold().Italic().FontSize(10);
                //        });
                //    });
                //});

                column.Item().PaddingTop(9);

                // ===== TIÊU ĐỀ =====
                column.Item().AlignCenter().Text("PHIẾU PHẪU THUẬT / THỦ THUẬT")
                    .FontFamily("Times New Roman").FontSize(16).Bold();

                column.Item().PaddingTop(9);

                // ===== THÔNG TIN NGƯỜI BỆNH =====
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(c =>
                    {
                        c.ConstantColumn(120);
                        c.RelativeColumn();
                        c.ConstantColumn(120);
                        c.RelativeColumn();
                    });

                    // Họ tên, Tuổi, Giới tính
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            // Label họ tên (chiếm 20%)
                            row.RelativeColumn(0.2f).Text("- Họ tên người bệnh: ");
                            // Giá trị họ tên (chiếm 40%)
                            row.RelativeColumn(0.45f).Text(_data.TenBN ?? "").Bold();

                            // Tuổi (label 10%, value 10%)
                            row.RelativeColumn(0.05f).Text("Tuổi: ");
                            row.RelativeColumn(0.1f).Text($"{(DateTime.Now.Year - (_data.NamSinh ?? DateTime.Now.Year))}").Bold();

                            // Giới tính (label 10%, value 10%)
                            row.RelativeColumn(0.1f).Text("Giới tính: ");
                            row.RelativeColumn(0.1f).Text(_data.TenGioiTinh ?? "").Bold();
                        });
                    });

                    // Khoa, Buồng, Giường
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
   
                            row.RelativeColumn(0.2f).Text("- Khoa/Phòng: ");
                            row.RelativeColumn(0.41f).Text(_data.Khoa ?? "").Bold();

              
                            row.RelativeColumn(0.07f).Text("Buồng: ");
                            row.RelativeColumn(0.1f).Text(_data.Buong).Bold();

              
                            row.RelativeColumn(0.12f).Text("Giường: ");
                            row.RelativeColumn(0.1f).Text(_data.Giuong).Bold();
                        });
                    });
                    // Ngày giờ
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(77).Text("- Vào viện lúc:");

                            if (_data.VaoVienLuc.HasValue)
                            {
                                var dt = _data.VaoVienLuc.Value;
                                row.RelativeColumn().Text(
                                    $"{dt:HH} giờ {dt:mm} phút {dt:ss} giây, ngày {dt:dd}-{dt:MM}-{dt:yyyy}"
                                ).Bold();
                            }
                            else
                            {
                                row.RelativeColumn().Text("").Bold();
                            }
                        });
                    });


                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(135).Text("- Phẩu thuật/ Thủ thuật lúc:");

                            if (_data.BatDauThuThuat.HasValue)
                            {
                                var dt = _data.BatDauThuThuat.Value;
                                row.RelativeColumn().Text($"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}").Bold();
                            }
                            else
                            {
                                row.RelativeColumn().Text("").Bold();
                            }
                        });
                    });
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(158).Text("- Phẩu thuật/ Thủ thuật kết thúc:");

                            if (_data.KetThucThuThuat.HasValue)
                            {
                                var dt = _data.KetThucThuThuat.Value;
                                row.RelativeColumn().Text($"{dt:HH} giờ {dt:mm} phút, ngày {dt:dd}-{dt:MM}-{dt:yyyy}").Bold();
                            }
                            else
                            {
                                row.RelativeColumn().Text("").Bold();
                            }
                        });
                    });

                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(65).Text("- Chẩn đoán: ");
                            row.ConstantColumn(142).Text("Trước phẫu thuật/ thủ thuật: ");
                            row.RelativeColumn().Text(_data.TenChanDoanTruoc ?? "").Bold();
                        });
                    });

                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(65).Text("");
                            row.ConstantColumn(136).Text("Sau phẫu thuật/ thủ thuật: ");
                            row.RelativeColumn().Text(_data.TenChanDoanSau ?? "").Bold();
                        });
                    });
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(178).Text("- Phương pháp phẫu thuật/ thủ thuật: ");
                            row.RelativeColumn().Text(_data.PhuongPhapTTPT ?? "").Bold();
                        });
                    });
         
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(120).Text("- Phương pháp vô cảm: ");
                            row.RelativeColumn().Text(_data.PhuongPhapVoCam ?? "").Bold();
                        });
                    });
                    // Can thiệp phẫu thuật
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(120).Text("- Can thiệp phẫu thuật: ");
                            row.RelativeColumn().Text(_data.CanThiepPhauThuat ?? "").Bold();
                        });
                    });

                    // Bác sĩ phẫu thuật
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(115).Text("- Bác sĩ phẫu thuật: ");
                            row.RelativeColumn().Text(_data.BacSiPhauThuat ?? "").Bold();
                        });
                    });

                    // Phụ mổ
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(80).Text("- Phụ mổ: ");
                            row.RelativeColumn().Text(_data.PhuTTPT ?? "").Bold();
                        });
                    });

                    // Bác sĩ gây mê
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(120).Text("- Bác sĩ gây mê: ");
                            row.RelativeColumn().Text(_data.BacSiGayMe ?? "").Bold();
                        });
                    });

                    // KTV gây mê
                    table.Cell().ColumnSpan(4).Element(cell =>
                    {
                        cell.PaddingBottom(5).Row(row =>
                        {
                            row.ConstantColumn(120).Text("- KTV gây mê: ");
                            row.RelativeColumn().Text(_data.KyThuatVienGayMe ?? "").Bold();
                        });
                    });

                });

                column.Item().PaddingTop(10);

                // ===== LƯỢC ĐỒ =====
                column.Item().Border(1).PaddingTop(5).Height(200).AlignCenter()
                    .Text("LƯỢC ĐỒ PHẪU THUẬT / THỦ THUẬT (vẽ hoặc mô tả)").FontSize(11).Italic();

                column.Item().PageBreak();

                // ===== TƯỜNG TRÌNH =====
                column.Item().Border(1).PaddingTop(5).Height(200).AlignCenter()
                .Text("TƯỜNG TRÌNH PHẪU THUẬT / THỦ THUẬT").FontSize(11).Italic();

                //column.Item().Text("TƯỜNG TRÌNH PHẪU THUẬT / THỦ THUẬT").Bold().FontSize(12);
                //column.Item().Text("(Ghi chi tiết các bước tiến hành, đặc điểm, xử trí)").FontSize(10).Italic();
                //column.Item().Border(1).Padding(10).Height(400)
                //    .Text("....................................................................................");

                column.Item().PaddingTop(20);

                // ===== CHỮ KÝ =====
                column.Item().Row(row =>
                {
                    row.RelativeColumn();
                    row.ConstantColumn(200).Column(c =>
                    {
                        c.Item().AlignCenter().Text($"Ngày {DateTime.Now:dd} tháng {DateTime.Now:MM} năm {DateTime.Now:yyyy}").Italic().FontSize(10);
                        c.Item().AlignCenter().Text("PHẨU THUẬT/ THỦ THUẬT VIÊN").Bold().FontSize(11);
                        c.Item().AlignCenter().Text("(Ký, ghi rõ họ tên)").Italic().FontSize(9);
                    });
                });
            });

            // Footer số trang
            page.Footer().AlignCenter().Text(x =>
            {
                x.CurrentPageNumber();
                x.Span(" / ");
                x.TotalPages();
            });
        });
    }
}

