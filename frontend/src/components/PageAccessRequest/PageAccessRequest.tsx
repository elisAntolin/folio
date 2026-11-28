import { useState, type FormEvent } from "react";
import { requestPageAccess, type RequestedPermission } from "../../notificationsApi";
import "./PageAccessRequest.css";

export default function PageAccessRequest({ pageId, permission }: { pageId: string; permission?: RequestedPermission }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || submitted) return;
    const form = new FormData(event.currentTarget);
    const requested = permission ?? (form.get("permission") === "EDITOR" ? "EDITOR" : "VIEWER");
    setError("");
    setIsSubmitting(true);
    try {
      await requestPageAccess(pageId, requested, String(form.get("message") ?? ""));
      setSubmitted(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível enviar a solicitação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <details className="page-access-request">
    <summary>{permission === "EDITOR" ? "Solicitar permissão de edição" : "Solicitar acesso à página"}</summary>
    {submitted ? <p role="status">Pedido enviado. Se o proprietário responder, você receberá uma notificação.</p> :
      <form onSubmit={submit}>
        {!permission && <label>Permissão
          <select name="permission" defaultValue="VIEWER">
            <option value="VIEWER">Leitura</option>
            <option value="EDITOR">Edição</option>
          </select>
        </label>}
        <label>Mensagem (opcional)<textarea name="message" rows={3} maxLength={500} /></label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Enviando…" : "Enviar solicitação"}</button>
      </form>}
  </details>;
}
