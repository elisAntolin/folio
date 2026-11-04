import "./PageDocument.css";

import capa from "../../assets/capa.jpg";
import editar_imagem from "../../assets/editar-imagem.svg";

function PageDocument() {
  return (
    <div className="page-document">
      <div className="page-document-cover">
        <img src={capa} alt="Capa do documento da página" />

        <button
          className="page-document-edit-image"
          title="Alterar imagem da capa"
        >
          <img src={editar_imagem} alt="" />
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
  );
}

export default PageDocument;
