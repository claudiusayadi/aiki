
# Use the official Node.js image as the base image
FROM node:20-alpine AS base

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE ${API_PORT}
EXPOSE ${EMAIL_PORT}

# Command to run the application
CMD ["sh", "-c", "yarn migration:run && node dist/src/main.js"]
