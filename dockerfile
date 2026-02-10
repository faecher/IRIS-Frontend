# Stage 1: Build Vue app
FROM node:alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with nginx (includes config template)
FROM nginx:alpine
# Copy the built Vue app
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy YOUR custom nginx config
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]