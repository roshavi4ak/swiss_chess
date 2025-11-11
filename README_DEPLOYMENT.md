# Swiss Chess Tournament - Quick Deployment

## 🚀 Quick Start

1. **Run Deployment Script**
   - Windows: Double-click `deploy.bat`
   - Mac/Linux: Run `chmod +x deploy.sh && ./deploy.sh`

2. **Upload to cPanel**
   - Upload `deploy/chess-tournament-deploy.zip`
   - Extract in your domain's public directory

3. **Set up Node.js App**
   - In cPanel, create Node.js application
   - Point to `server.js` as startup file
   - Run `npm install`

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