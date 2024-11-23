# Use the official Node.js image as the base
FROM node:18
RUN apt-get update && apt-get install -y libreoffice-writer
# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose the application port
EXPOSE 3001

# Start the Node.js application
CMD ["node", "server.js"]
