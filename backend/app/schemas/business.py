from pydantic import BaseModel
from typing import Optional


class Business(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None

    rating: Optional[float] = None
    reviews: Optional[int] = None

    address: Optional[str] = None

    phone: Optional[str] = None

    website: Optional[str] = None

    email: Optional[str] = None

    facebook: Optional[str] = None

    instagram: Optional[str] = None

    linkedin: Optional[str] = None