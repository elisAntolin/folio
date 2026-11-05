import { useState } from "react";

import "./ShareButton.css";

import SharePageModal from "../modals/SharePageModal/SharePageModal";
import compartilhar from "../../assets/compartilhar-seta.svg";

type ShareButtonProps = {
  pageTitle: string;
  publicLink: string;
  onInvite: (email: string) => void;
  onLinkPermissionChange: (permission: string) => void;
};

function ShareButton({
  pageTitle,
  publicLink,
  onInvite,
  onLinkPermissionChange,
}: ShareButtonProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <button className="share" onClick={() => setIsShareOpen(true)}>
        <img src={compartilhar} alt="" />
        <span>Compartilhar</span>
      </button>

      <SharePageModal
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        pageTitle={pageTitle}
        publicLink={publicLink}
        onInvite={onInvite}
        onLinkPermissionChange={onLinkPermissionChange}
      />
    </>
  );
}

export default ShareButton;
