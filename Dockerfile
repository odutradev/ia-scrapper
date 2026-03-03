FROM node:20-alpine AS builder
ENV PUPPETEER_SKIP_DOWNLOAD=true
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
ENV PUPPETEER_SKIP_DOWNLOAD=true
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 1000
CMD ["npm", "run", "start"]