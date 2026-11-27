import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { changeLink, changeMember, generateLink, inviteMember, listSharing,
  type PageMember, type ShareLink, type SharePermission } from "../../sharingApi";
import shareIcon from "../../assets/compartilhar-seta.svg";
import "./ShareButton.css";
import "../modals/SharePageModal/SharePageModal.css";

function SharingSettings({ id }: { id: string }) {
  const [members, setMembers] = useState<PageMember[]>([]);
  const [link, setLink] = useState<ShareLink>();
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("VIEWER");
  const [linkPermission, setLinkPermission] = useState<SharePermission>("VIEWER");
  const [expiry, setExpiry] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(true);
  const [loaded, setLoaded] = useState(false);

  function apply([people, links]: [PageMember[], ShareLink[]]) {
    setMembers(people);
    const active = links.find((item) => !item.revokedAt);
    setLink(active);
    setLinkPermission(active?.permission ?? "VIEWER");
    const instant = active?.expiresAt ? new Date(active.expiresAt) : null;
    setExpiry(instant
      ? new Date(instant.getTime() - instant.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
      : "");
  }

  useEffect(() => {
    const controller = new AbortController();
    void listSharing(id, controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      apply(data);
      setLoaded(true);
      setBusy(false);
    }, (reason: unknown) => {
      if (controller.signal.aborted) return;
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar o compartilhamento.");
      setBusy(false);
    });
    return () => controller.abort();
  }, [id]);

  async function run(operation: () => Promise<void>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await operation();
      apply(await listSharing(id));
      setMessage(success);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível atualizar o compartilhamento.");
    } finally {
      setBusy(false);
    }
  }

  async function createLink() {
    const generated = await generateLink(id, linkPermission, expiry ? new Date(expiry).toISOString() : null);
    setUrl(new URL(`/shared/${generated.token}`, import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin).href);
  }

  return <fieldset className="share-settings" disabled={busy || !loaded}>
    <form onSubmit={(event) => {
      event.preventDefault();
      void run(async () => { await inviteMember(id, email, permission); setEmail(""); }, "Acesso concedido.");
    }}>
      <label htmlFor="share-email">E-mail da conta</label>
      <input id="share-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <PermissionSelect value={permission} onChange={setPermission} label="Permissão da conta" />
      <button type="submit" className="share-primary-button">Convidar</button>
    </form>
    <h3>Pessoas com acesso</h3>
    <ul>
      {members.map((member) => <li key={member.userId}>
        <span>{member.email}</span>
        {member.permission === "OWNER" ? <span>Proprietário</span> : <>
          <PermissionSelect label={`Permissão de ${member.email}`} value={member.permission}
            onChange={(value) => { void run(() => changeMember(id, member.userId, value), "Permissão atualizada."); }} />
          <button type="button" onClick={() => void run(() => changeMember(id, member.userId), "Acesso revogado.")}>Revogar</button>
        </>}
      </li>)}
    </ul>
    <h3>Acesso por link</h3>
    {link?.expiresAt && new Date(link.expiresAt) <= new Date() && <p>O link atual está expirado.</p>}
    <PermissionSelect label="Permissão do link" value={linkPermission} onChange={setLinkPermission} />
    <label>Expiração <input type="datetime-local" value={expiry} onChange={(event) => setExpiry(event.target.value)} /></label>
    <button type="button" onClick={() => void run(createLink, "Link gerado.")}>{link ? "Gerar outro link" : "Gerar link"}</button>
    {link && <>
      <button type="button" onClick={() => void run(() => changeLink(id, link.id, {
        permission: linkPermission, expiresAt: expiry ? new Date(expiry).toISOString() : null,
      }), "Link atualizado.")}>Atualizar link</button>
      <button type="button" onClick={() => void run(async () => {
        await changeLink(id, link.id);
        setUrl("");
      }, "Link revogado.")}>Revogar link</button>
    </>}
    {url && <div className="share-link-row">
      <input aria-label="Link criado" className="share-link" readOnly value={url} />
      <button type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(url); setMessage("Link copiado."); }
        catch { setError("Selecione o endereço para copiá-lo."); }
      }}>Copiar</button>
    </div>}
    {link && !url && <p>Gere outro link se precisar copiar o endereço novamente.</p>}
    {busy && <p role="status">Carregando…</p>}
    {message && <p role="status">{message}</p>}
    {error && <p role="alert">{error}</p>}
  </fieldset>;
}

function PermissionSelect({ value, onChange, label }: {
  value: SharePermission; onChange: (value: SharePermission) => void; label: string;
}) {
  return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value as SharePermission)}>
    <option value="VIEWER">Leitor</option>
    <option value="EDITOR">Editor</option>
  </select>;
}

export function PageSharingDialog({ id, title, open, onOpenChange }: {
  id: string; title: string; open: boolean; onOpenChange: (open: boolean) => void;
}) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="share-overlay" />
      <Dialog.Content className="share-modal sharing-settings-modal">
        <Dialog.Title className="share-title">Compartilhar página</Dialog.Title>
        <Dialog.Description>{title}</Dialog.Description>
        {open && <SharingSettings key={id} id={id} />}
        <Dialog.Close asChild><button type="button">Fechar</button></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

export default function PageSharingButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="share" onClick={() => setOpen(true)}>
      <img src={shareIcon} alt="" /> Compartilhar
    </button>
    <PageSharingDialog id={id} title={title} open={open} onOpenChange={setOpen} />
  </>;
}
