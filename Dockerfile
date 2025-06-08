FROM node:20-slim

WORKDIR /app

# Install git
RUN apt-get update && apt-get install -y git

# Clone the port broker repo
RUN git clone https://github.com/john-holland/port-broker.git .

RUN npm install

EXPOSE 8765
CMD ["npm", "start"] 