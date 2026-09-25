from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

# NOTE: This uses the SERVICE ROLE key, which bypasses Row Level Security.
# Only use this on the backend — never expose the service key to the frontend.
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
except Exception as exc:
    raise RuntimeError(
        "Supabase client initialization failed. Verify that the URL and Service Role key in backend/.env belong to the same Supabase project and that the service key is not expired or replaced with the anon key."
    ) from exc
