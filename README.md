# ChatLog - AI Chat Application

![Vue.js](https://img.shields.io/badge/Vue.js-3.5.18-4FC08D?style=flat-square&logo=vue.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-7.0.6-646CFF?style=flat-square&logo=vite)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)

## 📋 Tổng quan

ChatLog là một ứng dụng chat AI hiện đại được xây dựng với Vue.js 3, Tailwind CSS và Vite. Ứng dụng cung cấp giao diện chat trực quan với khả năng quản lý lịch sử cuộc trò chuyện, chế độ dark/light theme và tích hợp API backend.

## ✨ Tính năng chính

### 🎨 Giao diện người dùng
- **Responsive Design**: Tương thích với mọi thiết bị (desktop, tablet, mobile)
- **Dark/Light Theme**: Chuyển đổi chế độ sáng/tối linh hoạt
- **Sidebar Collapsible**: Thanh bên có thể thu gọn/mở rộng
- **Modern UI**: Thiết kế hiện đại với Tailwind CSS
- **Custom Scrollbars**: Thanh cuộn tùy chỉnh theo theme

### 💬 Chức năng Chat
- **Real-time Chat**: Chat với AI thời gian thực
- **Message History**: Lưu trữ và quản lý lịch sử cuộc trò chuyện
- **Session Management**: Tạo, xóa và quản lý các phiên chat
- **Auto-resize Textarea**: Ô nhập tin nhắn tự động điều chỉnh kích thước
- **Loading Indicators**: Hiển thị trạng thái tải với animation

### 🔐 Xác thực & Bảo mật
- **User Authentication**: Đăng nhập/đăng xuất an toàn
- **Session Management**: Quản lý phiên đăng nhập
- **Route Guards**: Bảo vệ các route yêu cầu xác thực
- **API Integration**: Tích hợp với backend API

### 🛠️ Kỹ thuật
- **Vue 3 Composition API**: Sử dụng Composition API hiện đại
- **Vue Router**: Điều hướng SPA
- **Pinia Store**: Quản lý state toàn cục
- **Axios**: HTTP client cho API calls
- **Docker Support**: Containerization với Docker

## 🏗️ Cấu trúc dự án

```
log-chatbot/
├── public/                 # Static assets
│   └── hpt.ico            # Favicon
├── src/                   # Source code
│   ├── views/             # Vue components
│   │   ├── Chat.vue       # Main chat interface
│   │   └── Login.vue      # Login page
│   ├── stores/            # State management
│   │   └── auth.js        # Authentication store
│   ├── router/            # Vue Router
│   │   └── index.js       # Route configuration
│   ├── App.vue            # Root component
│   ├── main.js            # Application entry point
│   └── style.css          # Global styles
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker build configuration
├── nginx.conf             # Nginx configuration
├── package.json           # Dependencies & scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js         # Vite configuration
└── README.md              # Project documentation
```

## 🚀 Cài đặt & Chạy

### Yêu cầu hệ thống
- **Node.js**: >= 20.19.0 hoặc >= 22.12.0
- **npm**: >= 8.0.0
- **Docker**: >= 20.0.0 (tùy chọn)

### Phát triển local

1. **Clone repository**
```bash
git clone <repository-url>
cd log-chatbot
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy development server**
```bash
npm run dev
```

4. **Build production**
```bash
npm run build
```

### Docker Deployment

Xem [DEPLOYMENT.md](./DEPLOYMENT.md) để biết hướng dẫn deploy chi tiết.

## 🔧 Cấu hình

### Environment Variables

| Variable | Mô tả | Mặc định |
|----------|-------|----------|
| `VITE_API_BASE_URL` | URL của backend API | `http://localhost:8080` |

## 🔗 Tích hợp Backend API vào Frontend

- **Base URL**: điều khiển bởi biến môi trường `VITE_API_BASE_URL`.
  - Dev: Vite proxy các request bắt đầu bằng `/api` tới `VITE_API_BASE_URL` (xem `vite.config.js`).
  - Prod (Docker): Nginx proxy `/api` tới backend `http://app:8080` (xem `nginx.conf`).
- **Lưu ý**: Tất cả request trong frontend đều bắt đầu bằng `/api` để tương thích cả dev và prod.

### Endpoints frontend đang sử dụng

1) Đăng nhập
   - **POST** `/api/auth/login`
   - Body:
     ```json
     {"username":"tanhpt", "password":"admin123"}
     ```
   - Response mẫu:
     ```json
     {"success": true, "message": "Đăng nhập thành công", "username": "tanhpt"}
     ```
   - Frontend sử dụng: `src/stores/auth.js` → `login(credentials)`

