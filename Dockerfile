FROM node:latest

WORKDIR /custodial_wallet

COPY package* .

RUN npm install

COPY . .

# EXPOSE 4000

CMD [ "npm","run","dev"]