from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class ResourceNotFoundError(Exception):
    def __init__(self, resource: str, identifier: str | None = None):
        self.resource = resource
        self.identifier = identifier
        msg = f"{resource} not found"
        if identifier:
            msg = f"{resource} '{identifier}' not found"
        super().__init__(msg)


class DuplicateResourceError(Exception):
    def __init__(self, resource: str, field: str, value: str):
        self.resource = resource
        self.field = field
        self.value = value
        super().__init__(f"{resource} with {field}='{value}' already exists")


class InsufficientPermissionsError(Exception):
    def __init__(self, action: str = "perform this action"):
        self.action = action
        super().__init__(f"Insufficient permissions to {action}")


class ContractParsingError(Exception):
    def __init__(self, detail: str = "Failed to parse contract"):
        self.detail = detail
        super().__init__(detail)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ResourceNotFoundError)
    async def resource_not_found_handler(request: Request, exc: ResourceNotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)},
        )

    @app.exception_handler(DuplicateResourceError)
    async def duplicate_resource_handler(request: Request, exc: DuplicateResourceError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": str(exc)},
        )

    @app.exception_handler(InsufficientPermissionsError)
    async def insufficient_permissions_handler(request: Request, exc: InsufficientPermissionsError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": str(exc)},
        )

    @app.exception_handler(ContractParsingError)
    async def contract_parsing_handler(request: Request, exc: ContractParsingError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.detail},
        )
