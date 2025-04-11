# Use an official Node.js LTS image.
FROM node:16-alpine

# Create and set the working directory.
WORKDIR /app

# Copy package.json and tsconfig.json first to leverage Docker cache.
COPY package.json tsconfig.json ./

# Install dependencies.
RUN npm install --production

# Copy the rest of the application code.
COPY . .

# Build the TypeScript code.
RUN npm run build

# Expose port 3000 (or the port your app uses).
EXPOSE 3000

# Start the application.
CMD [ "npm", "start" ]