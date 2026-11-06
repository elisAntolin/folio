import { DropdownMenu } from "radix-ui";
import "./UserMenu.css";

import configuracoes from "../../../assets/configuracoes.svg";
import sair from "../../../assets/sair.svg";

import Avatar from "../../Avatar/Avatar";

interface UserMenuProps {
  name: string;
  photoUrl?: string;
  onSettingsClick?: () => void;
  onLogout?: () => void;
}

export default function UserMenu({
  name,
  photoUrl,
  onSettingsClick,
  onLogout,
}: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="user-menu-trigger"
        aria-label="Abrir menu do usuário"
      >
        <Avatar name={name} photoUrl={photoUrl} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="user-menu-content"
          side="bottom"
          align="end"
          sideOffset={8}
        >
          <DropdownMenu.Item
            className="user-menu-item"
            onSelect={onSettingsClick}
          >
            <img src={configuracoes} alt="" aria-hidden="true" />
            <span>Configurações</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="user-menu-separator" />

          <DropdownMenu.Item
            className="user-menu-item user-menu-logout"
            onSelect={onLogout}
          >
            <img src={sair} alt="" aria-hidden="true" />
            <span>Sair</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
