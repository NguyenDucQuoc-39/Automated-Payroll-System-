# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Install type definitions
Write-Host "Installing type definitions..."
npm install --save-dev @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs

# Generate Prisma client
Write-Host "Generating Prisma client..."
npx prisma generate

# Create database and run migrations
Write-Host "Creating database and running migrations..."
npx prisma migrate dev

Write-Host "Setup completed successfully!" 

#To run this app
- in backend run: npm run dev
- in frontend run: npm start
make sure you haved setting pgAdmin SQL.

#the way to run file seed.ts
npx prisma db seed