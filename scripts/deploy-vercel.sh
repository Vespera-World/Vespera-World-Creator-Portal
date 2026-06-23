#!/bin/bash
# Manual Vercel Deploy Script for Vespera Creator Portal
# Run this AFTER pushing to GitHub and updating env vars

set -euo pipefail

echo "=== Vespera Creator Portal — Vercel Deploy Guide ==="
echo ""

# Step 1: Verify project
if [ ! -f "package.json" ]; then
    echo "ERROR: Run this from the creator-portal-vespera directory"
    exit 1
fi

echo "Step 1/5: Login to Vercel"
echo "  Run: vercel login"
echo ""

echo "Step 2/5: Link project (if new)"
echo "  Run: vercel --yes"
echo "  Or if project already exists:"
echo "  Run: vercel link"
echo "  Select: Vespera-World/Vespera-World-Creator-Portal"
echo ""

echo "Step 3/5: Set environment variables"
echo "  Run the following commands:"
echo ""
cat << 'VARS'
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_TOLGEE_API_KEY production
vercel env add NEXT_PUBLIC_TOLGEE_API_URL production
vercel env add NEXT_PUBLIC_CHATWOOT_URL production
vercel env add CHATWOOT_API_KEY production
vercel env add CHATWOOT_ACCOUNT_ID production
VARS
echo ""

echo "Step 4/5: Pull latest from GitHub"
echo "  git pull origin main"
echo ""

echo "Step 5/5: Deploy"
echo "  Run: vercel --prod"
echo ""

echo "=== Alternative: Git-based deploy ==="
echo "If you linked GitHub to Vercel:"
echo "  Push to main → auto-deploys"
echo "  Current commit: $(git rev-parse --short HEAD)"
echo ""

echo "Done. Check https://vercel.com/dashboard for status."
