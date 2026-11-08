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

type CoverTab = "gallery" | "upload";
const standardBackgrounds = [
  "#ffffff",
  "#f8fafc",
  "#eff8ff",
  "#fef3c7",
  "#fce7f3",
  "#ede9fe",
];

function CoverGalleryModal({
  open,
  coverImage,
  onOpenChange,
  onCoverChange,
  onCoverRemove,
}: CoverGalleryModalProps) {
  const [activeTab, setActiveTab] = useState<CoverTab>("gallery");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleOpenChange(value: boolean) {
    onOpenChange(value);

    if (!value) {
      setActiveTab("gallery");
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

  function handleDroppedFile(file: File | undefined) {
    if (!file) return;

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
    reader.onerror = () => setErrorMessage("Não foi possível carregar a imagem.");
    reader.readAsDataURL(file);
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

            <Dialog.Close className="cover-gallery-close" aria-label="Cancelar">
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
          </div>

          <div className="cover-gallery-body">
            {activeTab === "gallery" && (
              <div className="cover-gallery-native">
                <section>
                  <h3>Imagens</h3>
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
                </section>

                <section>
                  <h3>Cores de fundo padrão</h3>
                  <div className="cover-gallery-colors">
                    {standardBackgrounds.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`cover-gallery-color ${
                          coverImage === color ? "selected" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          onCoverChange(color);
                          onOpenChange(false);
                        }}
                        aria-label={`Selecionar cor ${color}`}
                      />
                    ))}
                  </div>
                </section>
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
                  className={`cover-gallery-dropzone ${
                    isDragging ? "dragging" : ""
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    handleDroppedFile(event.dataTransfer.files[0]);
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="8.5" cy="9" r="1.5" />
                    <path d="m4 17 4-4 3 3 2-2 5 5" />
                  </svg>
                  <strong>Selecionar imagem</strong>
                  <span>ou arraste e solte aqui</span>
                </button>
                <p>Escolha uma imagem do seu computador para usar como capa.</p>
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

            <Dialog.Close className="cover-gallery-done">Cancelar</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CoverGalleryModal;
