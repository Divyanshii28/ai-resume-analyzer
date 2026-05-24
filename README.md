# AI Resume Analyzer

AI Resume Analyzer is a two-part app:

- `backend/`: FastAPI API for resume analysis
- `frontend/`: React UI for entering resume text and job descriptions

## Run

Start the backend:

```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8001
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend URL printed by `npm run dev`.

## Environment

Create `backend/.env`:

```env
OPENAI_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=ai_resume_analyzer
CORS_ORIGINS=http://localhost:3000
```

If no key is configured, the backend returns a local keyword-based analysis so the app remains usable.

## MongoDB

MongoDB is used to save successful analysis results.

For local development, install MongoDB Community Server and start it on the default port. The backend will use:

```text
mongodb://localhost:27017
```

You can also use MongoDB Atlas by setting `MONGODB_URI` in `backend/.env`.

History endpoint:

```text
GET http://localhost:8001/api/history
```

If MongoDB is not running, analysis still works, but history will be empty and the backend will print a warning.

## Free Deployment

Use three free services:

- Vercel for the React frontend
- Render for the FastAPI backend
- MongoDB Atlas for the database

### 1. MongoDB Atlas

Create a free MongoDB Atlas cluster, then copy the connection string:

```text
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/
```

### 2. Render Backend

Create a Render Web Service from this GitHub repo.

Settings:

```text
Root Directory: backend
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=ai_resume_analyzer
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

After deploy, test:

```text
https://your-render-service.onrender.com/
```

### 3. Vercel Frontend

Import this GitHub repo into Vercel.

Settings:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Environment variable:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

Deploy, then test resume analysis from the Vercel URL.
