import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import "../../settings";
import "./AuthPage.css";

type AuthMode = "login" | "signup" | "recovery";
type FieldIconName = "mail" | "lock" | "user" | "eye" | "eye-off" | "arrow";

function FieldIcon({ name }: { name: FieldIconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "mail" && <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>}
      {name === "lock" && <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>}
      {name === "user" && <><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>}
      {(name === "eye" || name === "eye-off") && <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{name === "eye-off" && <path d="m3 3 18 18" />}</>}
      {name === "arrow" && <path d="M4 12h16m-6-6 6 6-6 6" />}
    </svg>
  );
}

function ProviderIcon({ provider }: { provider: "google" | "github" }) {
  return provider === "google" ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.3 2.99-7.36Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z" />
      <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.96Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.07c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15 1 .1.76 2.05 3.25 1.42.1-.72.39-1.21.71-1.49-2.47-.28-5.06-1.24-5.06-5.5 0-1.22.44-2.21 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.12 2.96.71.79 1.14 1.78 1.14 3.01 0 4.27-2.59 5.21-5.07 5.49.4.35.75 1.02.75 2.06V22c0 .3.2.64.77.53A11.1 11.1 0 0 0 12 .9Z" /></svg>
  );
}

const content = {
  login: { title: "Bem-vindo de volta!", description: "Suas ideias estão esperando por você.", submit: "Entrar no meu espaço" },
  signup: { title: "Um espaço para chamar de seu.", description: "Crie sua conta e dê lugar às suas ideias.", submit: "Criar minha conta" },
  recovery: { title: "Esqueceu sua senha?", description: "Acontece! Informe seu e-mail para recuperar o acesso.", submit: "Enviar link de recuperação" },
};

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const copy = content[mode];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className="auth-page" data-mode={mode}>
      <aside className="auth-story" aria-label="Sobre o Folio">
        <Link to="/" className="auth-brand" aria-label="Folio, página inicial">
          <span className="auth-brand-mark"><img src="/folio.svg" alt="" /></span>
          <span>folio<span className="auth-brand-dot">.</span></span>
        </Link>

        <div className="auth-art" aria-hidden="true">
          <div className="auth-art-content">
          <div className="auth-art-orbit" />
          <div className="auth-paper auth-paper-back" />
          <div className="auth-paper auth-paper-main">
            <div className="auth-paper-top"><span className="auth-paper-symbol">✦</span><span>Meu espaço de ideias</span><span>···</span></div>
            <span className="auth-paper-tag">UM NOVO COMEÇO</span>
            <h2>Grandes ideias<br />começam aqui<span>.</span></h2>
            <div className="auth-paper-lines"><i /><i /></div>
            <div className="auth-paper-task"><span>✓</span> Tirar uma ideia do papel</div>
            <div className="auth-paper-task"><span /> Criar algo com significado</div>
            <div className="auth-paper-task"><span /> Fazer no meu ritmo</div>
          </div>
          <div className="auth-floating-note"><span>✧</span> Um lugar para o que importa.</div>
          <div className="auth-art-spark">✳</div>
          </div>
        </div>

        <div className="auth-story-copy">
          <h2>Suas ideias.<br />Seu ritmo. Seu espaço.</h2>
          <p>Organize seus projetos, conecte suas ideias e<br className="auth-desktop-break" /> deixe espaço para o que vem a seguir.</p>
        </div>
        <span className="auth-story-footer">Feito para organizar. Pensado para você.</span>
      </aside>

      <main className="auth-main">
        <div className="auth-main-top" aria-hidden="true" />
        <div className="auth-form-container">
          <div className="auth-heading">
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && <div className="auth-field">
              <label htmlFor="auth-name">Nome</label>
              <div className="auth-input-wrap"><FieldIcon name="user" /><input id="auth-name" name="name" type="text" autoComplete="name" placeholder="Seu nome" required maxLength={100} /></div>
            </div>}
            <div className="auth-field">
              <label htmlFor="auth-email">E-mail</label>
              <div className="auth-input-wrap"><FieldIcon name="mail" /><input id="auth-email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required maxLength={254} /></div>
            </div>
            {mode !== "recovery" && <div className="auth-field">
              <label htmlFor="auth-password">Senha</label>
              <div className="auth-input-wrap">
                <FieldIcon name="lock" />
                <input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={mode === "signup" ? "Crie uma senha" : "Digite sua senha"} required minLength={mode === "signup" ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={mode === "signup" ? "auth-password-hint" : undefined} />
                <button className="auth-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPassword}><FieldIcon name={showPassword ? "eye" : "eye-off"} /></button>
              </div>
              {mode === "signup" && <small id="auth-password-hint">Use pelo menos 8 caracteres.</small>}
            </div>}
            {mode === "signup" && <div className="auth-field">
              <label htmlFor="auth-confirm-password">Confirmar senha</label>
              <div className="auth-input-wrap"><FieldIcon name="lock" /><input id="auth-confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repita sua senha" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} ref={(input) => { input?.setCustomValidity(confirmPassword && confirmPassword !== password ? "As senhas precisam ser iguais." : ""); }} /></div>
            </div>}
            {mode === "login" && <div className="auth-form-options"><label className="auth-remember"><input type="checkbox" name="remember" /> Lembrar de mim</label><Link to="/recuperar-senha">Esqueceu a senha?</Link></div>}
            <button type="submit" className="auth-submit"><span>{copy.submit}</span><FieldIcon name="arrow" /></button>
          </form>

          {mode !== "recovery" && <>
            <div className="auth-divider"><span>ou continue com</span></div>
            <div className="auth-providers">
              {(["google", "github"] as const).map((provider) => (
                <button key={provider} type="button" className="auth-provider">
                  <ProviderIcon provider={provider} />
                  <span>{provider === "google" ? "Google" : "GitHub"}</span>
                </button>
              ))}
            </div>
          </>}

          <p className="auth-switch">{mode === "login" ? <>Ainda não tem uma conta? <Link to="/cadastro">Criar conta</Link></> : mode === "signup" ? <>Já tem uma conta? <Link to="/login">Entrar</Link></> : <Link to="/login">Voltar para o login</Link>}</p>
        </div>
        <div className="auth-main-footer" aria-hidden="true" />
      </main>
    </div>
  );
}
