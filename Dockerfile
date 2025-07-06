# 1. Use Node.js to build the app
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your project files
COPY . .

# Build the app
RUN npm run build

# 2. Use Nginx to serve the built app
FROM nginx:alpine

# Copy the built output to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: Replace Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]