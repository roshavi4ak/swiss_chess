# Swiss Chess Tournament - cPanel Deployment Guide

## Overview
This guide will help you deploy your Swiss Chess Tournament web application to chess.belovezem.com using cPanel.

## Prerequisites
- cPanel hosting account with Node.js support
- Access to cPanel File Manager
- Node.js application hosting enabled
- Domain: chess.belovezem.com pointing to your hosting

## Step-by-Step Deployment

### 1. Prepare Your Files for Upload

First, ensure you have the production build:
```bash
npm run build
```

This creates a `dist` folder with your compiled application.

### 2. Upload Files via cPanel File Manager

1. **Login to cPanel**
   - Go to your hosting provider's cPanel
   - Login with your credentials

2. **Open File Manager**
   - Click on "File Manager" in the Files section
   - Navigate to your domain's document root: `/home/andrey12/chess.belovezem.com/public_html`

3. **Prepare the Target Directory**
   - Create an application directory: `/home/andrey12/chess.belovezem.com/public_html/chess-tournament`
   - Do NOT delete your entire `public_html`. The application will be in a subdirectory and mapped via cPanel Node.js App Manager.

4. **Upload the Following Files:**
   - `package.json` (from your project root)
   - `server.js` (from your project root)
   - `database.js` (required for API and persistence)
   - `dist` folder (entire contents)
   - `database.json` (optional; will be created on first write if missing)
   - `.htaccess` (only if deploying as a static SPA without the Node.js App Manager; do NOT include this when using the cPanel Node.js App Manager to avoid interfering with API routes)

### 3. Install Node.js Application

#### Option A: Using cPanel Node.js App Manager
1. **Access Node.js Settings**
   - In cPanel, look for "Node.js" or "Applications"
   - Click on "Setup Node.js App"

2. **Create New Application**
   - Application mode: **Production**
   - Node.js version: **18.x or higher**
   - Application root: `/home/andrey12/chess.belovezem.com/public_html/chess-tournament`
   - Application startup file: `server.js`
   - Application URL: `chess.belovezem.com`
   - Application URI/Route: `/` (root path for the domain)

3. **Install Dependencies**
   - Use the "Run NPM Install" button in cPanel, or via Terminal run:
     - `npm ci --omit=dev`
   - Do NOT upload `node_modules`; let the server install dependencies.

   Important: If you are using the cPanel Node.js App Manager, delete the `.htaccess` file located in your application root (`/home/andrey12/chess.belovezem.com/public_html/chess-tournament`). Apache rewrites in `.htaccess` will otherwise intercept `/api/*` requests and return `index.html` instead of your JSON API.

#### Option B: Using SSH (if available)
1. **Connect via SSH**
   ```bash
   ssh andrey12@your-server.com
   cd /home/andrey12/chess.belovezem.com/public_html/chess-tournament
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Application**
   ```bash
   npm start
   ```

### 4. Configure Domain Routing

Your application will handle these URL patterns:
- `https://chess.belovezem.com` - Main setup page (requires password)
- `https://chess.belovezem.com/1` - Tournament #1
- `https://chess.belovezem.com/1#organizer-roshavi4ak` - Organizer view for tournament #1
- `https://chess.belovezem.com/2` - Tournament #2
- `https://chess.belovezem.com/2#organizer-roshavi4ak` - Organizer view for tournament #2

### 5. Set Environment Variables

In cPanel Node.js settings, set:
```
NODE_ENV=production
```

Do NOT set PORT manually. cPanel provides PORT automatically and the server reads it from the environment.

### 6. Start the Application

- If using cPanel Node.js App Manager, click "Start App"
- If using SSH, the app should auto-start with `npm start`

### 7. Test the Deployment

1. **Main Page**
   - Visit: `https://chess.belovezem.com`
   - Should prompt for password: `1905`

2. **Create a Tournament**
   - Password: `1905`
   - Add players and start tournament
   - Should redirect to `https://chess.belovezem.com/1`

3. **Organizer Access**
   - Visit: `https://chess.belovezem.com/1#organizer-roshavi4ak`
   - Should work with same password

4. **Observer View**
   - Visit: `https://chess.belovezem.com/1`
   - Should work in observer mode

## Troubleshooting

### Common Issues

1. **Application Won't Start**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Verify `server.js` path in cPanel settings

2. **Port Already in Use**
   - Do NOT set PORT in cPanel. Remove any manual PORT environment variable; cPanel assigns it automatically.
   - Restart the Node.js application from cPanel.
   - Ensure the server reads the port from the environment as in [server.js](server.js:10).

3. **404 Errors on Direct URLs**
   - Ensure your `server.js` has the `app.get('*')` route handler
   - This routes all paths to the React app

4. **CSS/JS Assets Not Loading**
   - Verify the `dist` folder contents are uploaded correctly
   - Check file permissions (should be 644 for files, 755 for folders)

5. **Password Not Working**
   - Check that localStorage/sessionStorage is working
   - Clear browser cache and cookies
   - Verify the password is `1905` in the source code

6. **API endpoints return HTML or 404**
   - If you uploaded `.htaccess`, remove it when using the cPanel Node.js App Manager. The SPA rewrite can intercept `/api/*` requests before they reach Node.
   - Ensure the Node.js app is started and the Application URI is set correctly in cPanel.

### File Permissions
- Set folders to `755` (rwxr-xr-x)
- Set files to `644` (rw-r--r--)

### Log Files
- Check cPanel error logs for application issues
- Look for Node.js application logs in the app manager

## Security Notes

1. **Password Protection**
   - The app uses a simple password (`1905`) for main access
   - Consider changing this in `App.tsx` before deployment

2. **HTTPS**
   - Ensure your hosting provides SSL certificate
   - The app should work on both HTTP and HTTPS

3. **Organizer Access**
   - Organizer links include the hash `#organizer-roshavi4ak`
   - This should be kept private and shared only with tournament organizers

## Maintenance

### Updating the Application
1. Upload new files via File Manager
2. Restart the Node.js application in cPanel
3. Clear browser cache

### Backup
- Regularly backup your `/home/andrey12/chess.belovezem.com/public_html/chess-tournament` directory
- Backup the `database.json` file which stores all tournament data

### Monitoring
- Monitor application logs in cPanel
- Check disk space and memory usage
- Ensure Node.js application stays running

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review cPanel error logs
3. Contact your hosting provider's support for Node.js-specific issues

## Quick Commands Reference

```bash
# Install dependencies
npm ci --omit=dev

# Start production server
npm start

# Build for production
npm run build

# Test locally before upload
npm run production
```

Your Swiss Chess Tournament app will be fully functional at `https://chess.belovezem.com` once deployed!