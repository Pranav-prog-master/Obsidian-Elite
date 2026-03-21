"""PDF Parsing Utilities (implemented by Pranav, used by others)"""

import fitz  # PyMuPDF
from typing import List


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file.
    
    Args:
        file_path: Path to PDF file
        
    Returns:
        Extracted text from PDF
    """
    try:
        doc = fitz.open(file_path)
        text = ""
        for page_num in range(len(doc)):
            page = doc[page_num]
            text += page.get_text()
        return text
    except Exception as e:
        raise ValueError(f"Failed to extract PDF text: {str(e)}")


def extract_text_from_pdf_bytes(file_content: bytes) -> str:
    """
    Extract text from PDF bytes.
    
    Args:
        file_content: PDF file content as bytes
        
    Returns:
        Extracted text from PDF
    """
    try:
        doc = fitz.open(stream=file_content, filetype="pdf")
        text = ""
        for page_num in range(len(doc)):
            page = doc[page_num]
            text += page.get_text()
        return text
    except Exception as e:
        raise ValueError(f"Failed to extract PDF text: {str(e)}")


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """
    Split text into overlapping chunks for better processing.
    
    Args:
        text: Text to chunk
        chunk_size: Size of each chunk in characters
        overlap: Overlap between chunks in characters
        
    Returns:
        List of text chunks
    """
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i : i + chunk_size]
        if chunk.strip():  # Only add non-empty chunks
            chunks.append(chunk)
    return chunks


def clean_text(text: str) -> str:
    """
    Clean extracted text (remove extra whitespace, special chars, etc).
    
    Args:
        text: Raw text to clean
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace
    text = " ".join(text.split())
    # Remove common OCR artifacts
    text = text.replace("fi", "fi").replace("fl", "fl")
    return text
