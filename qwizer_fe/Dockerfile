FROM node:18-alpine

RUN apk add --no-cache git
WORKDIR /app

COPY ./qwizer_fe ./qwizer_fe

# Comentar si se quiere usar codigo local
# COPY ./.git ./.git
# RUN git checkout -f 5402ac1d31eba657c7c71f58e9c954d4cff736e8

RUN cd qwizer_fe && npm install --silent

COPY ./qwizer_fe/.env ./qwizer_fe/vite.config.js ./qwizer_fe/
WORKDIR /app/qwizer_fe

CMD ["npm", "start"]
