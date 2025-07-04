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

ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG SESSION_SECRET
ARG ADMIN_EMAIL

COPY server/package.json server/package-lock.json ./

RUN npm install --production

# Dynamically create .env using build arguments
RUN echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" > .env &&     echo "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" >> .env &&     echo "SESSION_SECRET=${SESSION_SECRET}" >> .env

COPY server/ ./

ENV ADMIN_EMAIL=${ADMIN_EMAIL}

RUN if [ -n "$ADMIN_EMAIL" ]; then echo "[ { \"email\": \"$(echo ${ADMIN_EMAIL} | tr '[:upper:]' '[:lower:]')\", \"isAdmin\": true } ]" > authorized_users.json; else echo "[]" > authorized_users.json; fi

COPY --from=build /app/client/build ./client/build

EXPOSE 3001

CMD [ "node", "src/index.js" ]