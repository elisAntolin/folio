import { useState, useSyncExternalStore } from "react";
import "./Header.css";
import logo from "/folio.svg";
import { Link, useNavigate } from "react-router";
import { endSession, getSession, subscribeSession } from "../../session";

import NotificationPageModal from "../modals/NotificationPageModal/NotificationPageModal";
import UserMenu from "../modals/UserMenu/UserMenu";
import SettingsModal from "../modals/SettingsModal/SettingsModal";

function Header() {
  const navigate = useNavigate();
  const session = useSyncExternalStore(subscribeSession, getSession);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      await endSession();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Não foi possível encerrar a sessão. Tente novamente.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header>
      <Link to="/" className="header-logo-link" aria-label="Ir para a página inicial">
        <img className="header-logo" src={logo} alt="Folio" />
        <span className="header-wordmark" aria-hidden="true">folio<span>.</span></span>
      </Link>

      <div className="header-actions">
        {logoutError && <span role="alert">{logoutError}</span>}
        <NotificationPageModal></NotificationPageModal>
        <span className="header-divider">|</span>

        <span className="header-user">{session?.email}</span>

        <UserMenu
          name={session?.email ?? ""}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />
      </div>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </header>
  );
}

export default Header;
