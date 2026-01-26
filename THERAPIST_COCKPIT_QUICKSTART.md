# Therapist Cockpit Upgrade - Quick Start

## 🚀 What Changed

### New Features
1. **Modern Dashboard** - Stats cards, quick actions, feature cards
2. **Updated Sidebar** - 7 main navigation links (Dashboard, Pacientes, Astrología, Cábala, Tests, Reportes, Settings)
3. **AI Assistant Widget** - Floating purple button with chat drawer
4. **Backend AI Endpoint** - `/api/ai/holistic-query/` for AI queries

---

## ⚡ Quick Test (3 Steps)

```powershell
# 1. Install dependencies (if needed)
cd tonyblanco-app
npm install

# 2. Start services
# Terminal 1: Backend
cd ..
.\start-flask.ps1

# Terminal 2: Frontend  
cd tonyblanco-app
npm run dev

# 3. Navigate to:
# http://localhost:3000/dashboard/therapist
```

---

## ✅ Visual Verification

### You should see:
- ✅ New dashboard with 4 stats cards (blue, green, purple, orange)
- ✅ 4 quick action buttons (purple gradients)
- ✅ 2 activity cards (Recent Activity, Próximas Sesiones)
- ✅ 3 feature cards with gradients (Astrología, Cábala, Tests)
- ✅ Purple floating button in bottom-right corner
- ✅ Sidebar with Dashboard, Pacientes, Astrología, etc.

### Test AI Widget:
1. Click purple floating button (bottom-right)
2. Drawer slides in from right
3. Type: "¿Cómo usar los tests?"
4. Press Send
5. See "Pensando..." → AI response appears

---

## 📂 Files Changed

**Frontend (4 files)**
- `app/(dashboard)/dashboard/therapist/(core)/page.tsx` - New dashboard
- `app/(dashboard)/dashboard/therapist/(core)/layout.tsx` - AI widget integration
- `app/(dashboard)/dashboard/therapist/components/TherapistSidebar.tsx` - Navigation
- `src/components/therapist/AIAssistantWidget.tsx` - AI chat (NEW)

**Backend (2 files)**
- `backend/api/ai_views.py` - AI endpoint (NEW)
- `backend/api/urls.py` - Route registration

---

## ⚠️ Requirements

- `framer-motion` installed (npm install)
- Backend `GEMINI_API_KEY` configured (for AI widget)
- Flask backend running on port 8000
- Next.js frontend running on port 3000

---

## 🔍 Troubleshooting

### AI Widget shows error
**Cause**: Backend missing GEMINI_API_KEY  
**Fix**: Add to backend `.env` file:
```
GEMINI_API_KEY=your_key_here
```

### Stats show 0
**Expected**: Stats cards have placeholder data  
**Future**: Will connect to real backend APIs

### Navigation links 404
**Check**: Ensure target routes exist:
- `/dashboard/therapist/tests`
- `/dashboard/therapist/reports`  
**Fix**: Create pages or update routes as needed

---

## 🎯 Success Criteria

Dashboard is working if:
1. ✅ Page loads without console errors
2. ✅ All navigation links visible and clickable
3. ✅ AI button appears and drawer opens
4. ✅ Quick actions navigate correctly
5. ✅ Responsive on mobile and desktop

---

## 📞 Quick Commands

```powershell
# Check for TypeScript errors
cd tonyblanco-app
npx tsc --noEmit

# Check backend syntax
cd backend
python -m py_compile api/ai_views.py

# Start both services
.\start-all.ps1
```

---

**Status**: ✅ Ready to test  
**Time to test**: ~5 minutes  
**Risk**: Low (additive changes only)
