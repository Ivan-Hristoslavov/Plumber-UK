# Deployment Guide - Plumber Booking System

This guide explains how to deploy your plumber booking system using GitHub Actions.

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your `serenity-RapidFrame/plumber` repository
   - Set root directory to `ui`

3. **Configure Environment Variables in Vercel**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ilkalkvghslckvmpkxbb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your_secure_password
   ADMIN_NAME=Your Full Name
   ```

4. **Get Vercel Tokens**
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token
   - Copy your Organization ID and Project ID

### Option 2: Other Platforms

The system can also be deployed on:
- **Netlify**: Use the build.yml workflow
- **Railway**: Direct GitHub integration
- **DigitalOcean App Platform**: Connect GitHub repo
- **Heroku**: Use buildpacks for Next.js

## 🔧 GitHub Secrets Setup

Add these secrets to your GitHub repository:

1. **Go to Repository Settings**
   - Navigate to `https://github.com/serenity-RapidFrame/plumber/settings/secrets/actions`

2. **Add Repository Secrets**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ilkalkvghslckvmpkxbb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your_secure_password
   ADMIN_NAME=Your Full Name
   ```

3. **For Vercel Deployment, also add:**
   ```
   VERCEL_TOKEN=your_vercel_token
   ORG_ID=your_vercel_org_id
   PROJECT_ID=your_vercel_project_id
   ```

## 📋 Workflow Files

### `deploy.yml` - Full Vercel Deployment
- Triggers on push to `main` or `new-ui`
- Builds and deploys to Vercel
- Handles environment variables securely

### `build.yml` - Build and Test Only
- Tests on multiple Node.js versions
- Runs linting and type checking
- Creates build artifacts
- Good for testing before deployment

## 🔄 Deployment Process

1. **Push to Main Branch**
   ```bash
   git push origin main
   ```

2. **GitHub Actions Will:**
   - Install dependencies
   - Create environment file from secrets
   - Build the application
   - Run tests (if available)
   - Deploy to Vercel (if configured)

3. **Monitor Deployment**
   - Check GitHub Actions tab for build status
   - View deployment logs in Vercel dashboard

## 🛡️ Security Considerations

### Production Environment Variables
- Use **production** Stripe keys (not test keys)
- Set strong admin passwords
- Use HTTPS URLs for production
- Configure proper CORS settings in Supabase

### Webhook Configuration
- Update Stripe webhook URL to production domain
- Ensure webhook secret matches production environment
- Test webhook endpoints after deployment

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check all environment variables are set
   - Verify Supabase connection
   - Check for TypeScript errors

2. **Deployment Succeeds but App Doesn't Work**
   - Verify environment variables in deployment platform
   - Check browser console for errors
   - Ensure Supabase RLS policies allow production access

3. **Stripe Payments Not Working**
   - Verify webhook URL is correct
   - Check Stripe dashboard for webhook errors
   - Ensure production keys are being used

### Debug Commands
```bash
# Test build locally
cd ui && npm run build

# Check environment variables
cd ui && npm run dev

# View deployment logs
vercel logs your-deployment-url
```

## 📱 Post-Deployment Checklist

- [ ] Test booking form submission
- [ ] Verify admin panel login
- [ ] Test payment processing
- [ ] Check email notifications
- [ ] Verify Stripe webhooks
- [ ] Test responsive design
- [ ] Check all admin features
- [ ] Verify database connections
- [ ] Test day-off functionality
- [ ] Check invoice generation

## 🌐 Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

### Other Platforms
- Follow platform-specific domain configuration
- Update environment variables accordingly
- Ensure SSL certificates are properly configured

---

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Review platform-specific documentation
3. Verify all environment variables
4. Test locally before deploying

**Happy Deploying! 🚀** 