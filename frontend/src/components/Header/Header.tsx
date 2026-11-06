// import Avatar from "../Avatar/Avatar";
import "./Header.css";
import logo from "/folio.svg";
// import sino from "../../assets/sino.svg";

import Notifications from "../modals/NotificationPageModal/NotificationPageModal";
import UserMenu from "../modals/UserMenu/UserMenu";

function Header() {
  const name = "Elis Cardoso";
  const photoUrl = undefined;

  return (
    <header>
      <img className="header-logo" src={logo} alt="Folio" />

      <div className="header-actions">
        {/* <button className="header-bell">
          <img src={sino} alt="Notificações" />
        </button> */}
        <Notifications></Notifications>
        <span className="header-divider">|</span>

        <button className="header-user">eliscardoso@gmail.com</button>

        {/* <Avatar name={name} photoUrl={photoUrl} /> */}
        <UserMenu
          name={name}
          photoUrl={photoUrl}
          onSettingsClick={() => console.log("Configurações")}
          onLogout={() => console.log("Sair")}
        />
      </div>
    </header>
  );
}

export default Header;
