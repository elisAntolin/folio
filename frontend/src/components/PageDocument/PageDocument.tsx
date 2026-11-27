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
  coverImage?: string | null;
  onCoverChange?: (cover: string | null) => Promise<void>;
};

function PageDocument({ initialContent, onChange, onBlur, editorKey, editable, coverImage, onCoverChange }: PageDocumentProps) {
  const { id } = useParams();
  const [isCoverGalleryOpen, setIsCoverGalleryOpen] = useState(false);
  const location = useLocation();
  const [localCover, setLocalCover] = useState<string | null>(() =>
    location.state?.isNewPage ? null : capa,
  );
  const cover = coverImage === undefined ? localCover : coverImage;
  const [coverError, setCoverError] = useState("");

  async function changeCover(image: string | null) {
    setCoverError("");
    try {
      if (onCoverChange) await onCoverChange(image === capa ? "/folio-cover.jpg" : image);
      else setLocalCover(image);
    } catch (error) {
      setCoverError(error instanceof Error ? error.message : "Não foi possível salvar a capa.");
    }
  }

  return (
    <>
      <div className="page-document">
        <div className="page-document-cover">
          {cover && cover.startsWith("#") ? (
            <div
              className="page-document-cover-color"
              style={{ backgroundColor: cover }}
              aria-label="Cor de fundo da capa"
            />
          ) : cover ? (
            <img src={cover} alt="Capa do documento da página" />
          ) : (
            <div className="page-document-cover-empty" />
          )}

          {editable !== false && (onCoverChange || coverImage === undefined) && <button
            className="page-document-edit-image"
            title="Alterar imagem da capa"
            onClick={() => setIsCoverGalleryOpen(true)}
          >
            <img src={editImageIcon} alt="" />
          </button>}
        </div>

        {coverError && <p role="alert">{coverError}</p>}
        <div className="page-document-body" onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.();
        }}>
          <BlockEditor key={`${id}-${editorKey ?? 0}`} initialContent={initialContent} onChange={onChange} editable={editable} />
        </div>
      </div>

      <CoverGalleryModal
        open={isCoverGalleryOpen}
        coverImage={cover}
        onOpenChange={setIsCoverGalleryOpen}
        onCoverChange={changeCover}
        onCoverRemove={() => changeCover(null)}
      />
    </>
  );
}

export default PageDocument;
