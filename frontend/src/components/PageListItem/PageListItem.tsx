import "./PageListItem.css";
import PageItem from "../PageItem/PageItem";
import type { HomePageItem } from "../PageListCard/PageListCard";

interface PageListItemProps {
  pages: HomePageItem[];
  onEdit: (id: string, newTitle: string, newCategory: string) => void;
  onShare: (id: string, email: string, permission: string) => void;
  onDelete: (id: string) => void;
  onLinkPermissionChange: (id: string, permission: string) => void;
}

function PageListItem({
  pages,
  onEdit,
  onShare,
  onDelete,
  onLinkPermissionChange,
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
          onShare={(email, permission) =>
            onShare(page.id, email, permission)
          }
          onDelete={() => onDelete(page.id)}
          onLinkPermissionChange={(permission) =>
            onLinkPermissionChange(page.id, permission)
          }
        />
      ))}
    </div>
  );
}

export default PageListItem;
