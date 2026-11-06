import { useState } from "react";
import "./PageActionsMenu.css";

import { DropdownMenu } from "radix-ui";

import EditPageModal from "../EditPageModal/EditPageModal";
import DeletePageModal from "../DeletePageModal/DeletePageModal";
import SharePageModal from "../SharePageModal/SharePageModal";

import trashIcon from "../../../assets/lixeira.svg";
import starIcon from "../../../assets/estrela.svg";
import filledStarIcon from "../../../assets/estrela-preenchida.svg";
import editIcon from "../../../assets/editar-quadrado.svg";
import shareIcon from "../../../assets/compartilhar-seta.svg";
import verticalDotsIcon from "../../../assets/pontos-vertical.svg";

interface PageActionsMenuProps {
  currentTitle: string;
  currentCategory: string;
  publicLink: string;
  onEdit: (newTitle: string, newCategory: string) => void;
  onShare: (email: string, permission: string) => void;
  onDelete: () => void;
  onLinkPermissionChange: (permission: string) => void;
}

function PageActionsMenu({
  currentTitle,
  currentCategory,
  publicLink,
  onEdit,
  onShare,
  onDelete,
  onLinkPermissionChange,
}: PageActionsMenuProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="page-actions-trigger"
            aria-label="Opções da página"
          >
            <img src={verticalDotsIcon} alt="" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="page-actions-content"
            align="end"
            sideOffset={8}
          >
            <DropdownMenu.Item
              className="page-actions-item"
              onSelect={handleFavorite}
            >
              <img
                src={isFavorite ? filledStarIcon : starIcon}
                alt=""
              />
              <span>{isFavorite ? "Remover dos favoritos" : "Favoritar"}</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="page-actions-item"
              onSelect={() => setIsEditOpen(true)}
            >
              <img src={editIcon} alt="" />
              <span>Editar</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="page-actions-item"
              onSelect={() => setIsShareOpen(true)}
            >
              <img src={shareIcon} alt="" />
              <span>Compartilhar</span>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="page-actions-separator" />

            <DropdownMenu.Item
              className="page-actions-item delete"
              onSelect={() => setIsDeleteOpen(true)}
            >
              <img src={trashIcon} alt="" />
              <span>Excluir</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <EditPageModal
        key={`${currentTitle}-${currentCategory}-${isEditOpen}`}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        currentTitle={currentTitle}
        currentCategory={currentCategory}
        onSave={onEdit}
      />

      <DeletePageModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        pageTitle={currentTitle}
        onDelete={onDelete}
      />

      <SharePageModal
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        pageTitle={currentTitle}
        publicLink={publicLink}
        onInvite={onShare}
        onLinkPermissionChange={onLinkPermissionChange}
      />
    </>
  );
}

export default PageActionsMenu;
