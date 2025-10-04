#!/bin/bash

echo "🚀 Alpha Stream Analytics - Setup Script"
echo "=========================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your API keys and database credentials"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Ask if user wants to run migrations
echo ""
read -p "🗄️  Do you want to run database migrations now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running migrations..."
    npx prisma migrate dev --name init
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your credentials:"
echo "   - DATABASE_URL (PostgreSQL)"
echo "   - APIFY_API_TOKEN"
echo "   - ANTHROPIC_API_KEY"
echo "   - TWITTER_LIST_URL"
echo ""
echo "2. Make sure Redis is running:"
echo "   redis-server"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. In a separate terminal, start the workers:"
echo "   npm run worker"
echo ""
echo "5. Open http://localhost:3000"
echo ""
