FROM node:lts-alpine
RUN apk --no-cache add wget

WORKDIR /build
COPY package*.json /build/
RUN npm install
COPY . /build

EXPOSE 3000
USER node

HEALTHCHECK --interval=30s --timeout=30s CMD wget localhost:3000/health -q -O/dev/null || exit 1

CMD ["node","index.mjs"]