from pydantic import BaseModel


class Business(BaseModel):
    name: str | None = None
    rating: float | None = None
    reviews: int | None = None
    category: str | None = None
    address: str | None = None
    phone: str | None = None
    website: str | None = None