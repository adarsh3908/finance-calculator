# Stage 1: Build the angular application
FROM node:18.19-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/finance_calculator /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
