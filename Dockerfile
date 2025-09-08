# Dockerfile cho ứng dụng Vue.js
FROM node:22.15.1-alpine as build-stage # Stage build với Node.js 22 trên Alpine

# Đặt thư mục làm việc
WORKDIR /app # Các lệnh sau chạy trong /app

# Sao chép file package
COPY package*.json ./ # Sao chép file package trước để tận dụng cache layer của Docker

# Cài đặt tất cả phụ thuộc (kể cả devDependencies để build)
RUN npm ci # Cài sạch phụ thuộc dựa trên package-lock.json

# Sao chép mã nguồn
COPY . . # Sao chép toàn bộ dự án vào image

# Nhận biến API base URL lúc build; mặc định dùng localhost khi dev
ARG VITE_API_BASE_URL=http://localhost:8080 # Định nghĩa biến tại thời điểm build (mặc định)
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} # Đặt biến môi trường cho quá trình build

# Build ứng dụng
RUN npm run build # Sinh ra tài nguyên production trong /dist

# Stage chạy production
FROM nginx:alpine as production-stage # Dùng Nginx để phục vụ file tĩnh

# Sao chép cấu hình nginx tuỳ chỉnh
COPY nginx.conf /etc/nginx/nginx.conf # Dùng cấu hình có rule proxy

# Sao chép app đã build từ stage build
COPY --from=build-stage /app/dist /usr/share/nginx/html # Đưa file build vào web root của Nginx

# Mở cổng 80
EXPOSE 80 # Container lắng nghe cổng 80

# Khởi động nginx
CMD ["nginx", "-g", "daemon off;"] # Chạy Nginx ở foreground (không tách daemon)
