FROM apify/actor-node-puppeteer-chrome:20
ENV RUNNING_IN_DOCKER=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PORT=1000
USER root
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build
RUN chown -R myuser:myuser /app
USER myuser
EXPOSE 1000
CMD ["npm", "run", "start"]
