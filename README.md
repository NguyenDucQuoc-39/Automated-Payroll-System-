# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Install type definitions
Write-Host "Installing type definitions..."
npm install --save-dev @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs

# Generate Prisma client
Write-Host "Generating Prisma client..."
npx prisma generate

# Create database and run migrations
Write-Host "Creating database and running migrations..."
npx prisma migrate dev

Write-Host "Setup completed successfully!" 

#To run this app
- in backend run: npm run dev
- in frontend run: npm start
make sure you haved setting pgAdmin SQL.

#the way to run file seed.ts
npx prisma db seed

1. Thêm trường số điện thoại cho giảng viên
2. Học phần có thêm hệ số học phần.
3. Phân Công giảng dạy thêm chức năng chọn được nhiều lớp một lúc để phân công cho giảng viên (tránh thao tác phân công từng lớp một)
4. thống kê gồm: STT, Tên học kì....
5. Thiết lập số tiền một tiết ta thiết lập số tiền, ngày có hiệu lực, Hiển thị lịch sử danh sách định mức trước đây theo năm học.
6. Thiết lập hệ số lớp, nhập số min sinh viên, số mã sinh viên, hệ số, quy mô lớp. hiển thị bảng danh sách khoảng sinh viên, hệ số, quy mô lớp, trạng thái (áp dụng hoặc chưa áp dụng), Thao Tác.
7. Tính tiền dạy: tính tiền dạy hiện thị danh sách lớp đã dạy gồm tên lớp, hệ số học phần, hệ số lớp(số sinh viên), số tiết quy đổi.
- tìm kiếm thông tin: hiển thị giảng viên thuộc Khoa, Tiền dạy của Giảng Viên trong kì đấy.



3.1 Thiết lập hệ số một tiết.
| + thêm thiết lập| gồm chọn Năm Học, Nhập số tiền.
STT | Năm Học  | Số tiền một tiết|
1   |2023-2024 | 160.000         |

3.2 Gắn hệ số bằng cấp 
|+ thêm thiết lập| gồm nhập Năm Học áp dụng, các mục nhập hệ số cho Thạc Sĩ, Tiến Sĩ, Phó Giáo Sư, Giáo Sư.

STT| Năm Học   | ThS | TS  | PSG | GS |
1  | 2024-2025 | 1.5 | 2.0 | 2.5 | 3.0|

3.3 Thiết lập hệ số lớp 

|+ thêm thiết lập| gồm : Năm Học, thêm chức năng Sao Chép , chọn vào một năm cũ bất kì sao nó đến năm học mới.

STT | MinSV | MaxSV | Hệ Số| Thao Tác |
1   | 0     | 20    | -0.3 | 

3.4 Tính Tiền dạy
Năm Học (2024-2025) Kì Học (Học kì 1) chọn Khoa() chọn Giảng viên thuộc khoa
khi chọn xong sẽ hiển thị Mã Giảng Viên, Tên Giảng Viên, Khoa, Thông tin chi tiết
Khi ấn vào thông tin chi tiết sẽ hiện bảng thông tin gồm:
STT | Tên Lớp Học Phần | Mã Lớp Học Phần | Hệ số lớp | Hệ số học phần|  số tiết | số tiền/ tiết | Tổng số tiền |
