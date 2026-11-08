import { useState } from "react";

import "./ShareButton.css";

import SharePageModal from "../modals/SharePageModal/SharePageModal";
import shareIcon from "../../assets/compartilhar-seta.svg";

interface ShareButtonProps {
  pageTitle: string;
  publicLink: string;
  onLinkPermissionChange: (permission: string) => void;
}

function ShareButton({
  pageTitle,
  publicLink,
  onLinkPermissionChange,
}: ShareButtonProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <button className="share" onClick={() => setIsShareOpen(true)}>
        <img src={shareIcon} alt="" />
        <span>Compartilhar</span>
      </button>

      <SharePageModal
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        pageTitle={pageTitle}
        publicLink={publicLink}
        onLinkPermissionChange={onLinkPermissionChange}
      />
    </>
  );
}

export default ShareButton;
