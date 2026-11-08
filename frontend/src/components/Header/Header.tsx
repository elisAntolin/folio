import { useState } from "react";
import "./Header.css";
import logo from "/folio.svg";
import { Link } from "react-router";

import NotificationPageModal from "../modals/NotificationPageModal/NotificationPageModal";
import UserMenu from "../modals/UserMenu/UserMenu";
import SettingsModal from "../modals/SettingsModal/SettingsModal";

function Header() {
  const name = "Elis Cardoso";
  const photoUrl = undefined;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header>
      <Link to="/" className="header-logo-link" aria-label="Ir para a página inicial">
        <img className="header-logo" src={logo} alt="Folio" />
      </Link>

      <div className="header-actions">
        <NotificationPageModal></NotificationPageModal>
        <span className="header-divider">|</span>

        <button className="header-user">eliscardoso@gmail.com</button>

        <UserMenu
          name={name}
          photoUrl={photoUrl}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onLogout={() => console.log("Sair")}
        />
      </div>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </header>
  );
}

export default Header;
