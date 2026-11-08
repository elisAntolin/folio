import "./PageListItem.css";
import PageItem from "../PageItem/PageItem";
import type { HomePageItem } from "../PageListCard/PageListCard";

interface PageListItemProps {
  pages: HomePageItem[];
  onEdit: (id: string, newTitle: string, newCategory: string) => void;
  onDelete: (id: string) => void;
  onLinkPermissionChange: (id: string, permission: string) => void;
  favoriteIds: string[];
  onFavoriteChange: (id: string, isFavorite: boolean) => void;
}

function PageListItem({
  pages,
  onEdit,
  onDelete,
  onLinkPermissionChange,
  favoriteIds,
  onFavoriteChange,
}: PageListItemProps) {
  return (
    <div className="page-list-item">
      {pages.map((page) => (
        <PageItem
          key={page.id}
          id={page.id}
          title={page.title}
          category={page.category}
          onEdit={(newTitle, newCategory) =>
            onEdit(page.id, newTitle, newCategory)
          }
          onDelete={() => onDelete(page.id)}
          onLinkPermissionChange={(permission) =>
            onLinkPermissionChange(page.id, permission)
          }
          isFavorite={favoriteIds.includes(page.id)}
          onFavoriteChange={(isFavorite) =>
            onFavoriteChange(page.id, isFavorite)
          }
        />
      ))}
    </div>
  );
}

export default PageListItem;
