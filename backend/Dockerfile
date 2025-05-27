# tugas_akhir_tcc_alusista_negara/backend/Dockerfile
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you have a .npmrc file for private packages, copy it as well
# COPY .npmrc .

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

# The app binds to 0.0.0.0 and the port specified by the
# PORT environment variable.
# Cloud Run will set this PORT environment variable.
# EXPOSE 8080 # Not strictly necessary for Cloud Run, it injects PORT
CMD [ "node", "app.js" ]