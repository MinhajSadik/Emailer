FROM node
WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 1001
CMD ["npm", "start"]
