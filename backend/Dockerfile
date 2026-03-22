FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# Copy source code
COPY . .

# Expose backend API port
EXPOSE 3000

# Start script
CMD ["npm", "start"]
