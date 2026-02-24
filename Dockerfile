FROM ghcr.io/puppeteer/puppeteer:22.0.0
ENV RUNNING_IN_DOCKER=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PORT=1000
USER root
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN chown -R pptruser:pptruser /app
USER pptruser
EXPOSE 1000
CMD ["npm", "start"]
