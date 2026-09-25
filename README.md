# LearnFlow

LearnFlow is an adaptive assessment and MCQ generation platform built for learners and educators. It combines a React + Vite frontend with a FastAPI backend to ingest textbook content, generate multiple-choice questions, and deliver adaptive quiz experiences with analytics.

## Features

- Textbook upload support for study material
- AI-based MCQ generation from uploaded content
- Adaptive quiz flow based on learner performance
- Question bank and analytics dashboard
- Bloom-style cognitive tagging and performance insights
- Student learning diagnostics and weak-topic tracking

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide Icons

### Backend
- Python
- FastAPI
- Supabase
- Gemini API integration

## Project Structure

```text
project/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── config.py
│   │   ├── main.py
│   │   └── supabase_client.py
│   ├── requirements.txt
│   └── README.md
├── public/
├── src/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── index.html
├── schema.sql
├── README.md
└── ...
```

## Prerequisites

Before running the project, make sure you have:

- Node.js and npm installed
- Python 3.10+ installed
- A Supabase project
- A Gemini API key from Google AI Studio

## 1. Frontend Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app will be available at:

```text
http://localhost:5173
```

## 2. Backend Setup

Go to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment:

On Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```bash
copy .env.example .env
```

If `.env.example` does not exist, create a `.env` file manually with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

Swagger docs:

```text
http://localhost:8000/docs
```

## 3. Supabase Setup

In your Supabase dashboard:

- Create a project
- Create the required database tables using the SQL in `schema.sql`
- Create a Storage bucket named `textbooks` if needed for textbook uploads
- Copy the project URL and service role key into your backend `.env`

## 4. Environment Variables

### Frontend
If the frontend needs any environment variables, add them to a `.env` file in the project root.

### Backend
Use the backend `.env` file and keep these values secure:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY`

> Do not expose the Supabase service role key in frontend code.

The current frontend account screens are a local development flow. For production, replace localStorage-based session handling with Supabase Auth and validate the authenticated user on every backend request.

## 5. Common Commands

### Run frontend

```bash
npm run dev
```

### Build frontend

```bash
npm run build
```

### Run backend

```bash
cd backend
uvicorn app.main:app --reload
```

## 6. Notes

This project is intended for local development and educational prototype use. For production deployment, add proper security, env validation, CI/CD, and deployment configuration.

## License

This project is for educational and portfolio use unless otherwise specified.
