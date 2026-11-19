import { BlockNoteView } from "@blocknote/ariakit";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import { pt } from "@blocknote/core/locales";
import {
  BasicTextStyleButton,
  BlockTypeSelect,
  CreateLinkButton,
  DragHandleMenu,
  FormattingToolbar,
  FormattingToolbarController,
  getDefaultReactSlashMenuItems,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { schema } from "./schema";
import type { DocumentContent, InitialDocumentContent } from "./schema";
import "@blocknote/ariakit/style.css";
import "./BlockEditor.css";

export type { DocumentContent, InitialDocumentContent } from "./schema";

export type BlockEditorProps = {
  /** Read once when mounted. Remount with a document key to load other content. */
  initialContent?: InitialDocumentContent;
  onChange?: (content: DocumentContent) => void;
};

function TextFormattingToolbar() {
  return (
    <FormattingToolbar>
      <BlockTypeSelect />
      <BasicTextStyleButton basicTextStyle="bold" />
      <BasicTextStyleButton basicTextStyle="italic" />
      <BasicTextStyleButton basicTextStyle="underline" />
      <BasicTextStyleButton basicTextStyle="strike" />
      <CreateLinkButton />
    </FormattingToolbar>
  );
}

function BlockActionsMenu() {
  return (
    <DragHandleMenu>
      <RemoveBlockItem>{pt.drag_handle.delete_menuitem}</RemoveBlockItem>
    </DragHandleMenu>
  );
}

function BlockSideMenu() {
  return <SideMenu dragHandleMenu={BlockActionsMenu} />;
}

function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
  const editor = useCreateBlockNote({
    schema,
    dictionary: pt,
    initialContent: initialContent?.length ? initialContent : undefined,
    domAttributes: {
      editor: {
        role: "textbox",
        "aria-label": "Conteúdo do documento",
        "aria-multiline": "true",
      },
    },
  });

  return (
    <BlockNoteView
      className="folio-block-editor"
      editor={editor}
      onChange={() => onChange?.(editor.document)}
      portalElements={{ default: document.body }}
      formattingToolbar={false}
      slashMenu={false}
      sideMenu={false}
      filePanel={false}
      tableHandles={false}
      emojiPicker={false}
      comments={false}
    >
      <FormattingToolbarController formattingToolbar={TextFormattingToolbar} />
      <SideMenuController sideMenu={BlockSideMenu} />
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) =>
          filterSuggestionItems(
            getDefaultReactSlashMenuItems(editor).filter(
              (item) => item.title !== pt.slash_menu.emoji.title,
            ),
            query,
          )
        }
      />
    </BlockNoteView>
  );
}

export default BlockEditor;
