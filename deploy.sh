#!/bin/bash

# Honestly Dating App - Automated Deployment Script
# This script deploys your app to Vercel with all configuration

set -e  # Exit on any error

echo "🚀 Starting Honestly deployment..."
echo ""

# Load environment variables from .env.deploy if it exists
if [ -f .env.deploy ]; then
    echo "📝 Loading credentials from .env.deploy..."
    source .env.deploy
else
    echo "⚠️  .env.deploy not found!"
    echo "Create .env.deploy with your credentials first."
    echo "See .env.deploy.example for format."
    exit 1
fi

# Generate AUTH0_SECRET if not set
if [ -z "$AUTH0_SECRET" ]; then
    export AUTH0_SECRET="$(openssl rand -base64 32)"
fi

echo "✅ Environment variables configured"
echo ""

# Step 1: Generate Prisma Client
echo "📦 Generating Prisma Client..."
npm run db:generate
echo ""

# Step 2: Push database schema to Supabase
echo "🗄️  Pushing database schema to Supabase..."
npx prisma db push --accept-data-loss
echo ""

# Step 3: Deploy to Vercel
echo "☁️  Deploying to Vercel..."
echo ""
echo "NOTE: When Vercel asks questions, choose these answers:"
echo "  - Set up and deploy? → YES"
echo "  - Which scope? → (your account)"
echo "  - Link to existing project? → NO"
echo "  - Project name? → honestly (or whatever you want)"
echo "  - In which directory? → ./"
echo "  - Override settings? → NO"
echo ""
read -p "Press ENTER when ready to deploy..."

# Deploy to Vercel
vercel

# Get the deployment URL
echo ""
echo "📝 Now we need to add environment variables to Vercel..."
echo ""

# Add environment variables to Vercel
echo "Adding DATABASE_URL..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

echo "Adding ANTHROPIC_API_KEY..."
echo "$ANTHROPIC_API_KEY" | vercel env add ANTHROPIC_API_KEY production

echo "Adding AUTH0_SECRET..."
echo "$AUTH0_SECRET" | vercel env add AUTH0_SECRET production

echo "Adding USE_MOCK_AUTH..."
echo "true" | vercel env add USE_MOCK_AUTH production

echo ""
echo "🎯 Deploying to production with environment variables..."
vercel --prod

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Your app is live!"
echo "📱 Run 'vercel --prod' output above to see your URL"
echo ""
echo "Next steps:"
echo "1. Visit your Vercel URL"
echo "2. Sign up and create a profile"
echo "3. Test the matching flow"
echo ""
