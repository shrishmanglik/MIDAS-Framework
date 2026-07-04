from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str


class PaginationMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int


class DisclaimerResponse(BaseModel):
    """Base response that includes a legal disclaimer."""

    disclaimer: str = (
        "This information is provided for educational and informational purposes only. "
        "It does not constitute legal advice. For guidance on your specific situation, "
        "please consult a licensed legal professional in your jurisdiction."
    )
