FROM node:20-slim
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PORT=1000
ENV DISPLAY=:99
RUN apt-get update && apt-get install -y chromium xvfb --no-install-recommends && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 1000
CMD ["xvfb-run", "--server-args=-screen 0 1280x720x24", "npm", "start"]
