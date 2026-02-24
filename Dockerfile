FROM ghcr.io/puppeteer/puppeteer:22.0.0
ENV RUNNING_IN_DOCKER=true
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