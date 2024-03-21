FROM node:18

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY api api
COPY routes routes
COPY example.env example.env
COPY app.js app.js

RUN npm install
EXPOSE 8000
ENTRYPOINT [ "node","app.js" ]
