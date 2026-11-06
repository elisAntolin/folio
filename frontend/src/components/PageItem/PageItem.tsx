import { Link } from "react-router";

import "./PageItem.css";

import capa from "../../assets/capa.jpg";
import clockIcon from "../../assets/relogio.svg";
import studyIcon from "../../assets/categoria-estudo.svg";

import PageActionsMenu from "../modals/PageActionsMenu/PageActionsMenu";

interface PageItemProps {
  id: string;
  title: string;
  category: string;
  onEdit: (newTitle: string) => void;
  onShare: (email: string, permission: string) => void;
  onDelete: () => void;
  onLinkPermissionChange: (permission: string) => void;
}

function PageItem({
  id,
  title,
  category,
  onEdit,
  onShare,
  onDelete,
  onLinkPermissionChange,
}: PageItemProps) {

  return (
    <div className="page-item">
      <div className="page-item-cover">
        <Link to={`/pages/${id}`} className="page-item-cover-link">
          <img src={capa} alt="Capa da página" />
        </Link>
      </div>

      <div className="page-item-body">
        <div className="page-item-title-bar">
          <h2>{title}</h2>

          <span className="page-item-badge page-item-category">
            <img src={studyIcon} alt="" />
            {category}
          </span>

          <span className="page-item-badge page-item-recent">
            <img src={clockIcon} alt="" />
            Recente
          </span>

          <PageActionsMenu
            currentTitle={title}
            publicLink={`/pages/${id}`}
            onEdit={onEdit}
            onShare={onShare}
            onDelete={onDelete}
            onLinkPermissionChange={onLinkPermissionChange}
          />
        </div>

        <div className="page-item-details">
          <p>57m atrás</p>
        </div>
      </div>
    </div>
  );
}

export default PageItem;