2) Kiểm tra trạng thái đăng nhập
   - **GET** `/api/auth/check?username=<username>`
   - Response mẫu:
     ```json
     {"authenticated": true, "message": "Đã đăng nhập", "username": "tanhpt"}
     ```
   - Frontend sử dụng: `src/stores/auth.js` → `checkAuth()`

3) Đăng xuất
   - **POST** `/api/auth/logout`
   - Frontend sử dụng: `src/stores/auth.js` → `logout()`

4) Lấy danh sách phiên chat
   - **GET** `/api/chat-sessions`
   - Response: mảng các session rút gọn `{ sessionId, title, createdAt, lastActiveAt }`
   - Frontend sử dụng: `src/views/Chat.vue` → `loadChatSessions()`

5) Bắt đầu phiên chat mới (kèm tin nhắn đầu tiên)
   - **POST** `/api/chat-sessions/start`
   - Body:
     ```json
     {"content": "Tin nhắn đầu tiên"}
     ```
   - Response: đối tượng session, gồm `sessionId`
   - Frontend sử dụng: `src/views/Chat.vue` → `startNewSession(content)`

6) Lấy tin nhắn theo phiên
   - **GET** `/api/chat-sessions/{sessionId}/messages`
   - Response: mảng message `{ messageId, sender, content, timestamp }`
   - Frontend sử dụng: `src/views/Chat.vue` → `getLatestMessages(sessionId)`, `loadChat(index)`

7) Gửi tin nhắn vào phiên
   - **POST** `/api/chat-messages/{sessionId}`
   - Body:
     ```json
     {"sender": "USER", "content": "Nội dung"}
     ```
   - Response: đối tượng message vừa tạo
   - Frontend sử dụng: `src/views/Chat.vue` → `sendMessageToAPI(sessionId, content)`

8) Xóa phiên chat
   - **DELETE** `/api/chat-sessions/{sessionId}`
   - Frontend sử dụng: `src/views/Chat.vue` → `deleteSession(sessionId, index)`

### Gợi ý cấu hình nhanh
- Dev: tạo `./.env` trong thư mục frontend với `VITE_API_BASE_URL=http://localhost:8080` hoặc dùng mặc định.
- Prod (Docker): có thể build với `--build-arg VITE_API_BASE_URL=http://<backend-host>:8080` hoặc để Nginx proxy `/api` nội bộ.

## 🎨 Customization

### Theme Colors
Chỉnh sửa `tailwind.config.js` để thay đổi màu sắc:

```javascript
theme: {
  extend: {
    colors: {
      'dark': {
        100: '#1a1a1a',
        200: '#2d2d2d',
        300: '#3a3a3a',
        400: '#404040',
      }
    }
  }
}
```

### Custom Animations
Thêm animation tùy chỉnh trong `tailwind.config.js`:

```javascript
animation: {
  'typing': 'typing 1.4s infinite',
  'slide-in': 'slideIn 0.3s ease',
}
```

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với các breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🔍 Debugging

### Console Logs
Ứng dụng có logging chi tiết cho debugging:

<!-- 
docker-compose up --build

docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | sort

docker tag log-chatbot-frontend:latest vvqhuy1999/log-chatbot-frontend:latest

docker push vvqhuy1999/log-chatbot-frontend:latest 


-- server 

sudo docker pull vvqhuy1999/log-chatbot-frontend:latest


# Chạy container
sudo docker run -d \
  --name log-chatbot-frontend \
  -p 80:80 \
  -e VITE_API_BASE_URL=http://192.168.1.100:8080 \
  --restart unless-stopped \
  vvqhuy1999/log-chatbot-frontend:latest

  

  sudo docker stop log-chatbot-frontend

  sudo docker rm log-chatbot-frontend

  sudo docker rmi vvqhuy1999/log-chatbot-frontend:latest
-->