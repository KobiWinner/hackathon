"""Category Repository Implementation."""

from typing import List, Optional, Type

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.i_repositories.i_category_repository import ICategoryRepository
from app.domain.schemas.products.category import (
    CategoryResponse,
    CategoryWithChildrenResponse,
)
from app.infrastructure.repositories.base_repository import BaseRepository
from app.persistence.models.products.category import Category as CategoryModel


class CategoryRepository(BaseRepository, ICategoryRepository):
    """
    Category Repository Implementation.
    Inherits from BaseRepository and implements ICategoryRepository interface.
    """

    orm_model: Type[CategoryModel] = CategoryModel
    schema_class: Type[CategoryResponse] = CategoryResponse

    def __init__(self, db: AsyncSession):
        super().__init__(db)

    async def get_by_id(self, category_id: int) -> Optional[CategoryResponse]:
        """Get category by ID."""
        result = await self.db.execute(
            select(CategoryModel).where(CategoryModel.id == category_id)
        )
        db_obj = result.scalars().first()
        return CategoryResponse.model_validate(db_obj) if db_obj else None

    async def get_by_slug(self, slug: str) -> Optional[CategoryResponse]:
        """Get category by slug."""
        result = await self.db.execute(
            select(CategoryModel).where(CategoryModel.slug == slug)
        )
        db_obj = result.scalars().first()
        return CategoryResponse.model_validate(db_obj) if db_obj else None

    async def get_by_id_or_slug(self, identifier: str) -> Optional[CategoryResponse]:
        """
        Get category by ID or slug.
        First tries slug, then ID if identifier is numeric.
        """
        # First try by slug
        category = await self.get_by_slug(identifier)
        if category:
            return category

        # If identifier is numeric, try by ID
        if identifier.isdigit():
            category = await self.get_by_id(int(identifier))

        return category

    async def get_all(self) -> List[CategoryResponse]:
        """Get all categories."""
        result = await self.db.execute(
            select(CategoryModel).order_by(CategoryModel.name)
        )
        db_objs = result.scalars().all()
        return [CategoryResponse.model_validate(obj) for obj in db_objs]

    async def get_with_children(
        self, category_id: int
    ) -> Optional[CategoryWithChildrenResponse]:
        """Get category with its children (nested)."""
        result = await self.db.execute(
            select(CategoryModel)
            .where(CategoryModel.id == category_id)
            .options(selectinload(CategoryModel.children))
        )
        db_obj = result.scalars().first()

        if not db_obj:
            return None

        return self._build_category_tree(db_obj)

    async def get_tree(self) -> List[CategoryWithChildrenResponse]:
        """Get full category tree (all root categories with nested children)."""
        # Get all categories with children loaded
        result = await self.db.execute(
            select(CategoryModel)
            .where(CategoryModel.parent_id.is_(None))  # Root categories only
            .options(selectinload(CategoryModel.children))
            .order_by(CategoryModel.name)
        )
        root_categories = result.scalars().all()

        # Build tree recursively
        tree = []
        for category in root_categories:
            tree.append(await self._build_category_tree_async(category))

        return tree

    def _build_category_tree(
        self, category: CategoryModel
    ) -> CategoryWithChildrenResponse:
        """Build category tree recursively (sync version for already loaded data)."""
        children = []
        if category.children:
            for child in category.children:
                children.append(self._build_category_tree(child))

        return CategoryWithChildrenResponse(
            id=category.id,
            name=category.name,
            slug=category.slug,
            parent_id=category.parent_id,
            children=children,
        )

    async def _build_category_tree_async(
        self, category: CategoryModel
    ) -> CategoryWithChildrenResponse:
        """Build category tree recursively (async version for lazy loading)."""
        # Load children if not already loaded
        result = await self.db.execute(
            select(CategoryModel)
            .where(CategoryModel.parent_id == category.id)
            .options(selectinload(CategoryModel.children))
            .order_by(CategoryModel.name)
        )
        children_models = result.scalars().all()

        children = []
        for child in children_models:
            children.append(await self._build_category_tree_async(child))

        return CategoryWithChildrenResponse(
            id=category.id,
            name=category.name,
            slug=category.slug,
            parent_id=category.parent_id,
            children=children,
        )
