import { useContext } from "react";
import { PageCategoriesContext } from "../../pageCategories";
import { Link } from "react-router";

import "./PageCard.css";

import PageActionsMenu from "../modals/PageActionsMenu/PageActionsMenu";

import capa from "../../assets/capa.jpg";
import clockIcon from "../../assets/relogio.svg";
import studyIcon from "../../assets/categoria-estudo.svg";

interface PageCardProps {
  id: string;
  title: string;
  category: string;
  coverImageUrl: string | null;
  onEdit: (newTitle: string, newCategory: string) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onLinkPermissionChange: (permission: string) => void;
  isFavorite: boolean;
  onFavoriteChange: (isFavorite: boolean) => void;
}

function PageCard({
  id,
  title,
  category,
  coverImageUrl,
  onEdit,
  onDelete,
  onLinkPermissionChange,
  isFavorite,
  onFavoriteChange,
}: PageCardProps) {
  const categories = useContext(PageCategoriesContext);
  const categoryName = categories?.find(({ id }) => id === category)?.name ?? "Sem categoria";

  return (
    <div className="page-card">
      <div className="page-card-cover">
        <Link to={`/pages/${id}`} className="page-card-cover-link">
          <img src={coverImageUrl ?? capa} alt="Capa da página" />
        </Link>
        <span className="page-card-badge page-card-recent">
          <img src={clockIcon} alt="Recente" />
          Recente
        </span>
        <div className="page-card-actions">
          <PageActionsMenu
            currentTitle={title}
            currentCategory={category}
            publicLink={`/pages/${id}`}
            onEdit={onEdit}
            onDelete={onDelete}
            onLinkPermissionChange={onLinkPermissionChange}
            isFavorite={isFavorite}
            onFavoriteChange={onFavoriteChange}
          />
        </div>
      </div>

      <div className="page-card-body">
        <div className="page-card-title-bar">
          <h2>{title}</h2>
          <span className="page-card-badge page-card-category">
            <img src={studyIcon} alt="Categoria" />
            {categoryName}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PageCard;
