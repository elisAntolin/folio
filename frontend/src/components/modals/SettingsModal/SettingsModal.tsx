import { Dialog } from "radix-ui";
import "./SettingsModal.css";

import closeIcon from "../../../assets/fechar.svg";
import settingsIcon from "../../../assets/configuracoes.svg";
import systemThemeIcon from "../../../assets/tema-sistema.svg";
import lightThemeIcon from "../../../assets/tema-claro.svg";
import darkThemeIcon from "../../../assets/tema-escuro.svg";
import {
  useThemeSettings,
  type ThemePreference,
} from "../../../settings";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const themes: Array<{
  value: ThemePreference;
  label: string;
  icon: string;
}> = [
  { value: "system", label: "Sistema", icon: systemThemeIcon },
  { value: "light", label: "Claro", icon: lightThemeIcon },
  { value: "dark", label: "Escuro", icon: darkThemeIcon },
];

function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, canSave, isSaving, error, retry, save } = useThemeSettings();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="settings-overlay" />
        <Dialog.Content className="settings-modal">
          <div className="settings-header">
            <div className="settings-heading">
              <img src={settingsIcon} alt="" aria-hidden="true" />
              <Dialog.Title className="settings-title">
                Configurações
              </Dialog.Title>
            </div>
            <Dialog.Close className="settings-close" aria-label="Cancelar">
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <section aria-labelledby="settings-theme-title">
            <h2 id="settings-theme-title" className="settings-section-title">
              Tema
            </h2>
            <div className="settings-theme-options" role="radiogroup">
              {themes.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`settings-theme-option${
                    theme === option.value ? " selected" : ""
                  }`}
                  role="radio"
                  aria-checked={theme === option.value}
                  disabled={!canSave}
                  onClick={() => void save(option.value)}
                >
                  <img src={option.icon} alt="" aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            {isSaving && <p role="status">Salvando tema…</p>}
            {!canSave && !isSaving && !error && <p role="status">Carregando tema…</p>}
            {error && <p role="alert">{error}</p>}
            {retry && <button type="button" onClick={retry}>Tentar novamente</button>}
          </section>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default SettingsModal;
