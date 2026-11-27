import { useState } from "react";
import { useLocation, useParams } from "react-router";
import "./PageDocument.css";
import BlockEditor from "../BlockEditor/BlockEditor";
import type { BlockEditorProps } from "../BlockEditor/BlockEditor";

import capa from "../../assets/capa.jpg";
import editImageIcon from "../../assets/editar-imagem.svg";
import CoverGalleryModal from "../modals/CoverGalleryModal/CoverGalleryModal";

type PageDocumentProps = BlockEditorProps & {
  onBlur?: () => void;
  editorKey?: number;
};

function PageDocument({ initialContent, onChange, onBlur, editorKey }: PageDocumentProps) {
  const { id } = useParams();
  const location = useLocation();
  const [coverImage, setCoverImage] = useState<string | null>(() =>
    location.state?.isNewPage ? null : capa,
  );
  const [isCoverGalleryOpen, setIsCoverGalleryOpen] = useState(false);

  return (
    <>
      <div className="page-document">
        <div className="page-document-cover">
          {coverImage && coverImage.startsWith("#") ? (
            <div
              className="page-document-cover-color"
              style={{ backgroundColor: coverImage }}
              aria-label="Cor de fundo da capa"
            />
          ) : coverImage ? (
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

        <div className="page-document-body" onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.();
        }}>
          <BlockEditor key={`${id}-${editorKey ?? 0}`} initialContent={initialContent} onChange={onChange} />
        </div>
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
