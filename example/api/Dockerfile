FROM node:12-alpine
RUN apk --no-cache add git

# Working DIR
WORKDIR /usr/src/app

# Copy everything from current Folder
COPY . ./

# Set the env variables
ARG CONFIG_ID
RUN echo "CONFIG_ID=$CONFIG_ID"

# Running required steps to prepare the api prod build
RUN npm install
RUN npm run build

EXPOSE 4000

# Serve the prod build from the dist folder
CMD ["node", "./dist/index"]