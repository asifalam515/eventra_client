# Deployment Guide - Vercel

This guide walks you through deploying the Eventra Client to Vercel.

## Prerequisites

1. **Vercel Account**: Create a free account at [vercel.com](https://vercel.com)
2. **Git Repository**: Your project is already initialized with Git
3. **GitHub Account**: Push your repo to GitHub (Vercel integrates with GitHub/GitLab/Bitbucket)

> ✅ **Routing & Authentication**: The `proxy.ts` file is already configured with all authentication guards, role-based redirects, and protected routes.

## Step 1: Push to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Create a new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/eventra-client.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy from project directory
vercel
```

Follow the prompts:

- Link to existing project or create a new one
- Choose GitHub as your Git provider
- Select the repository
- Vercel will auto-detect Next.js

### Option B: Using Vercel Dashboard (Web UI)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Select **Import Git Repository**
4. Connect your GitHub account
5. Select the `eventra-client` repository
6. Click **Import**

## Step 3: Configure Environment Variables

In the Vercel Dashboard:

1. Go to your project → **Settings → Environment Variables**
2. Add the following variables:

```
NEXT_PUBLIC_BASE_URL = https://eventraserver.vercel.app
NEXT_PUBLIC_API_URL = https://eventraserver.vercel.app/api/v1
JWT_SECRET_KEY = your_jwt_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_YOUR_STRIPE_LIVE_TEST_KEY
```

> ⚠️ **Important**: Only use `NEXT_PUBLIC_*` variables for values that should be exposed to the frontend. `JWT_SECRET_KEY` should remain server-only if needed, but in this project it's used for client-side token verification.

## Step 4: Configure Build Settings

Vercel auto-detects Next.js, but verify these settings:

- **Framework Preset**: Next.js ✓
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Routing**: Next.js Proxy (`proxy.ts`) ✓ already configured

These are already configured in `vercel.json`. The `proxy.ts` file handles:

- Authentication redirects
- Protected routes (dashboard, create-event)
- Role-based access control
- Login/signup gating

## Step 5: Deploy

1. **First Deploy**: After connecting your Git repository, Vercel automatically builds and deploys
2. **Monitor Deployment**: Watch the logs in real-time
3. **Preview**:
   - Your app will be available at: `https://YOUR_PROJECT_NAME.vercel.app`
   - Each pull request gets an automatic preview deployment

## Step 6: Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Click **Add Domain**
3. Enter your custom domain
4. Update DNS records according to Vercel's instructions

## Deployment Dashboard Features

- **Automatic Deployments**: Every push to `main` triggers a new deployment
- **Preview Deployments**: Pull requests get temporary preview URLs
- **Rollback**: You can instantly rollback to previous deployments
- **Analytics**: Monitor build times, page performance, and more

## Troubleshooting

### Build Fails

**Check logs**: Click on the failed deployment in Vercel Dashboard → "View Build Logs"

Common issues:

- Missing environment variables → Add to Environment Variables section
- TypeScript errors → Run `npm run typecheck` locally first
- Port conflicts → Vercel handles this automatically

### Environment Variables Not Loading

- Ensure variables are prefixed with `NEXT_PUBLIC_` for frontend use
- Redeploy after adding environment variables (or use "Redeploy" button)
- Check spelling matches exactly

### API Connection Issues

1. Verify `NEXT_PUBLIC_API_URL` points to correct backend
2. Ensure backend CORS is configured to accept requests from your Vercel domain
3. Check firewall rules on backend server

### Stripe Integration Issues

- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct (starts with `pk_test_` or `pk_live_`)
- Use test keys during development, switch to live keys for production
- Update webhook URLs in Stripe Dashboard to point to new Vercel domain

## Post-Deployment Checklist

- [ ] Environment variables are configured in Vercel
- [ ] Frontend loads without errors
- [ ] API calls work correctly
- [ ] Authentication (login/signup) functions
- [ ] Event creation and browsing work
- [ ] Payment flow works (if applicable)
- [ ] Search functionality works
- [ ] Theme switching works
- [ ] Mobile responsiveness is maintained

## Performance Optimization (Already Included)

- **Next.js Image Optimization**: Automatic image optimization via `next/image`
- **Code Splitting**: Automatic per-page code splitting
- **Caching**: Optimized caching headers for static assets
- **ISR (Incremental Static Regeneration)**: Configured in route handlers

## CI/CD Pipeline

Your deployment is now automated:

```
GitHub Push → Vercel Build → Tests → Deploy → Preview/Production
```

Every commit to `main` goes live automatically (production)
Every pull request gets a preview deployment

## Monitoring and Logs

**View Logs**:

1. Vercel Dashboard → Your Project
2. Click on a deployment
3. View real-time build or runtime logs

**Monitor Performance**:

- Vercel Analytics (included)
- Web Vitals dashboard
- Error tracking

## Redeployment

To redeploy without code changes:

1. Vercel Dashboard → Project
2. Click **Redeploy** on any previous deployment
3. Or just push an empty commit: `git commit --allow-empty -m "Trigger deploy"` && `git push`

## Rollback to Previous Version

1. Vercel Dashboard → Project
2. Select a previous deployment
3. Click the **...** menu → **Promote to Production**

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Troubleshooting: https://vercel.com/support

---

**Project Status**: ✅ Ready for Deployment
**Estimated Deployment Time**: 2-5 minutes
**Next Deploy Trigger**: Push to main branch
