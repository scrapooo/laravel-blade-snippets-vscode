/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { dirname, join } from "path";
import { readFileSync, existsSync } from "fs";

const contents: { [name: string]: string } = {};

const serverFolder = dirname(__dirname);

const TYPESCRIPT_LIB_SOURCE = join(serverFolder, "./node_modules/typescript/lib");
const JQUERY_PATH = join(serverFolder, "lib/jquery.d.ts");

export function loadLibrary(name: string) {
    let content = contents[name];
    if (typeof content !== "string") {
        let libPath;
        if (name === "jquery") {
            libPath = JQUERY_PATH;
        } else {
            if (existsSync(name)) {
                libPath = name;
            } else {
                libPath = join(TYPESCRIPT_LIB_SOURCE, name); // from source
            }
        }
        try {
            content = readFileSync(libPath).toString();
        } catch (e) {
            console.log(`Unable to load library ${name} at ${libPath}`);
            content = "";
        }
        contents[name] = content;
    }
    return content;
}
