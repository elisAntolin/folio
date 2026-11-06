import { useState } from "react";
import { useLocation } from "react-router";
import "./PageDocument.css";

import capa from "../../assets/capa.jpg";
import editImageIcon from "../../assets/editar-imagem.svg";
import CoverGalleryModal from "../modals/CoverGalleryModal/CoverGalleryModal";

function PageDocument() {
  const location = useLocation();
  const [coverImage, setCoverImage] = useState<string | null>(() =>
    location.state?.isNewPage ? null : capa,
  );
  const [isCoverGalleryOpen, setIsCoverGalleryOpen] = useState(false);

  return (
    <>
      <div className="page-document">
        <div className="page-document-cover">
          {coverImage ? (
            <img src={coverImage} alt="Capa do documento da página" />
          ) : (
            <div className="page-document-cover-empty" />
          )}

          <button
            className="page-document-edit-image"
            title="Alterar imagem da capa"
            onClick={() => setIsCoverGalleryOpen(true)}
          >
            <img src={editImageIcon} alt="" />
          </button>
        </div>

        <div
          className="page-document-body"
          contentEditable
          role="textbox"
          aria-label="Conteúdo do documento"
          suppressContentEditableWarning
        />
      </div>

      <CoverGalleryModal
        open={isCoverGalleryOpen}
        coverImage={coverImage}
        onOpenChange={setIsCoverGalleryOpen}
        onCoverChange={setCoverImage}
        onCoverRemove={() => setCoverImage(null)}
      />
    </>
  );
}

export default PageDocument;
