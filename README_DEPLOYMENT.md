# Swiss Chess Tournament - Quick Deployment

## 🚀 Quick Start

1. **Run Deployment Script**
   - Windows: Double-click `deploy.bat`
   - Mac/Linux: Run `chmod +x deploy.sh && ./deploy.sh`

2. **Upload to cPanel**
   - Upload `deploy/chess-tournament-deploy.zip`
   - Extract into `/home/andrey12/chess.belovezem.com/public_html/chess-tournament`. Do NOT delete existing content in `public_html`.
   - Ensure `database.js` is present (the script copies it; it's required by the server).
   - If you will run via cPanel Node.js App Manager, you can delete the included `.htaccess` (it's only for static hosting and can interfere with API routes).

3. **Set up Node.js App**
   - In cPanel, create Node.js application
   - Application URI: `/` (root)
   - Startup file: `server.js`
   - Click 'Run NPM Install' or run `npm ci --omit=dev` in the Terminal
   - Do not upload `node_modules`
   - Ensure there is no `.htaccess` in the application directory

4. **Start the Application**
   - Start the Node.js app in cPanel

## 🌐 URLs After Deployment

- **Main Setup**: https://chess.belovezem.com
- **Tournament 1**: https://chess.belovezem.com/1
- **Organizer View**: https://chess.belovezem.com/1#organizer-roshavi4ak
- **Tournament 2**: https://chess.belovezem.com/2
- **Organizer View**: https://chess.belovezem.com/2#organizer-roshavi4ak

## 🔐 Password
- Main password: `1905`

## 📋 Features
- ✅ Swiss system tournament management
- ✅ Multi-language support (English/Bulgarian)
- ✅ Real-time tournament tracking
- ✅ Print-friendly output
- ✅ Secure organizer access
- ✅ Auto-refresh for observers
- ✅ Tournament history

## 🛠️ For Developers
- Built with React + TypeScript
- Express.js server for routing
- Tailwind CSS for styling
- Vite for fast builds

See `CPANEL_DEPLOYMENT_GUIDE.md` for detailed instructions.