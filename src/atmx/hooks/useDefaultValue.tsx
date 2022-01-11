import { Descendant } from "slate";

const DefaultValue: Descendant[] = [{ "type": "paragraph", "children": [{ "text": "Empty document" }] }]

export const useDefaultValue = (): Descendant[] => DefaultValue;