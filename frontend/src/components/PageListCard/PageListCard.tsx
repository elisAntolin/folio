import "./PageListCard.css";
import PageCard from "../PageCard/PageCard";

import type { PageSummary } from "../../api";

export interface HomePageItem extends PageSummary {
  linkPermission: string;
}

interface PageListCardProps {
  pages: HomePageItem[];
  onEdit: (id: string, newTitle: string, newCategory: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onLinkPermissionChange: (id: string, permission: string) => void;
  favoriteIds: string[];
  onFavoriteChange: (id: string, isFavorite: boolean) => void;
}

function PageListCard({
  pages,
  onEdit,
  onDelete,
  onLinkPermissionChange,
  favoriteIds,
  onFavoriteChange,
}: PageListCardProps) {
  return (
    <div className="page-list">
      {pages.map((page) => (
        <PageCard
          key={page.id}
          id={page.id}
          title={page.title}
          category={page.categoryId ?? ""}
          coverImageUrl={page.coverImageUrl}
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

export default PageListCard;
