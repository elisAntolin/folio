import "./PageItem.css";

import capa from "../../assets/capa.jpg";
import pontosVertical from "../../assets/pontos-vertical.svg";
import relogio from "../../assets/relogio.svg";
import estudo from "../../assets/categoria-estudo.svg";

function PageList() {
  return (
    <div className="page-item">
      <div className="page-item-cover">
        <img src={capa} alt="Capa da página" />
      </div>

      <div className="page-item-body">
        <div className="page-item-title-bar">
          <h2>🤖 Back-end</h2>

          <span className="page-item-badge page-item-category">
            <img src={estudo} alt="" />
            Estudos
          </span>

          <span className="page-item-badge page-item-recent">
            <img src={relogio} alt="" />
            Recente
          </span>
        </div>

        <div className="page-item-details">
          <p>57m atrás</p>
        </div>
      </div>

      <button className="page-item-menu-button" aria-label="Mais opções">
        <img src={pontosVertical} alt="" />
      </button>
    </div>
  );
}

export default PageList;
