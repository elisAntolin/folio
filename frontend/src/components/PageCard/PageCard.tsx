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
  onEdit: (newTitle: string, newCategory: string) => void;
  onShare: (email: string, permission: string) => void;
  onDelete: () => void;
  onLinkPermissionChange: (permission: string) => void;
  isFavorite: boolean;
  onFavoriteChange: (isFavorite: boolean) => void;
}

function PageCard({
  id,
  title,
  category,
  onEdit,
  onShare,
  onDelete,
  onLinkPermissionChange,
  isFavorite,
  onFavoriteChange,
}: PageCardProps) {

  return (
    <div className="page-card">
      <div className="page-card-cover">
        <Link to={`/pages/${id}`} className="page-card-cover-link">
          <img src={capa} alt="Capa da página" />
        </Link>
        <span className="page-card-badge page-card-category">
          <img src={studyIcon} alt="Categoria" />
          {category}
        </span>

        <span className="page-card-badge page-card-recent">
          <img src={clockIcon} alt="Recente" />
          Recente
        </span>
      </div>

      <div className="page-card-body">
        <div className="page-card-title-bar">
          <h2>{title}</h2>

          <PageActionsMenu
            currentTitle={title}
            currentCategory={category}
            publicLink={`/pages/${id}`}
            onEdit={onEdit}
            onShare={onShare}
            onDelete={onDelete}
            onLinkPermissionChange={onLinkPermissionChange}
            isFavorite={isFavorite}
            onFavoriteChange={onFavoriteChange}
          />
        </div>

        <p>57m atrás</p>
      </div>
    </div>
  );
}

export default PageCard;
