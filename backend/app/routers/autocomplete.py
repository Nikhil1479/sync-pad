from fastapi import APIRouter
from app.schemas.room import AutocompleteRequest, AutocompleteResponse
from app.services.autocomplete_service import AutocompleteService

router = APIRouter(tags=["autocomplete"])


@router.post("/autocomplete", response_model=AutocompleteResponse)
async def get_autocomplete(request: AutocompleteRequest):
    """
    Get AI-style autocomplete suggestions for code.

    This is a mocked implementation that returns rule-based suggestions
    based on code patterns and context.

    Args:
        request: Contains code, cursor position, and language

    Returns:
        AutocompleteResponse with suggestion and insert position
    """
    return AutocompleteService.get_autocomplete(request)
