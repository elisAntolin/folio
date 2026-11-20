# Editor de conteúdo

`BlockEditor` concentra os imports, o schema e os estilos do BlockNote. O
`PageDocument` substitui somente o antigo `contentEditable` e repassa estas props:

```tsx
import PageDocument from "./components/PageDocument/PageDocument";
import type { DocumentContent } from "./components/BlockEditor/BlockEditor";

// Conteúdo obtido pelo responsável pelo documento, quando houver persistência.
const content: DocumentContent = [];
const handleChange = (blocks: DocumentContent) => {
  // Entregar os blocos ao mecanismo de persistência da aplicação.
};

<PageDocument initialContent={content} onChange={handleChange} />;
```

- `initialContent` recebe blocos JSON completos ou parciais, apenas na montagem.
  `undefined` e `[]` abrem um parágrafo vazio. Ao carregar conteúdo assíncrono,
  monte o editor depois da leitura; use uma `key` para carregar outra versão.
- `onChange` entrega o documento completo, incluindo IDs, estilos, links e
  blocos aninhados. O chamador pode serializar esse valor como JSON.
- `PageDocument` usa o ID da rota como `key` do editor para que a navegação entre
  páginas não reutilize o conteúdo do documento anterior.
- A `main` ainda não possui persistência de documentos. O conteúdo fica apenas
  na instância do editor e é descartado ao sair da página ou recarregá-la.

O schema permite parágrafos, H1–H3, listas, checklists e citações, com negrito,
itálico, sublinhado, tachado e links nativos. Menus, atalhos, histórico e
reorganização de blocos também são do BlockNote. Não há configuração de
colaboração, comentários, IA, upload ou serviço externo.

Os estilos usam os tokens do Folio e seletores `.folio-block-editor`. Menus e
barra são portados para `document.body`, mantendo essa classe e evitando cortes
por contêineres. Não é importada outra fonte nem um reset global de UI.

Referências: [instalação Ariakit](https://www.blocknotejs.org/docs/getting-started/ariakit),
[schema](https://www.blocknotejs.org/docs/features/custom-schemas) e
[portais](https://www.blocknotejs.org/docs/react/components#configuring-portal-targets).
