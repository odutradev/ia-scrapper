FROM ghcr.io/puppeteer/puppeteer:22.0.0
ENV RUNNING_IN_DOCKER=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PORT=1000
ENV DISPLAY=:99
USER root
RUN apt-get update && apt-get install -y xvfb --no-install-recommends && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN chown -R pptruser:pptruser /app
USER pptruser
EXPOSE 1000
CMD ["xvfb-run", "--server-args=-screen 0 1280x720x24", "npm", "start"]
