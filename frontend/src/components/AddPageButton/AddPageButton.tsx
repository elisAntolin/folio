import "./AddPageButton.css";

import mais from "../../assets/mais.svg";

function AddPageButton() {
  return (
    <button className="new-page">
      <img src={mais} alt="Nova Páginas" />
      <span>Nova Página</span>
    </button>
  );
}

export default AddPageButton;
