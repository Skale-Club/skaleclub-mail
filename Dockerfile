FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 9001 25 587 993

ENV PORT=9001

CMD ["node", "dist/server/index.js"]
