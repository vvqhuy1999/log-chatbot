# Log Chatbot - Docker Deployment

## 📁 Files Created

- `Dockerfile` - Multi-stage build cho production
- `nginx.conf` - Cấu hình Nginx với proxy API
- `docker-compose.yml` - Orchestration cho frontend và backend
- `.dockerignore` - Exclude files không cần thiết

## 🚀 Deployment Instructions

### Prerequisites
- Docker và Docker Compose đã được cài đặt
- Port 80 và 8080 available

### Quick Deploy

#### Trên Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Trên Windows:
```cmd
deploy.bat
```

### Manual Deploy

1. **Build Docker image:**
```bash
docker build -t log-chatbot:latest .
```

2. **Start services:**
```bash
docker-compose up -d
```

3. **Check status:**
```bash
docker-compose ps
```

## 🔧 Configuration

### Environment Variables

Tạo file `.env` nếu cần:
```env
NODE_ENV=production
API_URL=http://localhost:8080
```

### Custom Backend

Nếu bạn có backend riêng, cập nhật `docker-compose.yml`:

```yaml
backend:
  image: your-backend-image:latest
  # hoặc build từ source
  build:
    context: ./backend
    dockerfile: Dockerfile
```

### Custom Domain

Để deploy với domain name, cập nhật `nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    # ... rest of config
}
```

## 📊 Monitoring

### View logs:
```bash
docker-compose logs -f
```

### View specific service logs:
```bash
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Restart services:
```bash
docker-compose restart
```

## 🔒 Security

File nginx.conf đã include:
- Security headers
- Gzip compression
- Static file caching
- API proxy configuration

## 🌐 Access

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8080 (nếu có)

## 🛠 Troubleshooting

### Port conflicts:
```bash
# Check what's using port 80
sudo lsof -i :80

# Change port in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead
```

### Container not starting:
```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs --tail=100
```

### Rebuild after changes:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```
