import { useState } from "react";
import { DropdownMenu } from "radix-ui";

import "./ShareButton.css";

import SharePageModal from "../modals/SharePageModal/SharePageModal";
import shareIcon from "../../assets/compartilhar-seta.svg";
import InternalMemberModal from "../modals/InternalMemberModal/InternalMemberModal";
import linkIcon from "../../assets/link.svg";
import membersIcon from "../../assets/membros.svg";

interface ShareButtonProps {
  pageTitle: string;
  publicLink: string;
  internal?: boolean;
  onInvite?: (email: string, permission: string) => void;
  onLinkPermissionChange: (permission: string) => void;
}

function ShareButton({
  pageTitle,
  publicLink,
  internal = false,
  onInvite,
  onLinkPermissionChange,
}: ShareButtonProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);

  return (
    <>
      {internal ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="share">
              <img src={shareIcon} alt="" />
              <span>Compartilhar</span>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="share-options-menu"
              align="end"
              sideOffset={8}
            >
              <DropdownMenu.Item
                className="share-options-item"
                onSelect={() => setIsShareOpen(true)}
              >
                <img src={linkIcon} alt="" aria-hidden="true" />
                Link da Página
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="share-options-item"
                onSelect={() => setIsMemberOpen(true)}
              >
                <img src={membersIcon} alt="" aria-hidden="true" />
                Gerenciar Membro
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ) : (
        <button
          type="button"
          className="share"
          onClick={() => setIsShareOpen(true)}
        >
          <img src={shareIcon} alt="" />
          <span>Compartilhar</span>
        </button>
      )}

      <SharePageModal
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        pageTitle={pageTitle}
        publicLink={publicLink}
        onLinkPermissionChange={onLinkPermissionChange}
      />
      {internal && (
        <InternalMemberModal
          open={isMemberOpen}
          onOpenChange={setIsMemberOpen}
          pageTitle={pageTitle}
          onInvite={onInvite ?? (() => undefined)}
        />
      )}
    </>
  );
}

export default ShareButton;
