# Sổ Thu Chi

App quản lý thu chi bằng React + Vite. Bản đầu có tổng quan số dư, thêm/sửa/xóa giao dịch, danh mục tùy chỉnh, lưu LocalStorage, lọc theo tháng/loại giao dịch và ngân sách tháng.

## Chạy trên máy

Yêu cầu Node.js và npm. Mở terminal tại thư mục này, chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ được Vite in ra trong terminal (thường là `http://localhost:5173`).

## Lưu ý về dữ liệu

Dữ liệu được lưu trong LocalStorage của trình duyệt trên thiết bị hiện tại. Xóa dữ liệu trình duyệt có thể làm mất giao dịch. Bản này chưa đồng bộ giữa nhiều thiết bị.

## Đưa lên GitHub Pages

Đẩy thư mục dự án lên GitHub, vào **Settings → Pages**, chọn **GitHub Actions**. Có thể thêm workflow Vite để build và xuất bản; cấu hình xuất bản sẽ cần đặt `base` trong `vite.config.js` theo tên repository.
