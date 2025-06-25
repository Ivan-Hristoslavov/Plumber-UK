# Deployment Guide - Plumber Booking System

## Project Structure Note
**IMPORTANT**: This project has a specific directory structure where the Next.js application is located in the `ui/` directory. The `vercel.json` configuration files have been set up to handle this structure correctly.

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

### Quick Setup
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### Manual Vercel Setup
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository: `https://github.com/serenity-RapidFrame/plumber`
3. **IMPORTANT**: Vercel should automatically detect the `vercel.json` configuration
4. If not detected, manually set:
   - **Root Directory**: `ui`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Environment Variables (Vercel Dashboard)
Add these in your Vercel project settings:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=Admin Name
```

### GitHub Actions Deployment
The repository includes GitHub Actions workflow for automatic deployment. Set up these secrets in your GitHub repository:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add these secrets:

```bash
# Vercel
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id

# Environment variables (same as above)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=Admin Name
```

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

## Troubleshooting 404 Errors

If you're getting 404 errors after deployment:

### 1. Verify Directory Structure
- Ensure `vercel.json` is in the root directory
- Ensure `ui/vercel.json` exists in the ui directory
- Check that the build is pointing to the correct directory

### 2. Check Build Logs
- Look for build errors in Vercel dashboard
- Verify all dependencies are installed correctly
- Check that environment variables are set

### 3. Verify Routes
- Ensure all pages are in `ui/app/` directory
- Check that `ui/app/page.tsx` exists (homepage)
- Verify middleware configuration if using custom routing

### 4. Force Redeploy
```bash
# From root directory
vercel --prod --force
```

## Alternative Deployment Platforms

### Netlify
1. Connect your GitHub repository
2. Set build settings:
   - **Base directory**: `ui`
   - **Build command**: `npm run build`
   - **Publish directory**: `ui/.next`
3. Add environment variables in Netlify dashboard

### Railway
1. Connect GitHub repository
2. Set root directory to `ui`
3. Railway will auto-detect Next.js
4. Add environment variables

### DigitalOcean App Platform
1. Create new app from GitHub
2. Configure build settings:
   - **Source Directory**: `ui`
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`

## Post-Deployment Checklist

1. ✅ Test homepage loads correctly
2. ✅ Test booking form functionality
3. ✅ Test admin login at `/admin/login`
4. ✅ Verify Stripe payment integration
5. ✅ Test Supabase database connection
6. ✅ Check all environment variables are set
7. ✅ Verify webhook endpoints work
8. ✅ Test responsive design on mobile

## Common Issues and Solutions

### Build Fails
- Check Node.js version (use 18.x or 20.x)
- Verify all dependencies in `ui/package.json`
- Check for TypeScript errors

### Environment Variables Not Working
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Check variable names match exactly
- Restart deployment after adding variables

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Ensure database migrations are applied

### Stripe Integration Issues
- Verify webhook endpoint is set correctly
- Check Stripe keys are for the correct environment
- Ensure webhook secret matches

## Support

If you encounter issues:
1. Check the build logs in your deployment platform
2. Verify all environment variables are set correctly
3. Ensure the `vercel.json` configuration is correct
4. Test locally with `cd ui && npm run dev`

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords for admin accounts
- Regularly rotate API keys
- Monitor webhook endpoints for unusual activity
- Keep dependencies updated 