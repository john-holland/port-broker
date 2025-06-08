FROM node:20-slim

WORKDIR /app

# Copy local files instead of cloning
COPY . .

RUN npm install

EXPOSE 8765
CMD ["npm", "start"] 