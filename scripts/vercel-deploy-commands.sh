#!/bin/bash
# Vercel Deploy — copy-paste commands

echo "============================================"
echo "1. GO TO VERCEL DASHBOARD"
echo "   https://vercel.com/dashboard"
echo ""
echo "2. FIND YOUR EXISTING PROJECT"
echo "   Project: agency.vesperaworld.com"
echo ""
echo "3. CHANGE GIT SOURCE (CRITICAL!)"
echo "   Settings → Git → Repository"
echo "   Change from old repo to:"
echo "   github.com/Vespera-World/Vespera-World-Creator-Portal"
echo ""
echo "4. ADD ENVIRONMENT VARIABLES"
echo "   Settings → Environment Variables → Add ALL below:"
echo ""
echo "   NEXT_PUBLIC_SUPABASE_URL="
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY="
echo "   NEXT_PUBLIC_APP_URL=https://agency.vesperaworld.com"
echo "   NEXT_PUBLIC_TOLGEE_API_URL=http://tolgee-xxk9o1tlg2mg5qdtd99a2arz.20.228.65.111.sslip.io"
echo "   NEXT_PUBLIC_TOLGEE_API_KEY= (YOUR NEW KEY)"
echo "   NEXT_PUBLIC_CHATWOOT_URL=http://chatwoot-jd6pbg0j2nz2zs0sxj01fzvh.20.228.65.111.sslip.io"
echo "   CHATWOOT_API_KEY="
echo "   CHATWOOT_ACCOUNT_ID=1"
echo ""
echo "5. DEPLOY"
echo "   Click 'Redeploy' or push to main branch"
echo ""
echo "============================================"

# CLI mode (run only after vercel login)
# cd /home/user/creator-portal-vespera
# vercel --prod
