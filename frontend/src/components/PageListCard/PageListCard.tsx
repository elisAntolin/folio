import "./PageListCard.css";
import PageCard from "../PageCard/PageCard";

import type { PageSummary } from "../../api";

export type HomePageItem = PageSummary;

interface PageListCardProps {
  pages: HomePageItem[];
  onEdit: (id: string, newTitle: string, newCategory: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onFavoriteChange: (id: string, isFavorite: boolean) => void;
}

function PageListCard({
  pages,
  onEdit,
  onDelete,
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

export default PageListCard;
