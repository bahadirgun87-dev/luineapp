from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class SiteBase(BaseModel):
    url: str
    name: Optional[str] = None

class SiteCreate(SiteBase):
    pass

class Site(SiteBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class TestScenarioBase(BaseModel):
    action_type: str
    selector: Optional[str] = None
    value: Optional[str] = None
    step_order: int
    is_active: bool = True

class TestScenarioCreate(TestScenarioBase):
    site_id: UUID

class TestScenario(TestScenarioBase):
    id: UUID
    site_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class TestResult(BaseModel):
    success: bool
    message: str
    error: Optional[str] = None
