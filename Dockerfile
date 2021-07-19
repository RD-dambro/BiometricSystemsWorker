FROM node:14

# Create app directory
WORKDIR /usr/src/worker

# Bundle app source
COPY . .

RUN npm install

CMD [ "npm", "test" ]
EXPOSE 3100
