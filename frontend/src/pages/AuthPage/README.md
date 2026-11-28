# Telas de acesso

- `/login` autentica com e-mail e senha. A opção “Lembrar meu e-mail” preenche o campo no próximo acesso.
- `/cadastro` cria uma conta com e-mail e senha de pelo menos oito caracteres e já inicia a sessão.
- `/recuperar-senha` informa o estado da recuperação por e-mail e oferece um link de volta ao login.

O front guarda os tokens da API na sessão da aba. Se o token de acesso expirar, o cliente tenta renová-lo e repete a requisição uma vez. O menu “Sair” encerra a sessão local e solicita a revogação do token de renovação.

A página inicial e o editor pessoal pedem login. Links compartilhados seguem as permissões configuradas para cada link. Google, GitHub e recuperação por e-mail dependem de serviços ainda indisponíveis no backend.

Os estilos reutilizam as variáveis de cores e os temas claro/escuro do projeto. A composição de duas colunas foi inspirada no login do Square, com ilustração feita em HTML/CSS para o Folio.
