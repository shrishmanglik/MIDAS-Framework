from fastapi import APIRouter

from app.api.v1.routes import auth, compliance, contracts, documents, health, immigration, legal

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(immigration.router, prefix="/immigration", tags=["immigration"])
api_v1_router.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
api_v1_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_v1_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
api_v1_router.include_router(legal.router, prefix="/legal", tags=["legal"])
