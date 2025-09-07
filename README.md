# log-chatbot

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
"# log-chatbot" 



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