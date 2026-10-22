# Folio

**Folio** é uma aplicação web para criar, organizar e editar páginas, anotações e ideias em um único espaço de trabalho. A proposta é inspirada em ferramentas como Notion e Microsoft Loop: o conteúdo é escrito em blocos, organizado em uma hierarquia de páginas e subpáginas, e pensado para ser compartilhado e construído em conjunto.

> **Status:** em desenvolvimento. As funcionalidades descritas neste documento representam o escopo planejado e ainda não estão disponíveis, a menos que indicado de outra forma.

---

## Sumário

- [O problema que o Folio busca resolver](#o-problema-que-o-folio-busca-resolver)
- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades planejadas](#funcionalidades-planejadas)
- [Tecnologias](#tecnologias)
- [Arquitetura prevista](#arquitetura-prevista)
- [Objetivos do projeto](#objetivos-do-projeto)
- [Status](#status)
- [Autoria](#autoria)

---

## O problema que o Folio busca resolver

Anotações, documentos e planejamentos costumam ficar espalhados em arquivos soltos, pastas e aplicativos diferentes. Isso dificulta encontrar uma informação, entender como os conteúdos se relacionam e trabalhar com outras pessoas sobre o mesmo material.

O Folio propõe um único lugar para isso: um espaço em que cada ideia vira uma página, cada página pode ter subpáginas, e todo o conteúdo pode ser pesquisado, reorganizado e compartilhado.

## Sobre o projeto

O Folio funciona como um espaço de trabalho de documentos. Seus princípios são:

- **Conteúdo em blocos.** Textos, títulos, listas e outros elementos são editados como blocos independentes, o que torna a escrita mais flexível e a reorganização mais simples.
- **Organização hierárquica.** Uma página pode conter subpáginas, formando uma estrutura que reflete como o usuário pensa o próprio conteúdo.
- **Foco na escrita.** A interface prioriza a leitura e a edição, com navegação lateral entre páginas e subpáginas.
- **Preparado para o trabalho em grupo.** O projeto prevê compartilhamento, permissões de acesso e, como objetivo adicional, edição colaborativa em tempo real.

A aplicação terá duas telas principais, além de uma tela de login e de modais de apoio:

| Tela | Função |
|---|---|
| **Suas Páginas** | Tela inicial com a lista das páginas do usuário, ordenadas pela edição mais recente, com busca e ações de gerenciamento |
| **Editor de páginas** | Edição do conteúdo de uma página, com barra lateral de subpáginas |
| **Login** | Acesso à aplicação |

A interface segue imagens de referência que servem como direção visual inicial e podem ser ajustadas ao longo do desenvolvimento.

## Funcionalidades planejadas

### Páginas

- Criar páginas com título, categoria e capa.
- Listar as páginas do usuário, ordenadas pela atualização mais recente.
- Renomear páginas.
- Excluir páginas, com confirmação prévia.
- Marcar e desmarcar páginas como favoritas, por um controle independente no card.
- Abrir uma página para edição.

### Hierarquia de subpáginas

- Criar subpáginas vinculadas a uma página.
- Navegar entre a página e suas subpáginas por uma barra lateral.
- Pesquisar e ordenar as subpáginas dentro de uma página.

### Editor em blocos

- Edição do conteúdo em blocos, como títulos, parágrafos e listas.
- Salvamento e recuperação do conteúdo de cada página.

### Pesquisa e organização

- Busca de páginas por título.
- Organização por categorias.
- Alternância entre visualização em grade e em lista.
- Filtro de páginas favoritas.

### Compartilhamento e permissões

- Compartilhamento de páginas com outras pessoas por e-mail.
- Link de acesso à página.
- Permissões de acesso, definindo o que cada pessoa pode fazer em uma página.

### Colaboração em tempo real

- Edição simultânea do mesmo documento por várias pessoas, com sincronização entre elas.
- Esta funcionalidade é um objetivo adicional e depende de uma solução de sincronização ainda em avaliação (veja [Tecnologias](#tecnologias)).

### Personalização

- Tema claro e tema escuro, escolhidos nas configurações do usuário e mantidos ao navegar pela aplicação.
- Escolha de cor de fundo da aplicação, entre opções predefinidas ou uma cor personalizada.
- Imagem personalizada como plano de fundo (funcionalidade opcional).

### Acesso à conta

- Tela de login com validação dos campos.
- Autenticação e controle de acesso integrados ao backend.

## Tecnologias

### Definidas

| Tecnologia | Papel no projeto |
|---|---|
| **React** | Construção da interface do frontend, organizada em componentes reutilizáveis |
| **BlockNote.js** | Editor de texto em blocos, integrado à tela de edição |
| **Java com Spring Boot** | Backend da aplicação, responsável pela lógica de negócio e pela API |
| **API REST** | Comunicação entre o frontend e o backend |

### Previstas

| Tecnologia | Papel no projeto |
|---|---|
| **Vite** | Ferramenta de criação e execução do projeto React |
| **React Router** | Navegação entre as telas da aplicação |

### Em avaliação

| Tema | Situação |
|---|---|
| **Banco de dados** | O banco a ser utilizado ainda não foi escolhido |
| **Autenticação** | O mecanismo e o nível de controle de acesso ainda serão definidos |
| **Colaboração em tempo real** | Depende de uma solução de sincronização e de um servidor para a comunicação entre os clientes. Ela só está planejada como funcionalidade adicional. O uso de WebSocket é uma possibilidade em estudo |
| **Contrato da API** | Endpoints e estruturas de dados ainda serão definidos junto com o backend |

## Arquitetura prevista

O Folio será uma aplicação full stack, dividida em três partes:

1. **Frontend (React):** interface do usuário, navegação, edição de conteúdo e preferências de aparência.
2. **Backend (Java com Spring Boot):** API REST que gerencia usuários, páginas, subpáginas e o conteúdo dos documentos.
3. **Banco de dados:** armazenamento persistente das informações da aplicação.

O frontend será desenvolvido de forma que os dados possam, em um primeiro momento, ser simulados. A comunicação com a API real entra depois, sem exigir uma reescrita da interface.

## Objetivos do projeto

O Folio é um projeto acadêmico, e seus objetivos incluem:

- Aplicar os conceitos de **Programação Orientada a Objetos (POO)** com Java no desenvolvimento do backend, como modelagem de entidades, encapsulamento, organização em camadas e separação de responsabilidades.
- Desenvolver uma **aplicação web full stack**, integrando interface, API e banco de dados.
- Construir uma interface em **React**, com componentização, gerenciamento de estado e navegação.
- Integrar uma biblioteca de **edição de texto em blocos** a uma aplicação real.
- Explorar, como objetivo adicional, os desafios da **edição colaborativa em tempo real**.
- Praticar organização de código e documentação de projeto.

## Status

O Folio está **em desenvolvimento**. Neste momento, o repositório reúne a documentação e o planejamento do projeto. As instruções de instalação e execução serão adicionadas ao README quando houver uma versão que possa ser executada.

## Autoria

Projeto acadêmico desenvolvido por **ELis Antolin**, como parte de **POO - Fatec Rubens Lara**.
