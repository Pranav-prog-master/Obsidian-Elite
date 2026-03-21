from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, date
import uuid
from database import Base


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    exam_date = Column(Date, nullable=False)
    plan_data = Column(Text, nullable=False)  # JSON string containing the full plan
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<StudyPlan {self.exam_date}>"
