from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import textbooks, questions, quiz, analytics, test_solver

app = FastAPI(title="LearnFlow - MCQ Generation and Adaptive Assessment API")

# Allow the React frontend when it runs on localhost or the local network (common on college/LAN setups)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|\[::1\]|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(textbooks.router)
app.include_router(questions.router)
app.include_router(quiz.router)
app.include_router(analytics.router)
app.include_router(test_solver.router)


@app.get("/")
def root():
    return {"status": "LearnFlow backend is running"}
