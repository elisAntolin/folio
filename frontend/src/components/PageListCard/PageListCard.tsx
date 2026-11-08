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
}

function PageListCard({
  pages,
  onEdit,
  onShare,
  onDelete,
  onLinkPermissionChange,
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
        />
      ))}
    </div>
  );
}

export default PageListCard;
