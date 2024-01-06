# Use the official Node.js image with Yarn
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package*.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Start the application
CMD ["yarn", "start"]
