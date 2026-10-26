import "./PageCard.css";
import capa from "../../assets/capa.jpg";
import pontosVertical from "../../assets/pontos-vertical.svg";
import relogio from "../../assets/relogio.svg";
import estudo from "../../assets/categoria-estudo.svg";

function PageCard() {
  return (
    <div className="page-card">
      <div className="page-card-cover">
        <img src={capa} alt="Capa da página" />
        <span className="page-card-badge page-card-category">
          <img src={estudo} alt="Categoria" />
          Estudos
        </span>

        <span className="page-card-badge page-card-recent">
          <img src={relogio} alt="Recente" />
          Recente
        </span>
      </div>

      <div className="page-card-body">
        <div className="page-card-title-bar">
          <h2>🤖 Back-end</h2>

          <button className="page-card-menu-button" aria-label="Mais opções">
            <img src={pontosVertical} alt="" />
          </button>
        </div>

        <p>57m atrás</p>
      </div>
    </div>
  );
}

export default PageCard;
