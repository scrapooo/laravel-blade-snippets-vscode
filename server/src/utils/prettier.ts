import * as prettier from "prettier";
import { FormattingOptions } from "vscode-languageserver-types";
import { get } from "./share";
import { repeat } from "./strings";

export function format(text: string, parser: string, formattingOption: FormattingOptions): string {
    let newText = prettier.format(text, { parser, tabWidth: formattingOption.tabSize, useTabs: !formattingOption.insertSpaces });

    const tagIndent = get(/(\n\r?[ \t]*)$/.exec(text), 0) ?? "";
    const prefixIndent = tagIndent.replaceAll("\n", "") || "";
    const intdent = prefixIndent + (formattingOption.insertSpaces ? repeat(" ", formattingOption.tabSize) : "\t");

    newText = newText
        .split("\n")
        .map((line) => {
            return intdent + line;
        })
        .join("\n");

    return "\n" + newText.trimEnd() + tagIndent;
}
