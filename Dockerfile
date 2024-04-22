FROM node:lts-alpine
WORKDIR /build
COPY package*.json /build/
RUN npm install
COPY . /build

EXPOSE 3000
USER node

CMD ["node","index.mjs"]