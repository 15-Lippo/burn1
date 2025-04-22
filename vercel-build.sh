#!/bin/bash

# Imposta NODE_ENV a production
export NODE_ENV=production

# Build frontend
npm run build

# Create output directories if they don't exist
mkdir -p .vercel/output/static
mkdir -p .vercel/output/functions

# Copy static assets
cp -r dist/* .vercel/output/static/

# Create a serverless function for the API
cat > .vercel/output/functions/api.func/.vc-config.json << EOL
{
  "runtime": "nodejs18.x",
  "handler": "index.js",
  "launcherType": "Nodejs"
}
EOL

# Copy the server code into the serverless function
cp -r server/* .vercel/output/functions/api.func/

# Create a config.json
cat > .vercel/config.json << EOL
{
  "version": 3,
  "routes": [
    { "src": "/api/(.*)", "dest": "/api" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
EOL

echo "Build completed for Vercel deployment"