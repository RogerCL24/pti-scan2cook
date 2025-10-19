FROM node:20-alpine AS builder
ARG VITE_API_BASE=http://backend:3000
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# Pass VITE_API_BASE as environment variable for the build
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config will proxy /api to the backend service name inside the compose network
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
