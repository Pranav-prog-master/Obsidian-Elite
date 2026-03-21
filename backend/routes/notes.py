"""Notes Management Routes"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import fitz  # PyMuPDF
from database import get_db
from models.notes import Subject, Notes
from routes.auth import verify_token

router = APIRouter(prefix="/notes", tags=["notes"])


class SubjectCreate(BaseModel):
    name: str
    exam_target: str = None


class SubjectResponse(BaseModel):
    id: str
    name: str
    exam_target: str


class NotesResponse(BaseModel):
    id: str
    filename: str
    chunk_count: int
    created_at: str


async def get_current_user_id(token: str = Depends(verify_token)) -> str:
    return token


@router.post("/subjects", response_model=SubjectResponse)
async def create_subject(
    request: SubjectCreate,
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new subject for the user"""

    subject = Subject(
        user_id=UUID(user_id),
        name=request.name,
        exam_target=request.exam_target
    )
    session.add(subject)
    await session.commit()
    await session.refresh(subject)

    return SubjectResponse(
        id=str(subject.id),
        name=subject.name,
        exam_target=subject.exam_target
    )


@router.get("/subjects", response_model=list[SubjectResponse])
async def list_subjects(
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """List all subjects for the user"""

    query = select(Subject).where(Subject.user_id == UUID(user_id))
    result = await session.execute(query)
    subjects = result.scalars().all()

    return [
        SubjectResponse(
            id=str(s.id),
            name=s.name,
            exam_target=s.exam_target
        )
        for s in subjects
    ]


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF using PyMuPDF"""
    try:
        doc = fitz.open(stream=file_content, filetype="pdf")
        text = ""
        for page_num in range(len(doc)):
            page = doc[page_num]
            text += page.get_text()
        return text
    except Exception as e:
        raise ValueError(f"Failed to extract PDF text: {str(e)}")


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> list[str]:
    """Split text into overlapping chunks"""
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunks.append(text[i : i + chunk_size])
    return chunks


@router.post("/upload")
async def upload_notes(
    subject_id: str,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Upload PDF notes for a subject"""

    # Verify subject belongs to user
    query = select(Subject).where(
        Subject.id == UUID(subject_id),
        Subject.user_id == UUID(user_id)
    )
    result = await session.execute(query)
    subject = result.scalar_one_or_none()

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Read file
    content = await file.read()

    # Extract text
    text = extract_text_from_pdf(content)

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF appears to be empty or unreadable")

    # Chunk text
    chunks = chunk_text(text)

    # Save chunks to database
    for chunk in chunks:
        note = Notes(
            subject_id=UUID(subject_id),
            filename=file.filename,
            raw_text=chunk,
            chunk_count=len(chunks)
        )
        session.add(note)

    await session.commit()

    return {
        "status": "success",
        "filename": file.filename,
        "chunks_created": len(chunks),
        "total_characters": len(text)
    }


@router.get("/subject/{subject_id}")
async def get_subject_notes(
    subject_id: str,
    session: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Get all notes for a subject"""

    # Verify subject belongs to user
    query = select(Subject).where(
        Subject.id == UUID(subject_id),
        Subject.user_id == UUID(user_id)
    )
    result = await session.execute(query)
    subject = result.scalar_one_or_none()

    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Get notes
    query = select(Notes).where(Notes.subject_id == UUID(subject_id))
    result = await session.execute(query)
    notes = result.scalars().all()

    return [
        NotesResponse(
            id=str(n.id),
            filename=n.filename,
            chunk_count=n.chunk_count,
            created_at=n.created_at.isoformat()
        )
        for n in notes
    ]
