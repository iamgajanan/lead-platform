from fastapi import APIRouter, HTTPException

from app.schemas.search import SearchRequest
from app.services.google_maps.scraper import GoogleMapsScraper

router = APIRouter()


@router.post("/")
async def search(request: SearchRequest):
    try:
        scraper = GoogleMapsScraper()
        return await scraper.search(
            request.keyword,
            request.location,
            enrich=request.enrich,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
