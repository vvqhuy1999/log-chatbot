# 🎨 Hướng dẫn cài đặt Frontend ChatLog

Tài liệu này hướng dẫn cách cài đặt và chạy ứng dụng ChatLog trên máy tính của bạn.

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt môi trường](#cài-đặt-môi-trường)
- [Tải và cài đặt dự án](#tải-và-cài-đặt-dự-án)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu hình Docker](#cấu-hình-docker)

## 🖥️ Yêu cầu hệ thống

### Phần mềm cần thiết
- **Node.js**: Phiên bản 22.15.1 trở lên (đây là công cụ để chạy ứng dụng web)
- **Git**: Để tải mã nguồn từ GitHub
- **Trình duyệt web**: Chrome, Firefox, Safari, Edge

### Hệ điều hành hỗ trợ
- **Windows**: Windows 10/11
- **Linux**: Ubuntu 18.04+, CentOS 8+, Debian 10+

## 🔧 Cài đặt môi trường

### 1. Cài đặt Node.js

#### Linux (Ubuntu/Debian)
```bash
# Tải và cài đặt Node.js phiên bản 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra xem đã cài đặt thành công chưa
node --version
npm --version
```

**Giải thích**: Node.js là công cụ cần thiết để chạy ứng dụng web. npm là công cụ quản lý các thư viện.

### 2. Cài đặt Git

#### Linux (Ubuntu/Debian)
```bash
# Cài đặt Git
sudo apt update
sudo apt install git

# Kiểm tra xem đã cài đặt thành công chưa
git --version
```

**Giải thích**: Git giúp tải mã nguồn từ GitHub về máy tính.

## 📥 Tải và cài đặt dự án

### 1. Tải mã nguồn từ GitHub

```bash
# Tải mã nguồn từ GitHub
git clone https://github.com/vvqhuy1999/log-chatbot.git

# Di chuyển vào thư mục dự án
cd log-chatbot
```

**Giải thích**: Lệnh này sẽ tải toàn bộ mã nguồn của ứng dụng ChatLog về máy tính.

### 2. Cài đặt các thư viện cần thiết

```bash
# Cài đặt tất cả các thư viện cần thiết
npm install

# Kiểm tra xem đã cài đặt thành công chưa
npm list --depth=0
```

**Giải thích**: npm install sẽ tải và cài đặt tất cả các thư viện mà ứng dụng cần để hoạt động.

## 🏗️ Cấu trúc dự án

```
log-chatbot/
├── 📁 public/                    # Các file tĩnh (hình ảnh, icon)
│   └── hpt.ico                  # Icon của website
├── 📁 src/                      # Mã nguồn chính của ứng dụng
│   ├── 📁 views/                # Các trang web
│   │   ├── Chat.vue            # Trang chat chính
│   │   └── Login.vue           # Trang đăng nhập
│   ├── 📁 stores/               # Quản lý trạng thái ứng dụng
│   │   └── auth.js             # Quản lý đăng nhập/đăng xuất
│   ├── 📁 router/               # Điều hướng giữa các trang
│   │   └── index.js            # Cấu hình các đường dẫn
│   ├── App.vue                 # Component gốc
│   ├── main.js                 # File khởi động ứng dụng
│   └── style.css               # CSS toàn cục
├── 📁 dist/                     # File build (tạo sau khi build)
├── 📁 node_modules/             # Các thư viện đã cài đặt
├── 📄 package.json             # Thông tin dự án và các thư viện
├── 📄 Dockerfile               # Cấu hình Docker
├── 📄 nginx.conf               # Cấu hình web server
└── 📄 README.md                # Hướng dẫn dự án
```

**Giải thích**: 
- `src/` chứa toàn bộ mã nguồn của ứng dụng
- `public/` chứa các file tĩnh như icon, hình ảnh
- `node_modules/` chứa các thư viện đã cài đặt
- `dist/` sẽ được tạo khi build ứng dụng

## 🚀 Chạy ứng dụng

### 1. Chạy ở chế độ phát triển

```bash
# Khởi động ứng dụng
npm run dev

# Ứng dụng sẽ chạy tại: http://localhost:5173
```

**Giải thích**: 
- `npm run dev` khởi động server phát triển
- Có thể mở trình duyệt và truy cập `http://localhost:5173` để xem ứng dụng
- Khi thay đổi code, ứng dụng sẽ tự động cập nhật

### 2. Kiểm tra ứng dụng

```bash
# Mở trình duyệt và truy cập
http://localhost:5173
```

**Giải thích**: Đây là địa chỉ để truy cập ứng dụng trên trình duyệt.

### 3. Tính năng Hot Reload

- Khi  thay đổi code, ứng dụng sẽ tự động reload
- Không cần refresh trình duyệt thủ công
- Vue DevTools sẽ hoạt động để debug

**Giải thích**: Hot reload giúp bạn thấy ngay kết quả khi thay đổi code.

## 🔧 Environment Variables

### Sử dụng trong code

```javascript
// Trong Vue components
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE
```

**Giải thích**: Environment variables giúp cấu hình các thông số khác nhau cho các môi trường khác nhau (phát triển, sản xuất).

## 🐳 Cấu hình Docker

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:22.15.1-alpine as build-stage  # Tạo container Node.js để build

WORKDIR /app                              # Đặt thư mục làm việc
COPY package*.json ./                     # Copy file dependencies
RUN npm ci                                # Cài đặt thư viện

COPY . .                                  # Copy toàn bộ mã nguồn
ARG VITE_API_BASE_URL=http://localhost:8080  # Biến có thể thay đổi khi build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}   # Đặt biến môi trường

RUN npm run build                         # Build ứng dụng thành file tĩnh

FROM nginx:alpine as production-stage     # Tạo container Nginx để chạy
COPY nginx.conf /etc/nginx/nginx.conf     # Copy cấu hình Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html  # Copy file build vào Nginx

EXPOSE 80                                 # Mở port 80
CMD ["nginx", "-g", "daemon off;"]        # Khởi động Nginx
```
**Giải thích**: 
- Dockerfile giúp tạo container chứa ứng dụng
- Multi-stage build giúp tối ưu kích thước container
- Nginx được sử dụng để serve ứng dụng web

### Nginx là gì?

**Nginx** là một web server mạnh mẽ được sử dụng để:
- **Phục vụ file tĩnh**: HTML, CSS, JavaScript, hình ảnh
- **Proxy**: Chuyển tiếp request đến backend
- **Load balancing**: Phân tải traffic
- **SSL/TLS**: Hỗ trợ HTTPS
- **Caching**: Tăng tốc độ tải trang

### Tại sao dùng Nginx?

- **Hiệu suất cao**: Xử lý hàng nghìn request đồng thời
- **Nhẹ**: Tiêu tốn ít tài nguyên
- **Ổn định**: Ít crash, uptime cao
- **Bảo mật**: Có nhiều tính năng bảo mật
- **Dễ cấu hình**: File config đơn giản

### Cấu hình Nginx trong dự án

File `nginx.conf` được copy vào container để:
- Cấu hình port 80
- Serve file từ thư mục `/usr/share/nginx/html`
- Xử lý routing cho SPA (Single Page Application)
- Proxy API requests đến backend



## 🔍 Troubleshooting

### 1. Lỗi Node.js version

```bash
# Kiểm tra phiên bản Node.js
node --version

# Nếu phiên bản thấp hơn 22.15.1, cài đặt lại
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Giải thích**: Ứng dụng cần Node.js phiên bản 22.15.1 trở lên để hoạt động.

### 2. Lỗi npm install

```bash
# Xóa thư mục node_modules và package-lock.json
rm -rf node_modules package-lock.json

# Cài đặt lại
npm install
```

**Giải thích**: Đôi khi việc cài đặt bị lỗi, xóa và cài đặt lại sẽ giải quyết vấn đề.

### 3. Lỗi port đã được sử dụng

```bash
# Kiểm tra port 5173 có đang được sử dụng không
netstat -tulpn | grep 5173

# Tắt process đang sử dụng port
sudo kill -9 <PID>
```

**Giải thích**: Port 5173 có thể đang được sử dụng bởi ứng dụng khác.

### 4. Lỗi timeout khi gửi tin nhắn

**Lỗi**: `timeout of 10000ms exceeded`

**Nguyên nhân**: 
- Backend xử lý chậm
- Kết nối mạng không ổn định
- Backend không phản hồi

**Giải pháp**:
- ✅ **Timeout đã được tăng lên 30 giây**
- ✅ **Có retry mechanism tự động (2 lần)**
- ✅ **Hiển thị "Đang thử lại kết nối..." khi retry**

**Cơ chế Retry**:
- **Timeout**: 30 giây thay vì 10 giây
- **Retry**: Tự động thử lại 2 lần khi timeout
- **Delay**: 2 giây giữa các lần retry
- **Indicator**: Hiển thị trạng thái retry cho user

**Kiểm tra**:
```bash
# Kiểm tra backend có chạy không
curl http://localhost:8080/api/chat-sessions

# Kiểm tra kết nối mạng
ping localhost
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. **Kiểm tra logs**: Chạy `npm run dev` và xem thông báo lỗi
2. **Kiểm tra Node.js version**: Chạy `node --version`
3. **Kiểm tra dependencies**: Chạy `npm list`

**Lưu ý**: Nếu vẫn gặp vấn đề, hãy kiểm tra lại các bước cài đặt hoặc liên hệ team phát triển.

---

**Chúc bạn thành công! 🚀**