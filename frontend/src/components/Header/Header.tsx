import Avatar from "../Avatar/Avatar";
import "./Header.css";
import logo from "/folio.svg";
import sino from "../../assets/sino.svg";

function Header() {
  const name = "Elis Cardoso";
  const photoUrl = undefined; // Usuário sem foto

  return (
    <header>
      <img className="header-logo" src={logo} alt="Folio" />

      <div className="header-actions">
        <button className="header-bell">
          <img src={sino} alt="Notificações" />
        </button>

        <span className="header-divider">|</span>

        <button className="header-user">eliscardoso@gmail.com</button>

        <Avatar name={name} photoUrl={photoUrl} />
      </div>
    </header>
  );
}

export default Header;
