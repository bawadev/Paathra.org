#!/bin/bash

# Playwright Test Runner Script for Dhaana Project
echo "🎭 Running Playwright Tests for Dhaana"
echo "======================================"

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Development server not running. Starting..."
    npm run dev &
    DEV_PID=$!
    echo "⏳ Waiting for dev server to start..."
    sleep 10
    
    # Wait for server to be ready
    while ! curl -s http://localhost:3000 > /dev/null; do
        echo "⏳ Still waiting for dev server..."
        sleep 2
    done
    echo "✅ Dev server is ready!"
else
    echo "✅ Dev server is already running"
fi

echo ""
echo "🧪 Running tests..."

# Run different test suites
echo "1. Running basic home page tests..."
npx playwright test tests/home.spec.ts --reporter=list

echo ""
echo "2. Running authentication tests..."
npx playwright test tests/auth-with-login.spec.ts --reporter=list

echo ""
echo "3. Running donation tests..."
npx playwright test tests/donations.spec.ts --reporter=list

echo ""
echo "4. Running admin tests..."
npx playwright test tests/admin-authenticated.spec.ts --reporter=list

echo ""
echo "🎯 Test run complete! Check test-results/ for screenshots"
echo "📊 For detailed report, run: npm run test:report"

# Kill dev server if we started it
if [ ! -z "$DEV_PID" ]; then
    echo "🛑 Stopping dev server..."
    kill $DEV_PID
fi
