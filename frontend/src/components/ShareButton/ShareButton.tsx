import "./ShareButton.css";

import compartilhar from "../../assets/compartilhar-seta.svg";

function ShareButton() {
  return (
    <button className="share">
      <img src={compartilhar} alt="Nova Páginas" />
      <span>Compartilhar</span>
    </button>
  );
}

export default ShareButton;
