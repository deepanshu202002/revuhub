# FROM node:22-alpine as builder  
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .

# FROM node:22-alpine
# WORKDIR /app 
# COPY package*.json ./
# RUN npm ci --only=production
# COPY --from=builder /app ./
# EXPOSE 4000
# CMD ["node","index.js"]
# # builder


FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .


# final image
FROM node:22-alpine
WORKDIR /app
# Only copy production dependencies and app code
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app ./
EXPOSE 4000
CMD ["node", "index.js"]

