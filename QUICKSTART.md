# ChurnSentry - Quick Start Guide

Get up and running in **5 minutes**.

---

## 🚀 Installation (5 min)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/customer-churn-predictor.git
cd customer-churn-predictor

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Visit http://localhost:3000
```

---

## 🔑 Default Login

```
Email:    admin@churnpredictor.com
Password: admin123
```

---

## 📋 What Can You Do?

### Dashboard
- View KPI cards (total predictions, churn rate, revenue at risk)
- Interactive charts and analytics
- See prediction timeline

### Make Predictions
1. Go to "Predict Churn" tab
2. Enter customer details (tenure, support tickets, etc.)
3. Get instant churn probability + AI insights

### Train Model
1. Go to "Train Pipeline" tab
2. Adjust hyperparameters (epochs, learning rate)
3. Watch live training progress
4. See accuracy/precision metrics

### View History
- See all past predictions
- Search by customer name
- Filter by risk level (High/Medium/Low)
- Download as CSV
- Delete records

### Admin Panel (Admin Only)
- View audit trail of all system actions
- See user logins and model retrains

---

## ⚙️ Configuration

### Add Gemini API (Optional)

1. Get API key: https://makersuite.google.com/app/apikey
2. Edit `.env` file:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Restart dev server

Without Gemini, app uses rule-based AI fallback (still great!).

---

## 🛠️ Development Commands

```bash
npm run dev          # Start dev server (hot reload)
npm run build        # Build for production
npm start            # Run production server
npm run lint         # Check TypeScript errors
npm run clean        # Remove build artifacts
```

---

## 📁 Project Structure

```
src/
  components/        # React UI components
  App.tsx           # Main app
  types.ts          # TypeScript interfaces
  index.css         # Global styles

server/
  db.ts             # Database logic
  ml.ts             # ML algorithm
  gemini.ts         # AI integration

server.ts           # Express API
```

---

## 🎯 Key Features

✅ **Machine Learning** - Logistic Regression classifier
✅ **Real-time Training** - Adjust and retrain instantly
✅ **AI Insights** - Gemini-powered retention strategies
✅ **Analytics** - Beautiful charts & KPIs
✅ **CSV Export** - Download predictions
✅ **Dark Mode** - Eye-friendly interface
✅ **Mobile Responsive** - Works on all devices

---

## 🚀 Deploy to Production

### Render (Easiest)

1. Push to GitHub
2. Visit https://render.com
3. Connect GitHub repo
4. Add environment variables
5. Click Deploy

[Full deployment guide →](DEPLOYMENT.md)

---

## 📚 Learn More

- [Full README](README.md) - Complete documentation
- [Deployment Guide](DEPLOYMENT.md) - Production setup
- [Contributing](CONTRIBUTING.md) - Help improve the project

---

## 🆘 Troubleshooting

**Port 3000 in use?**
```bash
# Use different port
PORT=3001 npm run dev
```

**npm install fails?**
```bash
npm cache clean --force
npm install
```

**Changes not showing?**
- Check if dev server is running
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server

---

## 💡 Next Steps

1. **Explore the app** - Test all features
2. **Train the model** - Adjust epochs and learning rate
3. **Make predictions** - Try different customer profiles
4. **Customize** - Change colors, add your branding
5. **Deploy** - Put it live on Render/Railway

---

## 🎓 Learning Path

Want to understand the code?

1. **Start with:** `src/App.tsx` - See how routing works
2. **Learn state:** `src/components/Dashboard.tsx` - See React hooks
3. **Understand ML:** `server/ml.ts` - Logistic regression implementation
4. **Study API:** `server.ts` - REST endpoints and auth

---

## 📞 Need Help?

- Open an **Issue** on GitHub
- Check **README.md** for detailed docs
- Review **DEPLOYMENT.md** for production questions

---

**Ready to impress recruiters? Deploy it now! 🚀**

Visit [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step deployment guide.

---
