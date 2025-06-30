# Stage 1: Build the client
FROM node:18 AS build

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./

RUN npm install

COPY client/ ./

RUN npm run build

# Debugging step: List contents of the build directory
RUN ls -l build

# Stage 2: Create the production server
FROM node:18

WORKDIR /app

COPY server/package.json server/package-lock.json ./

RUN npm install --production

COPY server/.env ./
COPY server/authorized_users.json ./

COPY server/ ./

COPY --from=build /app/client/build ./client/build

EXPOSE 3001

CMD [ "node", "src/index.js" ]
