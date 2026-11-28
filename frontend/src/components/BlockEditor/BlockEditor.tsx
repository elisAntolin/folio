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
  useComponentsContext,
  useCreateBlockNote,
  useEditorDOMElement,
} from "@blocknote/react";
import type { DefaultReactSuggestionItem, SuggestionMenuProps } from "@blocknote/react";
import { Fragment, useEffect, useState } from "react";
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

function BlockCommandMenu({
  items,
  loadingState,
  onItemClick,
  selectedIndex,
}: SuggestionMenuProps<DefaultReactSuggestionItem>) {
  const { SuggestionMenu: Menu } = useComponentsContext()!;
  const editorElement = useEditorDOMElement();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const captureTarget = editorElement?.parentElement;
    if (!captureTarget || hasNavigated) return;

    function handleInitialKey(event: KeyboardEvent) {
      if (!editorElement?.contains(event.target as Node) || event.isComposing) return;

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
      } else if (items.length && ["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(event.key)) {
        setHasNavigated(true);
        if (event.key === "ArrowDown") {
          // BlockNote already points at the first item internally.
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }

    captureTarget.addEventListener("keydown", handleInitialKey, true);
    return () => captureTarget.removeEventListener("keydown", handleInitialKey, true);
  }, [editorElement, hasNavigated, items.length]);

  return (
    <Menu.Root id="bn-suggestion-menu" className="bn-suggestion-menu">
      {items.map((item, index) => (
        <Fragment key={item.title}>
          {item.group && item.group !== items[index - 1]?.group && (
            <Menu.Label className="bn-suggestion-menu-label">{item.group}</Menu.Label>
          )}
          <Menu.Item
            id={`bn-suggestion-menu-item-${index}`}
            className={item.size === "small" ? "bn-suggestion-menu-item bn-suggestion-menu-item-small" : "bn-suggestion-menu-item"}
            item={item}
            isSelected={hasNavigated && index === selectedIndex}
            onClick={() => onItemClick?.(item)}
          />
        </Fragment>
      ))}
      {items.length === 0 && loadingState !== "loading-initial" && (
        <Menu.EmptyItem className="bn-suggestion-menu-item">
          {pt.suggestion_menu.no_items_title}
        </Menu.EmptyItem>
      )}
      {loadingState !== "loaded" && <Menu.Loader className="bn-suggestion-menu-loader" />}
    </Menu.Root>
  );
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
        suggestionMenuComponent={BlockCommandMenu}
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
