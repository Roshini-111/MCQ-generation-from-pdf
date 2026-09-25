import uuid
from importlib import import_module
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.supabase_client import supabase
from app.access import DEMO_USER_ID

router = APIRouter(prefix="/textbooks", tags=["textbooks"])

def is_pdf_upload(file_name: str | None, content_type: str | None) -> bool:
    file_name = (file_name or "").lower()
    if file_name.endswith(".pdf"):
        return True

    normalized = (content_type or "").lower()
    return normalized in {
        "application/pdf",
        "application/x-pdf",
        "application/octet-stream",
        "binary/octet-stream",
    }


@router.get("")
async def get_textbooks():
    try:
        result = (
            supabase
            .table("textbooks")
            .select("*")
            .eq("user_id", DEMO_USER_ID)
            .execute()
        )
        return {"textbooks": result.data or []}
    except Exception as e:
        print("DATABASE ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{textbook_id}")
async def delete_textbook(textbook_id: str):
    try:
        textbook_result = (
            supabase
            .table("textbooks")
            .select("id")
            .eq("id", textbook_id)
            .eq("user_id", DEMO_USER_ID)
            .single()
            .execute()
        )

        if not textbook_result.data:
            raise HTTPException(status_code=404, detail="Textbook not found")

        supabase.table("questions").delete().eq("textbook_id", textbook_id).execute()
        supabase.table("textbooks").delete().eq("id", textbook_id).eq("user_id", DEMO_USER_ID).execute()
        return {"message": "Textbook deleted successfully", "textbook_id": textbook_id}
    except HTTPException:
        raise
    except Exception as e:
        print("DATABASE ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_textbook(
    title: str = Form(...),
    subject: str = Form(""),
    file: UploadFile = File(...),
):
    if not is_pdf_upload(file.filename, file.content_type):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    file_bytes = await file.read()

    # 1. Extract text from PDF
    extracted_text = ""

    try:
        pdfplumber = import_module("pdfplumber")
        with pdfplumber.open(io_wrap(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()

                if page_text:
                    extracted_text += page_text + "\n"

    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not read PDF: {str(e)}"
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No extractable text found in PDF"
        )

    # 2. Upload PDF to Supabase Storage
    storage_path = f"{DEMO_USER_ID}/{uuid.uuid4()}_{file.filename}"

    try:
        supabase.storage.from_("textbooks").upload(
            storage_path,
            file_bytes,
            {"content-type": "application/pdf"}
        )

        file_url = supabase.storage.from_(
            "textbooks"
        ).get_public_url(storage_path)

    except Exception as e:
        print("STORAGE ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    # 3. Save textbook information in Supabase
    try:
        result = (
            supabase
            .table("textbooks")
            .insert({
                "user_id": DEMO_USER_ID,
                "title": title,
                "subject": subject,
                "file_url": file_url,
                "extracted_text": extracted_text,
            })
            .execute()
        )

    except Exception as e:
        print("DATABASE ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    return {
        "message": "Textbook uploaded successfully",
        "textbook": result.data[0] if result.data else None,
    }

def io_wrap(file_bytes: bytes):
    import io
    return io.BytesIO(file_bytes)