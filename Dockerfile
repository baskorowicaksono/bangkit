# Common build stage
FROM node:14 as common-build-stage

COPY . ./app

WORKDIR /app

RUN npm install

# Development build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV development

CMD ["npm", "run", "dev"]
