"""Category Repository Interface."""

from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.schemas.products.category import (
    CategoryResponse,
    CategoryWithChildrenResponse,
)


class ICategoryRepository(ABC):
    """
    Category Repository Interface.
    Defines the contract for category data access.
    """

    @abstractmethod
    async def get_by_id(self, category_id: int) -> Optional[CategoryResponse]:
        """Get category by ID."""
        raise NotImplementedError

    @abstractmethod
    async def get_by_slug(self, slug: str) -> Optional[CategoryResponse]:
        """Get category by slug."""
        raise NotImplementedError

    @abstractmethod
    async def get_by_id_or_slug(self, identifier: str) -> Optional[CategoryResponse]:
        """
        Get category by ID or slug.
        First tries to find by slug, then by ID if identifier is numeric.
        """
        raise NotImplementedError

    @abstractmethod
    async def get_all(self) -> List[CategoryResponse]:
        """Get all categories."""
        raise NotImplementedError

    @abstractmethod
    async def get_with_children(
        self, category_id: int
    ) -> Optional[CategoryWithChildrenResponse]:
        """Get category with its children (nested)."""
        raise NotImplementedError

    @abstractmethod
    async def get_tree(self) -> List[CategoryWithChildrenResponse]:
        """Get full category tree (all root categories with nested children)."""
        raise NotImplementedError
