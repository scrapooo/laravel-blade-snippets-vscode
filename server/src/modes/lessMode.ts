/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { LanguageModelCache } from "../languageModelCache";
import { LanguageMode } from "./languageModes";
import { FormattingOptions, getLESSLanguageService } from "vscode-css-languageservice";
import { HTMLDocumentRegions } from "./embeddedSupport";
import * as prettier from "../utils/prettier";
import { TextDocument, Position, Range, TextEdit } from "vscode-languageserver-types";

export function getLESSMode(documentRegions: LanguageModelCache<HTMLDocumentRegions>): LanguageMode {
    const lessLanguageService = getLESSLanguageService();
    return {
        getId() {
            return "less";
        },
        doValidation(document: TextDocument) {
            const embedded = documentRegions.get(document).getEmbeddedDocument("less");
            const stylesheet = lessLanguageService.parseStylesheet(embedded);
            return lessLanguageService.doValidation(embedded, stylesheet);
        },
        doComplete(document: TextDocument, position: Position) {
            const embedded = documentRegions.get(document).getEmbeddedDocument("less");
            const stylesheet = lessLanguageService.parseStylesheet(embedded);

            return lessLanguageService.doComplete(embedded, position, stylesheet);
        },
        format(document: TextDocument, range: Range, formattingOption: FormattingOptions): TextEdit[] {
            const text = document.getText(range);
            if (text.trim()) {
                const textEdit = {
                    range,
                    newText: prettier.format(text, "less", formattingOption),
                };
                return [textEdit];
            }
            return null;
        },
        onDocumentRemoved(_document: TextDocument) {
            /* nothing to do */
        },
        dispose() {
            /* nothing to do */
        },
    };
}
