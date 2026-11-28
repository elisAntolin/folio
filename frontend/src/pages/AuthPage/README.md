# Telas de acesso

- `/login` autentica com e-mail e senha. A opção “Lembrar meu e-mail” preenche o campo no próximo acesso.
- `/cadastro` cria uma conta com e-mail e senha de pelo menos oito caracteres e já inicia a sessão.
- `/recuperar-senha` informa o estado da recuperação por e-mail e oferece um link de volta ao login.

O JWT de acesso dura 10 minutos e fica em memória. O token de renovação fica em um cookie de sessão `HttpOnly`, `Secure` e `SameSite=Strict`. Sirva o front e `/api` na mesma origem, por HTTPS em produção ou em `localhost` durante o desenvolvimento.

Ao recarregar a página ou quando a API retorna `401`, o front usa o cookie para obter um novo JWT. A API troca o token de renovação a cada uso e mantém um prazo máximo de sete dias para a sessão. Se um token já usado reaparecer, a API revoga a sessão. “Sair” revoga a sessão de renovação e apaga o cookie.

A migração invalida os tokens de renovação emitidos antes da adoção do cookie. Essas sessões pedem um novo login.

A página inicial e o editor pessoal pedem login. Links compartilhados seguem as permissões configuradas para cada link. Google, GitHub e recuperação por e-mail dependem de serviços ainda indisponíveis no backend.

Os estilos reutilizam as variáveis de cores e os temas claro/escuro do projeto. A composição de duas colunas foi inspirada no login do Square, com ilustração feita em HTML/CSS para o Folio.
