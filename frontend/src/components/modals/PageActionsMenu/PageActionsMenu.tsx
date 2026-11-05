import { useState } from "react";
import "./PageActionsMenu.css";

import { DropdownMenu } from "radix-ui";

import EditPageModal from "../EditPageModal/EditPageModal";
import DeletePageModal from "../DeletePageModal/DeletePageModal";
import SharePageModal from "../SharePageModal/SharePageModal";

import lixeira from "../../../assets/lixeira.svg";
import estrela from "../../../assets/estrela.svg";
import estrela_preenchida from "../../../assets/estrela-preenchida.svg";
import editar from "../../../assets/editar-quadrado.svg";
import compartilhar from "../../../assets/compartilhar-seta.svg";
import pontosVertical from "../../../assets/pontos-vertical.svg";

interface PageActionsMenuProps {
  currentTitle: string;
  publicLink: string;
  onEdit: (newTitle: string) => void;
  onShare: (email: string, permission: string) => void;
  onDelete: () => void;
  onLinkPermissionChange: (permission: string) => void;
}

function PageActionsMenu({
  currentTitle,
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
            <img src={pontosVertical} alt="" />
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
              <img src={isFavorite ? estrela_preenchida : estrela} alt="" />
              <span>{isFavorite ? "Remover dos favoritos" : "Favoritar"}</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="page-actions-item"
              onSelect={() => setIsEditOpen(true)}
            >
              <img src={editar} alt="" />
              <span>Editar</span>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="page-actions-item"
              onSelect={() => setIsShareOpen(true)}
            >
              <img src={compartilhar} alt="" />
              <span>Compartilhar</span>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="page-actions-separator" />

            <DropdownMenu.Item
              className="page-actions-item delete"
              onSelect={() => setIsDeleteOpen(true)}
            >
              <img src={lixeira} alt="" />
              <span>Excluir</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <EditPageModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        currentTitle={currentTitle}
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
