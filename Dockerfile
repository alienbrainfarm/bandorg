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

# Define build arguments for user emails
ARG SUPER_ADMIN_EMAIL
ARG NORMAL_USER_EMAIL

COPY server/package.json server/package-lock.json ./

RUN npm install --production

# Dynamically create .env and authorized_users.json using build arguments
RUN echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" > .env &&     echo "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" >> .env &&     echo "SESSION_SECRET=${SESSION_SECRET}" >> .env &&     echo "ADMIN_EMAIL=${SUPER_ADMIN_EMAIL}" >> .env

COPY server/ ./

COPY --from=build /app/client/build ./client/build

EXPOSE 3001

CMD [ "node", "src/index.js" ]