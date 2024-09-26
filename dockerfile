FROM node:20-alpine3.19

WORKDIR /app

COPY . .

RUN apk add --no-cache samba-client

RUN apk add mongodb-tools

RUN npm install

RUN npm run build

RUN npm i pm2 -g

CMD ["npm", "run", "start"]
