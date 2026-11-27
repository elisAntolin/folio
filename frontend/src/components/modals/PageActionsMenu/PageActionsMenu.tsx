import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import type { PageAccess } from "../../../api";
import EditPageModal from "../EditPageModal/EditPageModal";
import DeletePageModal from "../DeletePageModal/DeletePageModal";
import { PageSharingDialog } from "../../ShareButton/PageSharingButton";
import Icon from "../../Icon/Icon";
import trashIcon from "../../../assets/lixeira.svg";
import editIcon from "../../../assets/editar-quadrado.svg";
import shareIcon from "../../../assets/compartilhar-seta.svg";
import verticalDotsIcon from "../../../assets/pontos-vertical.svg";
import "./PageActionsMenu.css";

interface PageActionsMenuProps {
  id: string;
  currentTitle: string;
  currentCategory: string;
  permission: PageAccess;
  onEdit: (newTitle: string, newCategory: string) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  isFavorite: boolean;
  onFavoriteChange: (favorite: boolean) => void;
}

export default function PageActionsMenu({
  id, currentTitle, currentCategory, permission, onEdit, onDelete, isFavorite, onFavoriteChange,
}: PageActionsMenuProps) {
  const [active, setActive] = useState<"edit" | "delete" | "share" | null>(null);
  const owner = permission === "OWNER";

  return <>
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button className="page-actions-trigger" aria-label="Opções da página">
          <img src={verticalDotsIcon} alt="" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="page-actions-content" align="end" sideOffset={8}>
          <DropdownMenu.Item className="page-actions-item" onSelect={() => onFavoriteChange(!isFavorite)}>
            <Icon name="star" filled={isFavorite} />
            {isFavorite ? "Remover dos favoritos" : "Favoritar"}
          </DropdownMenu.Item>
          {permission !== "VIEWER" && <DropdownMenu.Item className="page-actions-item" onSelect={() => setActive("edit")}>
            <img src={editIcon} alt="" /> {owner ? "Editar" : "Renomear"}
          </DropdownMenu.Item>}
          {owner && <>
            <DropdownMenu.Item className="page-actions-item" onSelect={() => setActive("share")}>
              <img src={shareIcon} alt="" /> Compartilhar
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="page-actions-separator" />
            <DropdownMenu.Item className="page-actions-item delete" onSelect={() => setActive("delete")}>
              <img src={trashIcon} alt="" /> Excluir
            </DropdownMenu.Item>
          </>}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
    {active === "edit" && <EditPageModal
      open onOpenChange={(open) => { if (!open) setActive(null); }}
      currentTitle={currentTitle} currentCategory={currentCategory} canChangeCategory={owner} onSave={onEdit}
    />}
    {owner && active === "delete" && <DeletePageModal
      open onOpenChange={(open) => { if (!open) setActive(null); }} pageTitle={currentTitle} onDelete={onDelete}
    />}
    {owner && active === "share" && <PageSharingDialog
      id={id} title={currentTitle} open onOpenChange={(open) => { if (!open) setActive(null); }}
    />}
  </>;
}
