# 🚀 Netlify Deployment Guide for Astral Core v2

## Quick Deploy to Netlify

### Option 1: One-Click Deploy (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Damatnic/astral-core-v2)

Click the button above to automatically:
1. Fork this repository to your GitHub account
2. Create a new Netlify site
3. Configure build settings
4. Deploy the application

### Option 2: Manual Deployment via Netlify Dashboard

1. **Sign in to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign in with GitHub, GitLab, or Bitbucket

2. **Import from GitHub**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select the repository: `Damatnic/astral-core-v2`

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 (automatically detected)

4. **Environment Variables (Optional)**
   ```
   VITE_AUTH0_DOMAIN=your-auth0-domain
   VITE_AUTH0_CLIENT_ID=your-client-id
   OPENAI_API_KEY=your-openai-key
   CLAUDE_API_KEY=your-claude-key
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes for the build to complete

### Option 3: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Clone and Build**
   ```bash
   git clone https://github.com/Damatnic/astral-core-v2.git
   cd astral-core-v2
   npm install
   npm run build
   ```

3. **Deploy to Netlify**
   ```bash
   # Login to Netlify
   netlify login
   
   # Deploy to a new site
   netlify deploy --prod
   
   # Or link to existing site
   netlify link
   netlify deploy --prod
   ```

## 📋 Post-Deployment Setup

### 1. Custom Domain (Optional)
- Go to Site settings → Domain management
- Add your custom domain
- Netlify provides free SSL certificates

### 2. Environment Variables
- Go to Site settings → Environment variables
- Add any required API keys:
  - `OPENAI_API_KEY` - For AI therapist
  - `CLAUDE_API_KEY` - For Claude integration
  - `VITE_AUTH0_DOMAIN` - For authentication
  - `VITE_AUTH0_CLIENT_ID` - For authentication

### 3. Netlify Functions
The serverless functions are automatically deployed from the `netlify/functions` directory:
- `/api/ai` - AI chat endpoint
- `/api/crisis` - Crisis detection
- `/api/wellness` - Wellness tracking
- `/api/peer-support` - Peer matching

### 4. Build Notifications
- Go to Site settings → Build & deploy → Deploy notifications
- Set up notifications for:
  - Deploy succeeded
  - Deploy failed
  - Deploy locked

## 🔧 Configuration Files

### netlify.toml
The repository includes a pre-configured `netlify.toml` with:
- Build settings
- Redirect rules for SPA
- Security headers
- Cache control
- Function configuration

### Environment Variables
Create a `.env` file locally (not committed):
```env
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
OPENAI_API_KEY=
CLAUDE_API_KEY=
```

## 🚨 Important Notes

### Build Performance
- Initial build: ~3-4 minutes
- Subsequent builds: ~2-3 minutes (with cache)
- Bundle size: ~500KB gzipped

### Features That Work Without Configuration
✅ Crisis detection and support
✅ Safety planning
✅ Breathing exercises
✅ Grounding techniques
✅ Mood tracking (local storage)
✅ Offline support
✅ PWA features
✅ Anonymous mode

### Features Requiring API Keys
⚠️ AI Therapist (needs OpenAI/Claude key)
⚠️ Authentication (needs Auth0 setup)
⚠️ Advanced analytics (optional)

## 📊 Monitoring Your Deployment

### Build Logs
- View at: `https://app.netlify.com/sites/[your-site-name]/deploys`
- Check for any build warnings or errors

### Analytics
- Netlify provides basic analytics for free
- View at: Site dashboard → Analytics

### Function Logs
- View at: Functions tab in Netlify dashboard
- Monitor API usage and errors

## 🆘 Troubleshooting

### Build Fails
1. Check Node version (should be 18+)
2. Clear cache and retry: Site settings → Build & deploy → Clear cache and retry
3. Check build logs for specific errors

### Functions Not Working
1. Verify functions are in `netlify/functions` directory
2. Check function logs in Netlify dashboard
3. Ensure environment variables are set

### 404 Errors on Routes
- The `netlify.toml` includes SPA redirect rules
- If issues persist, check the `_redirects` file

### Performance Issues
1. Enable Netlify's asset optimization
2. Use Netlify's CDN (automatic)
3. Check bundle size with: `npm run analyze`

## 📞 Support

### Netlify Support
- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community](https://answers.netlify.com)
- [Netlify Support](https://www.netlify.com/support)

### Project Issues
- [GitHub Issues](https://github.com/Damatnic/astral-core-v2/issues)
- [Discussions](https://github.com/Damatnic/astral-core-v2/discussions)

## 🎉 Success Checklist

- [ ] Site deployed successfully
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Functions responding
- [ ] PWA installable
- [ ] Crisis features working
- [ ] Offline mode functional

## 🔗 Useful Links

- **GitHub Repository**: https://github.com/Damatnic/astral-core-v2
- **Netlify Dashboard**: https://app.netlify.com
- **Build Status**: Check README badge
- **Live Demo**: Your Netlify URL

---

**Remember**: The platform works immediately after deployment, even without API keys. Critical mental health features like crisis support, safety planning, and wellness tools are fully functional out of the box!
