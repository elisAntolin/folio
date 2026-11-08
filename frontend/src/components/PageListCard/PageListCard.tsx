import "./PageListCard.css";
import PageCard from "../PageCard/PageCard";

export interface HomePageItem {
  id: string;
  title: string;
  category: string;
  categories?: string[];
  sharedEmails: string[];
  sharedPermission: string;
  linkPermission: string;
}

interface PageListCardProps {
  pages: HomePageItem[];
  onEdit: (id: string, newTitle: string, newCategory: string) => void;
  onShare: (id: string, email: string, permission: string) => void;
  onDelete: (id: string) => void;
  onLinkPermissionChange: (id: string, permission: string) => void;
  favoriteIds: string[];
  onFavoriteChange: (id: string, isFavorite: boolean) => void;
}

function PageListCard({
  pages,
  onEdit,
  onShare,
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
          category={page.category}
          onEdit={(newTitle, newCategory) =>
            onEdit(page.id, newTitle, newCategory)
          }
          onShare={(email, permission) =>
            onShare(page.id, email, permission)
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
