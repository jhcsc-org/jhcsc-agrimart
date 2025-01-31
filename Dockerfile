FROM node:22-alpine

WORKDIR /application

# Copy package.json and yarn.lock first to leverage Docker layer caching
COPY package.json yarn.lock patch-admin.sh ./

# Install dependencies in a separate layer
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

EXPOSE 9000

CMD ["yarn", "dev"]