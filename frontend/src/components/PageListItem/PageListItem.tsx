import "./PageListItem.css";
import PageItem from "../PageItem/PageItem";
import type { HomePageItem } from "../PageListCard/PageListCard";

interface PageListItemProps {
  pages: HomePageItem[];
  onEdit: (id: string, newTitle: string, newCategory: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onFavoriteChange: (id: string, isFavorite: boolean) => void;
}

function PageListItem({
  pages,
  onEdit,
  onDelete,
  onFavoriteChange,
}: PageListItemProps) {
  return (
    <div className="page-list-item">
      {pages.map((page) => (
        <PageItem
          key={page.id}
          id={page.id}
          title={page.title}
          category={page.categoryId ?? ""}
          coverImageUrl={page.coverImageUrl}
          onEdit={(newTitle, newCategory) =>
            onEdit(page.id, newTitle, newCategory)
          }
          onDelete={() => onDelete(page.id)}
          permission={page.permission}
          isFavorite={page.favorite}
          onFavoriteChange={(isFavorite) =>
            onFavoriteChange(page.id, isFavorite)
          }
        />
      ))}
    </div>
  );
}

export default PageListItem;
