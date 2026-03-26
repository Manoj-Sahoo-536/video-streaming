#!/bin/bash

echo "=================================="
echo "Pre-Deployment Checklist"
echo "=================================="
echo ""

# Check if .env files exist
echo "✓ Checking environment files..."
if [ -f "server/.env" ]; then
    echo "  ✓ server/.env exists"
else
    echo "  ✗ server/.env missing!"
fi

if [ -f "client/.env" ]; then
    echo "  ✓ client/.env exists"
else
    echo "  ⚠ client/.env missing (optional)"
fi

echo ""
echo "✓ Checking dependencies..."
cd server
if [ -d "node_modules" ]; then
    echo "  ✓ Server dependencies installed"
else
    echo "  ✗ Server dependencies missing! Run: cd server && npm install"
fi
cd ..

cd client
if [ -d "node_modules" ]; then
    echo "  ✓ Client dependencies installed"
else
    echo "  ✗ Client dependencies missing! Run: cd client && npm install"
fi
cd ..

echo ""
echo "✓ Checking Git status..."
if [ -d ".git" ]; then
    echo "  ✓ Git repository initialized"
    
    if git remote -v | grep -q "origin"; then
        echo "  ✓ Git remote configured"
    else
        echo "  ⚠ Git remote not configured"
        echo "    Run: git remote add origin <your-repo-url>"
    fi
else
    echo "  ✗ Git not initialized!"
    echo "    Run: git init"
fi

echo ""
echo "=================================="
echo "Manual Checks Required:"
echo "=================================="
echo "[ ] Supabase schema applied (server/supabase/schema.sql)"
echo "[ ] Cloudinary account configured"
echo "[ ] GitHub repository created"
echo "[ ] Vercel account ready"
echo "[ ] Render/Railway account ready"
echo ""
echo "=================================="
echo "Next Steps:"
echo "=================================="
echo "1. Review DEPLOYMENT.md for detailed instructions"
echo "2. Push code to GitHub"
echo "3. Deploy backend to Render"
echo "4. Deploy frontend to Vercel"
echo "5. Update environment variables"
echo ""
