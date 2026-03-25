from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
import fitz
from supabase_client import supabase
from utils.auth_dependency import get_current_user

router = APIRouter(prefix="/notes", tags=["Notes"])


class SubjectCreate(BaseModel):
    name: str
    exam_target: str = "JEE"


@router.post("/subjects", summary="Create a new subject")
def create_subject(body: SubjectCreate, current_user: dict = Depends(get_current_user)):
    res = supabase.table("subjects").insert({
        "user_id": current_user["user_id"],
        "name": body.name,
        "exam_target": body.exam_target,
    }).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create subject.")
    return res.data[0]


@router.get("/subjects", summary="List all subjects for current user")
def list_subjects(current_user: dict = Depends(get_current_user)):
    res = supabase.table("subjects").select("*").eq("user_id", current_user["user_id"]).execute()
    return res.data or []


@router.post("/upload", summary="Upload a PDF and extract text")
async def upload_notes(
    subject_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    subject_res = supabase.table("subjects").select("id").eq("id", subject_id).eq("user_id", current_user["user_id"]).execute()
    if not subject_res.data:
        raise HTTPException(status_code=404, detail="Subject not found.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    content = await file.read()

    try:
        doc = fitz.open(stream=content, filetype="pdf")
        text = "".join(page.get_text() for page in doc)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {e}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF appears to be empty or unreadable.")

    chunk_size = 3000
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

    rows = [
        {
            "subject_id": subject_id,
            "filename": file.filename,
            "raw_text": chunk,
            "chunk_count": len(chunks),
            "storage_path": f"uploads/{subject_id}/{file.filename}",
        }
        for chunk in chunks
    ]
    supabase.table("notes").insert(rows).execute()

    return {"status": "success", "filename": file.filename, "chunks_created": len(chunks), "total_characters": len(text)}


@router.get("/subject/{subject_id}", summary="Get all notes for a subject")
def get_subject_notes(subject_id: str, current_user: dict = Depends(get_current_user)):
    subject_res = supabase.table("subjects").select("id").eq("id", subject_id).eq("user_id", current_user["user_id"]).execute()
    if not subject_res.data:
        raise HTTPException(status_code=404, detail="Subject not found.")

    res = supabase.table("notes").select("id, filename, chunk_count, created_at").eq("subject_id", subject_id).execute()
    return res.data or []
