# Telas de acesso

- `/login`: e-mail e senha, Google, GitHub, mostrar/ocultar senha e lembrar de mim.
- `/cadastro`: nome, e-mail, senha com mínimo de 8 caracteres e confirmação.
- `/recuperar-senha`: formulário de recuperação e retorno ao login.

Implementação apenas de front-end. Os formulários usam validação nativa e os botões exibem uma mensagem de prévia; não autenticam, criam contas nem enviam e-mails. Nenhuma senha ou informação do formulário é armazenada. O checkbox de lembrar de mim está preparado visualmente para a integração futura.

A página inicial e o editor continuam públicos. O menu “Sair” abre `/login`, sem simular uma sessão. “Explorar o Folio” volta à página inicial.

Os estilos reutilizam as variáveis de cores e os temas claro/escuro do projeto. A composição de duas colunas foi inspirada no login do Square, com ilustração feita em HTML/CSS para o Folio.
