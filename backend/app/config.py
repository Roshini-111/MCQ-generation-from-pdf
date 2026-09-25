import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL:
    raise RuntimeError("Missing SUPABASE_URL in backend/.env")

if not SUPABASE_SERVICE_KEY:
    raise RuntimeError("Missing SUPABASE_SERVICE_KEY in backend/.env")

if not SUPABASE_URL.startswith("https://"):
    raise RuntimeError("SUPABASE_URL must be your Supabase project URL, like https://your-project.supabase.co")

if not any(prefix in SUPABASE_SERVICE_KEY for prefix in ("sbp_", "sb_", "eyJ")):
    raise RuntimeError(
        "SUPABASE_SERVICE_KEY looks invalid. Use the Service Role key from Supabase Dashboard > Project Settings > API, not the anonymous key."
    )

if not GEMINI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY in backend/.env")
