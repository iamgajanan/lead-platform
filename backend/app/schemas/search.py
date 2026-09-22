from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    keyword: str = Field(min_length=1, max_length=100)
    location: str = Field(min_length=1, max_length=100)
    enrich: bool = False
