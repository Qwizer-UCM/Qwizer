FROM node:18-alpine

WORKDIR /app

COPY ./qwizer_fe/package.json ./qwizer_fe/package-lock.json ./
RUN npm install --silent

COPY ./qwizer_fe/.env ./.env
COPY ./qwizer_fe ./

CMD ["npm", "start"]
