# Estágio 1: Build da aplicação Expo Web
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

ENV EXPO_PUBLIC_API_URL=https://apiakh.elohdigital.com.br/api/v1
RUN npx expo export --platform web

# Estágio 2: Servidor Web Nginx de Produção
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

