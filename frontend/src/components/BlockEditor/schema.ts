import {
  BlockNoteSchema,
  createHeadingBlockSpec,
  defaultBlockSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";

// Keep document content limited to the writing features supported by Folio.
export const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: createHeadingBlockSpec({
      levels: [1, 2, 3],
      allowToggleHeadings: false,
    }),
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    checkListItem: defaultBlockSpecs.checkListItem,
    quote: defaultBlockSpecs.quote,
  },
  styleSpecs: {
    bold: defaultStyleSpecs.bold,
    italic: defaultStyleSpecs.italic,
    underline: defaultStyleSpecs.underline,
    strike: defaultStyleSpecs.strike,
  },
});

export type DocumentContent = (typeof schema.Block)[];
export type InitialDocumentContent = (typeof schema.PartialBlock)[];
