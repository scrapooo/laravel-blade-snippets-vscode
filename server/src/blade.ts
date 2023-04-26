import { Definition, Location, Position, Range, TextDocument } from "vscode-languageserver-types";
import { Settings } from "./modes/languageModes";
import { WorkspaceFolder } from "vscode-languageserver-protocol/lib/protocol.workspaceFolders.proposed";

interface IncludePart {
    start: number;
    end: number;
    text: string;
    template: string;
}

interface PeekOptions {
    settings: Settings;
    workspaceFolders: WorkspaceFolder[] | undefined;
}

function getWorkspacePath(workspaceFolders: WorkspaceFolder[] | undefined, document: TextDocument): string {
    if (workspaceFolders && workspaceFolders.length) {
        const currentWorkspace = workspaceFolders.filter((a) => document.uri.indexOf(a.uri) === 0);
        if (currentWorkspace[0]) {
            return currentWorkspace[0].uri;
        }
    }
    return null;
}

function joinUri(...args) {
    return args.join("/");
}

// 跳转 @include @extend 的模板
export function peekFileDefinition(document: TextDocument, position: Position, options: PeekOptions): Definition | null {
    const startPos = Position.create(position.line, 0);
    const endPos = Position.create(position.line + 1, 0);

    const lineText = document.getText(Range.create(startPos, endPos));

    const includeParts: IncludePart[] = []; // 查询lineText中所有@include 和 @extend 中的字符串

    if (lineText && lineText.trim()) {
        const regex = /@(?:include|extends)\((.+?('|"))/gi;
        let match: RegExpExecArray = null;
        while ((match = regex.exec(lineText))) {
            const tpl = match[1].replace(/'|"/g, "");

            includeParts.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0],
                template: tpl,
            });
        }
    }

    const viewsBaseUri = joinUri(getWorkspacePath(options.workspaceFolders, document) || "", options.settings.blade.views.path);

    const defs: Definition = [];

    // 只查找用户鼠标点击的位置
    const peekPart = includeParts.filter((part) => {
        return part.start < position.character && part.end > position.character;
    })[0];

    if (peekPart) {
        const tplFileUri = joinUri(viewsBaseUri, ...peekPart.template.split(".")) + ".blade.php";

        const definition = Location.create(tplFileUri, Range.create(Position.create(0, 0), Position.create(0, 0)));
        defs.push(definition);
    }

    return defs;
}
