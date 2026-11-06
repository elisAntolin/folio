import { useRef, useState } from "react";
import { Dialog } from "radix-ui";
import "./CoverGalleryModal.css";

import capa from "../../../assets/capa.jpg";
import closeIcon from "../../../assets/fechar.svg";
import editImageIcon from "../../../assets/editar-imagem.svg";
import trashIcon from "../../../assets/lixeira.svg";

interface CoverGalleryModalProps {
  open: boolean;
  coverImage: string | null;
  onOpenChange: (open: boolean) => void;
  onCoverChange: (image: string) => void;
  onCoverRemove: () => void;
}

type CoverTab = "gallery" | "upload" | "url";

function CoverGalleryModal({
  open,
  coverImage,
  onOpenChange,
  onCoverChange,
  onCoverRemove,
}: CoverGalleryModalProps) {
  const [activeTab, setActiveTab] = useState<CoverTab>("gallery");
  const [imageUrl, setImageUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleOpenChange(value: boolean) {
    onOpenChange(value);

    if (!value) {
      setActiveTab("gallery");
      setImageUrl("");
      setErrorMessage("");
    }
  }

  function handleGallerySelect() {
    onCoverChange(capa);
    onOpenChange(false);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Selecione um arquivo de imagem válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setErrorMessage("Não foi possível carregar a imagem.");
        return;
      }

      onCoverChange(reader.result);
      onOpenChange(false);
    };
    reader.onerror = () => {
      setErrorMessage("Não foi possível carregar a imagem.");
    };
    reader.readAsDataURL(file);
  }

  function handleUrlApply() {
    const normalizedUrl = imageUrl.trim();

    if (!normalizedUrl) {
      setErrorMessage("Informe uma URL de imagem.");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      setErrorMessage("Informe uma URL válida.");
      return;
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      setErrorMessage("Use uma URL pública de imagem.");
      return;
    }

    const image = new Image();
    image.onload = () => {
      onCoverChange(normalizedUrl);
      onOpenChange(false);
    };
    image.onerror = () => {
      setErrorMessage("A URL não corresponde a uma imagem válida.");
    };
    image.src = normalizedUrl;
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cover-gallery-overlay" />

        <Dialog.Content className="cover-gallery-modal">
          <div className="cover-gallery-header">
            <div className="cover-gallery-heading">
              <img src={editImageIcon} alt="" aria-hidden="true" />
              <Dialog.Title className="cover-gallery-title">
                Galeria de Capas
              </Dialog.Title>
            </div>

            <Dialog.Close className="cover-gallery-close" aria-label="Fechar">
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="cover-gallery-tabs" role="tablist">
            <button
              type="button"
              className={`cover-gallery-tab ${
                activeTab === "gallery" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("gallery");
                setErrorMessage("");
              }}
            >
              Galeria Nativa
            </button>
            <button
              type="button"
              className={`cover-gallery-tab ${
                activeTab === "upload" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("upload");
                setErrorMessage("");
              }}
            >
              Fazer Upload
            </button>
            <button
              type="button"
              className={`cover-gallery-tab ${
                activeTab === "url" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("url");
                setErrorMessage("");
              }}
            >
              URL de Imagem
            </button>
          </div>

          <div className="cover-gallery-body">
            {activeTab === "gallery" && (
              <div className="cover-gallery-grid">
                <button
                  type="button"
                  className={`cover-gallery-option ${
                    coverImage === capa ? "selected" : ""
                  }`}
                  onClick={handleGallerySelect}
                  aria-label="Selecionar capa nativa"
                >
                  <img src={capa} alt="Capa nativa" />
                </button>
              </div>
            )}

            {activeTab === "upload" && (
              <div className="cover-gallery-upload">
                <input
                  ref={fileInputRef}
                  className="cover-gallery-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="cover-gallery-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar imagem
                </button>
                <p>Escolha uma imagem do seu computador para usar como capa.</p>
              </div>
            )}

            {activeTab === "url" && (
              <div className="cover-gallery-url">
                <label htmlFor="cover-image-url">
                  Cole a URL direta da imagem
                </label>
                <input
                  id="cover-image-url"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(event) => {
                    setImageUrl(event.target.value);
                    setErrorMessage("");
                  }}
                />
                <button
                  type="button"
                  className="cover-gallery-apply"
                  onClick={handleUrlApply}
                >
                  Aplicar URL
                </button>
                <p>
                  Funciona com links diretos de imagens públicas (Unsplash,
                  Pexels, Imgur, etc.).
                </p>
              </div>
            )}

            {errorMessage && (
              <p className="cover-gallery-error" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="cover-gallery-footer">
            <button
              type="button"
              className="cover-gallery-remove"
              onClick={() => {
                onCoverRemove();
                onOpenChange(false);
              }}
            >
              <img src={trashIcon} alt="" aria-hidden="true" />
              Remover capa
            </button>

            <Dialog.Close className="cover-gallery-done">Fechar</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CoverGalleryModal;
