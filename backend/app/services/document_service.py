"""
Document template service.

Lists templates, renders Jinja2 templates with user-provided variables,
and stores generated documents.
"""

import uuid
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, TemplateNotFound
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ResourceNotFoundError
from app.models.documents import DocumentTemplate, UserDocument
from app.schemas.documents import (
    DocumentGenerateRequest,
    DocumentGenerateResponse,
    TemplateDetailResponse,
    TemplateListResponse,
)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "data" / "document_templates"

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=False,
    trim_blocks=True,
    lstrip_blocks=True,
)


class DocumentService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_templates(self, category: str | None = None) -> list[TemplateListResponse]:
        """List all available document templates, optionally filtered by category."""
        query = select(DocumentTemplate).order_by(DocumentTemplate.name)
        if category:
            query = query.where(DocumentTemplate.category == category)

        result = await self.session.execute(query)
        templates = result.scalars().all()
        return [TemplateListResponse.model_validate(t) for t in templates]

    async def get_template(self, template_id: uuid.UUID) -> TemplateDetailResponse:
        """Get a specific template by ID."""
        result = await self.session.execute(
            select(DocumentTemplate).where(DocumentTemplate.id == template_id)
        )
        template = result.scalar_one_or_none()
        if template is None:
            raise ResourceNotFoundError("DocumentTemplate", str(template_id))
        return TemplateDetailResponse.model_validate(template)

    async def generate_document(
        self,
        user_id: uuid.UUID,
        request: DocumentGenerateRequest,
    ) -> DocumentGenerateResponse:
        """Generate a document by rendering a Jinja2 template with provided variables."""
        # Fetch the template record
        result = await self.session.execute(
            select(DocumentTemplate).where(DocumentTemplate.id == request.template_id)
        )
        template = result.scalar_one_or_none()
        if template is None:
            raise ResourceNotFoundError("DocumentTemplate", str(request.template_id))

        # Render the template content
        try:
            jinja_template = jinja_env.from_string(template.template_content)
            rendered_content = jinja_template.render(**request.variables)
        except Exception as exc:
            raise ResourceNotFoundError("Template rendering failed", str(exc))

        # Determine the title
        title = request.title or f"{template.name} - Generated Document"

        # Save the generated document
        doc = UserDocument(
            user_id=user_id,
            template_id=template.id,
            title=title,
            content=rendered_content,
        )
        self.session.add(doc)
        await self.session.flush()
        await self.session.refresh(doc)

        return DocumentGenerateResponse(
            id=doc.id,
            title=doc.title,
            content=doc.content,
            template_id=doc.template_id,
            created_at=doc.created_at,
        )
