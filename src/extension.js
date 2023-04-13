exports.__esModule = true;
exports.deactivate = exports.activate = void 0;
var vscode = require("vscode");
const { activate } = require("./extension");
var configuration_1 = require("./configuration");
var configuration = new configuration_1.Configuration();
var parser_1 = require("./parser");
const { cp } = require("fs");
const { stdout, stderr } = require("process");

module.exports = function(e) {
    var t = {};

    function r(i) {
        if (t[i]) return t[i].exports;
        var n = t[i] = {
            i: i,
            l: !1,
            exports: {}
        };
        return e[i].call(n.exports, n, n.exports, r), n.l = !0, n.exports
    }
    return r.m = e, r.c = t, r.d = function(e, t, i) {
        r.o(e, t) || Object.defineProperty(e, t, {
            enumerable: !0,
            get: i
        })
    }, r.r = function(e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }, r.t = function(e, t) {
        if (1 & t && (e = r(e)), 8 & t) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var i = Object.create(null);
        if (r.r(i), Object.defineProperty(i, "default", {
                enumerable: !0,
                value: e
            }), 2 & t && "string" != typeof e)
            for (var n in e) r.d(i, n, function(t) {
                return e[t]
            }.bind(null, n));
        return i
    }, r.n = function(e) {
        var t = e && e.__esModule ? function() {
            return e.default
        } : function() {
            return e
        };
        return r.d(t, "a", t), t
    }, r.o = function(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, r.p = "", r(r.s = 3)
}([function(e, t) {
    e.exports = require("vscode")
}, function(e, t) {
    e.exports = require("fs")
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0),
        n = r(1),
        o = r(4);
    class s {
        static isDebug() {
            return s.getConfig().debugMode
        }
        static currentWorkspace() {
            if (i.workspace.workspaceFolders) {
                if (1 == i.workspace.workspaceFolders.length) {
                    let e = i.workspace.workspaceFolders[0].uri.fsPath;
                    return Promise.resolve(e)
                }
                return i.window.showWorkspaceFolderPick().then(e => e.uri.fsPath)
            }
            return Promise.resolve(i.workspace.rootPath)
        }
        static cmAutoComplete80Enabled() {
            let e = s.getConfig().autoComplete80Enabled;
            return "boolean" != typeof e && (e = !1), e
        }
        static clearOutputOnBuild() {
            let e = s.getConfig().clearOutputBuild;
            return "boolean" != typeof e && (e = !1), e
        }
        static cmOutputFilePath() {
            return s.getConfig().outputFilePath
        }
        static cmRoot() {
            if (!s.root) {
                const e = i.workspace.workspaceFolders[0].uri.fsPath.match(/.*(?=\\home\\|\\base\\|\\extensions\\|\\personal\\)/);
                s.root = s.getConfig().root, "auto" == s.root && e && e.length > 0 && (console.log("CM Root Auto Mode - Using Path '" + e.toString() + "'"), s.root = e.toString())
            }
            return s.root
        }
        static cmGitMode() {
            let e = s.getConfig().gitMode;
            if (void 0 !== e) return e;
            let t = s.cmRoot();
            return n.existsSync(o.join(t, "base"))
        }
        static cmPath() {
            return s.cmRoot() + (s.cmGitMode() ? "\\base" : "\\home")
        }
        static arch() {
            return "win64"
        }
        static rsWatcherEnabled() {
            return s.getConfig().rsSaveWatch
        }
        static useNewSyntax() {
            let e = s.getConfig().newSyntax;
            return "boolean" != typeof e && (e = !1), e
        }
        static emacsClientExe() {
            return s.getConfig().emacsclientexe
        }
        static emacsServerFile() {
            return s.getConfig().emacsserverfile
        }
        static getConfig() {
            return i.workspace.getConfiguration(s.LangName)
        }
    }
    s.LangName = "cm", s.root = null, t.cmConfig = s
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0),
        n = r(7),
        o = r(8),
        s = r(9),
        a = r(10),
        c = r(12),
        l = r(13),
        u = r(14),
        m = r(15),
        h = r(16),
        d = r(2),
        p = r(20),
        g = r(21),
        f = r(1),
        w = r(6);
    let C, v;

    function x(e) {
        i.workspace.onDidChangeConfiguration(t => {
            t.affectsConfiguration("cm.newSyntax") && function(e) {
                f.readFile(e, {
                    encoding: "Windows-1250"
                }, (t, r) => {
                    if (t) return void console.log("Couldn't find config");
                    let n = JSON.parse(r),
                        o = "./syntaxes/" + (d.cmConfig.useNewSyntax() ? "cm.tmLanguage.json" : "CM.plist");
                    console.log("REQUESTED CM SYNTAX " + o)
                        .catch(err => console.log("yea")), 
                    n.contributes.grammars[0].path != o && (console.log("Changing CM Syntax Config"),
                     n.contributes.grammars[0].path = "./syntaxes/" + (d.cmConfig.useNewSyntax() ? "cm.tmLanguage.json" : "CM.plist"),
                      f.writeFileSync(e, JSON.stringify(n, null, 2)),
                       m.showReloadConfirm("You CM Language syntax setting was changed you must reload VSCode for the change to take effect").then(e => {
                        e && i.commands.executeCommand("workbench.action.reloadWindow")
                    })
                    .catch(err => console.log("Error Reloading.")))
                })
            }(e.asAbsolutePath("package.json"))
        })
    }

    function P(e, t) {
        var r = [];

        function n(n) {
            var o = i.workspace.createFileSystemWatcher(new i.RelativePattern(n, `**/*.${t}`));
            r.push({
                key: n.uri.fsPath,
                value: o
            }), o.onDidCreate(t => {
                e(t)
            })
        }
        i.workspace.workspaceFolders.forEach(e => {
            n(e)
        }), i.workspace.onDidChangeWorkspaceFolders(e => {
            e.added.forEach(e => {
                n(e)
            }), e.removed.forEach(e => {
                let t = r.find(t => t.key == e.uri.fsPath);
                t = null
            })
        })
    }
    t.getCompiler = function() {
        return v
    }, t.activate = function(e) {
        x(e);
        const t = [];
        console.log("--STARTING CM EXTENSION--"), C = i.languages.createDiagnosticCollection("cm"), v = new h.cmCompilerAdapter(C, d.cmConfig.cmOutputFilePath()), w.setup(), P(p.cmUtils.addCopyright, "cm"), P(p.cmUtils.createResourceTemplate, "rs"), i.window.onDidChangeActiveTextEditor(e => {
            g.foldCopyright(e)
        }), d.cmConfig.rsWatcherEnabled() && i.workspace.onDidSaveTextDocument(e => {
            e.fileName.endsWith(".rs") && v.runIfStarted(`{ cm.rs.loadRs( cm.io.Url("${e.fileName.replace(/\\/g,"/")}"), force=true ); }`)
        }), t.push(i.languages.registerDefinitionProvider(u.CM_MODE, new n.CMDefinitionProvider)), d.cmConfig.cmAutoComplete80Enabled() && t.push(i.languages.registerCompletionItemProvider(u.CM_MODE, new o.CM80CompletionItemProvider, ".")), t.push(i.languages.registerDocumentSymbolProvider(u.CM_MODE, new l.CMFileSymbolProvider)), t.push(i.languages.registerDocumentFormattingEditProvider(u.CM_MODE, new s.ClangDocumentFormattingEditProvider)), t.push(i.languages.registerHoverProvider(u.CM_MODE, new a.CMHoverProvider)), t.push(i.window.registerTreeDataProvider("cmExplorer", new c.CmTreeDataProvider)), t.push(i.languages.registerReferenceProvider(u.CM_MODE, w.refProvider)), d.cmConfig.isDebug(), t.push(C), t.push(g.registerCommands(v)), e.subscriptions.push(...t)
    
        var activeEditor;
        var configuration = new configuration_1.Configuration();
        var parser = new parser_1.Parser(configuration);

        var updateDecorations = function() {
            

            // if no active window is open, return
            if (!activeEditor)
                return;
            // if lanugage isn't supported, return
            if (!parser.supportedLanguage) {
                return;
            }
                
            // Finds the single line comments using the language comment delimiter
            parser.FindSingleLineComments(activeEditor);
            // Finds the multi line comments using the language comment delimiter
            parser.FindBlockComments(activeEditor);
            // Finds the jsdoc comments
            parser.FindJSDocComments(activeEditor);
            // Apply the styles set in the package.json
            parser.ApplyDecorations(activeEditor);

            configuration.setParser(parser);
        };
        // Get the active editor for the first time and initialise the regex
        if (vscode.window.activeTextEditor) {
            activeEditor = vscode.window.activeTextEditor;
            // Set the regex patterns for the specified language's comments
            parser.SetRegex(activeEditor.document.languageId);
            // Trigger first update of decorators
            triggerUpdateDecorations();
        }
        // * Handle active file changed
        vscode.window.onDidChangeActiveTextEditor(function (editor) {
            if (editor) {
                activeEditor = editor;

                configuration.getConfiguration();
                // Set regex for updated language
                parser.SetRegex(editor.document.languageId);
                // Trigger update to set decorations for newly active file
                triggerUpdateDecorations();
            }
        }, null, e.subscriptions);
        // * Handle file contents changed
        vscode.workspace.onDidChangeTextDocument(function (event) {
            // Trigger updates if the text was changed in the same document
            if (activeEditor && event.document === activeEditor.document) {
                // * Zach TODO   This is where the actual change in the text document is happening. 
                triggerUpdateDecorations();
                configuration.configureCommentBlocks(event);
            }
        }, null, e.subscriptions);

        // * Handle selection changed. 
        vscode.window.onDidChangeTextEditorSelection(function (event) {
            if (activeEditor) {
                configuration.configureCommentBlocks(event);
            }
        }, null, e.subscriptions);
        // * IMPORTANT:
        // * To avoid calling update too often,
        // * set a timer for 100ms to wait before updating decorations
        var timeout;
        function triggerUpdateDecorations() {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(updateDecorations, 100);
        }

        configuration.configureCommentBlocks(e);
        configuration.registerCommands();
    
    }
}, function(e, t) {
    e.exports = require("path")
}, function(e, t) {
    e.exports = require("child_process")
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(18);
    t.setup = function() {
        t.refProvider = new i.CMReferenceProvider
    }
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(3);
    t.CMDefinitionProvider = class {
        constructor() {
            this.compiler = i.getCompiler()
        }
        provideDefinition(e, t, r) {
            if (e.isDirty) {
                var i = e.fileName;
                return new Promise((r, n) => {
                    e.save().then(o => {
                        o ? (this.compiler.compileFile(i), setTimeout(() => {
                            r(this.runDef(e, t))
                        }, 250)) : n("save failed")
                    })
                    .catch(err => console.log("Error providing definition"))
                })
            }
            return this.runDef(e, t)
        }
        runDef(e, t) {
            var r = e.fileName,
                i = e.offsetAt(t);
            return i += 1 - t.line, this.compiler.goto(r, i)
        }
    }
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0),
        n = r(3),
        o = r(2),
        s = r(1);
    t.CM80CompletionItemProvider = class {
        constructor() {
            this.compiler = n.getCompiler(), console.log("Starting CM8.0 Suggestion Provider...")
        }
        provideCompletionItems(e, t, r) {
            var n;
            return n = new Promise((r, a) => {
                e.save().then(() => {
                    this.compiler.runStatement({
                        start: !1,
                        code: `cvm_ac("${e.fileName.replace(/\\/g,"/")}", ${this.getOffset(e,t)});`,
                        successEx: /\(load.[^\)]*\)/,
                        failureEx: /\(cm-ac-result-none\)/,
                        doNotClear: !0
                    }).then(() => {
                        console.log("CM AC Success " + n), s.readFile(o.cmConfig.cmRoot() + "/write/cm-ac-candidates.el", "utf8", (e, t) => {
                            e && a();
                            const n = this.getAllMatches(t);
                            var o = [];
                            this.getFieldCalls(n, o), this.getClassTypes(n, o), this.getOverrides(n, o), r(new i.CompletionList(o, !0))
                        })
                    }, () => {
                        console.log("CM AC Failure"), a()
                    })
                })
                .catch(err => console.log("Provide Completion Items error"))
            })
        }
        getOffset(e, t) {
            var r = e.offsetAt(t);
            return r += 1 - t.line
        }
        getOverrides(e, t) {
            e.forEach(e => {
                let r = /\(cm-ac1\s"(.[^"]*)"\snil\s'\(\d+\s\.\s\"(.[^"]*)".*\)\)/g.exec(e);
                if (!r) return;
                let n = /(?:^|\")([^\(]+)(\([^\)]*\))/g.exec(r[1]),
                    o = /public\s(.*)/g.exec(r[2]);
                if (n && o) {
                    var s = new i.CompletionItem(n[1] + n[2] + " -> " + o[1], i.CompletionItemKind.Function);
                    s.insertText = r[2] + " " + r[1].replace(/^.*}/gm, "}").replace(/;[\r\n\s]*}/g, ";\r\n}").replace(/\s{4}super\(\.\.\)/gm, "void" == o[1] ? "super(..)" : "return super(..)");
                    var a = new i.MarkdownString;
                    a.appendCodeblock(n[1] + n[2], "cm"), a.appendCodeblock("return " + o[1], "cm"), s.documentation = a, t.push(s)
                }
            })
        }
        getClassTypes(e, t) {
            e.forEach(e => {
                let r = /\(cm-ac1\s"(.[^"]*)"\snil\s'[^\(].*\)\)/g.exec(e);
                if (r) {
                    var n = new i.CompletionItem(r[1], i.CompletionItemKind.Class);
                    n.insertText = r[1], t.push(n)
                }
            })
        }
        getFieldCalls(e, t) {
            e.forEach(e => {
                let r = /\(cm-ac1\s"(.[^"]*)"\s"(.[^"]*)"\s"(.[^"]*)"\s\(cons\s\(cm-ac-url\s(\d*)\)\s(\d*)\)\)/g.exec(e);
                if (r) {
                    var n;
                    r[2].startsWith("(") ? n = i.CompletionItemKind.Method : r[2].startsWith(" -> ") && (n = i.CompletionItemKind.Property);
                    var o = new i.CompletionItem(`${r[1]}${r[2]}`, n),
                        s = r[2].match(/(\w+?\s\w+(?:=\w*)?)/g),
                        a = /\s->\s(.+$)/.exec(r[2]);
                    if (r[2].match(/^\s->\s/)) o.insertText = r[1];
                    else {
                        var c = r[1] + "(";
                        if (s) {
                            var l = 1;
                            s.forEach(e => {
                                c += " ${" + l++ + ":" + e + "},"
                            })
                        } else c += ",";
                        var u = c.substring(0, c.length - 1);
                        u.endsWith("(") ? u += ")" : u += " )", o.insertText = new i.SnippetString(u);
                        var m = new i.MarkdownString;
                        m.appendCodeblock(o.label.replace(/\s->\s.*/g, ""), "cm"), m.appendCodeblock("return " + (a ? a[1] : "void"), "cm"), m.appendText("From"), m.appendCodeblock(r[3]), o.documentation = m
                    }
                    t.push(o)
                }
            })
        }
        getAllMatches(e) {
            var t = [];
            let r = /\(cm-ac1\s(?:(?!\)\))(?:.|\r|\n))*\)\)/g;
            for (var i = null; i = r.exec(e);) t.push(i[0]);
            return t
        }
    }
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0),
        n = r(5);
    t.ClangDocumentFormattingEditProvider = class {
        constructor() {
            this.formatCommand = "clang-format"
        }
        provideDocumentFormattingEdits(e, t, r) {
            return e.save().then(() => this.doFormatDocument(e, t, r))
        }
        doFormatDocument(e, t, r) {
            return new Promise((t, r) => {
                var o = e.fileName;
                n.exec(`${this.formatCommand} ${o} -style="{AccessModifierOffset: 0, ColumnLimit: 0, IndentWidth: 4, ReflowComments: true, TabWidth: 4}"`, (n, o, s) => {
                    try {
                        if (n && "ENOENT" == n.code) return i.window.showInformationMessage("The '" + this.formatCommand + '\' command is not available.  Please run "npm install -g clang-format".'), t(null);
                        if (n) return r("Cannot format due to syntax errors.");
                        var a = o.toString();
                        a = (a = (a = (a = a.replace(/(?:public|private)\r\n\s*/g, "public ")).replace(/=\s+\?/g, "=?")).replace(/.\s:\s(\w+->\w+)/g, ".:$1")).replace(/(\w+)\s{}\s+(\w+)/g, "$1{} $2");
                        const s = /(?:extend)?\s(?:public|private)\s\w+\s\w+\((.*)\)/g;
                        let d = [];
                        for (var c; null !== (c = s.exec(a));) {
                            var l = c[1];
                            d.push({
                                old: l,
                                new: l.replace(/\s=\s/g, "=")
                            })
                        }
                        d.forEach(e => {
                            a = a.replace(e.old, e.new)
                        });
                        var u = e.lineCount,
                            m = e.lineAt(u - 1).range.end.character,
                            h = new i.Range(0, 0, u - 1, m);
                        return t([new i.TextEdit(h, a)])
                    } catch (e) {
                        r(e)
                    }
                })
            })
        }
    }
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0),
        n = r(11);
    t.CMHoverProvider = class {
        provideHover(e, t, r) {
            return new Promise((r, o) => {
                let s = e.getWordRangeAtPosition(t),
                    a = e.getText(s);
                var c = (new n.VariableFinder).findDefinitionInText(e.getText(), a);
                c.length > 0 ? r(new i.Hover({
                    language: "cm",
                    value: `${c[0].type} ${a}`
                })) : r()
            })
        }
    }
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(1);
    t.VariableFindResult = class {};
    t.VariableFinder = class {
        findDefinitionInFile(e, t) {
            return new Promise((r, n) => {
                i.readFile(e, "utf8", (e, i) => {
                    var n = this.findDefinitionInText(i, t);
                    return r(n)
                })
            })
        }
        findDefinitionInText(e, t) {
            var r = `([\\w+->]+)\\s+(\\w+\\s*,\\s*)?${t}\\s*(,|;|=|\\(\\))`;
            try {
                for (var i, n = new RegExp(r, "gmi"), o = []; null != (i = n.exec(e));) o.push({
                    line: i.index,
                    type: i[1]
                });
                return o.forEach(t => {
                    var r = e.substr(0, t.line).split(/\r\n|\r|\n/, -1);
                    t.line = r.length
                }), o
            } catch (e) {
                return []
            }
        }
    }
}, function(e, t, r) {
    "use strict";
    (function(e) {
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        const i = r(0),
            n = r(2),
            o = r(4),
            s = r(1);
        class a {
            constructor(e, t, r) {
                this.entry = e, this.rootPath = t, this._parent = r, this._resource = o.join(this.rootPath, this._parent)
            }
            get resource() {
                return this._resource
            }
            get path() {
                return o.join(this._parent, this.name)
            }
            get name() {
                return this.entry.name
            }
            get isFolder() {
                return "d" === this.entry.type || "l" === this.entry.type
            }
        }
        t.CmNode = a;
        class c {
            constructor(e) {
                this.rootPath = e
            }
            get roots() {
                return this.parseDirectory(o.join(this.rootPath, "cm"))
            }
            getChildren(e) {
                return this.parseDirectory(e.resource)
            }
            parseDirectory(e) {
                return new Promise((t, r) => {
                    s.readdir(e, (i, n) => {
                        if (i) return r(i);
                        let c = n.filter(t => s.statSync(o.join(e, t)).isDirectory() || t.endsWith(".cm"));
                        return t(this.sort(c.map(t => new a({
                            name: t,
                            type: s.statSync(o.join(e, t)).isDirectory() ? "d" : "cm"
                        }, e, t))))
                    })
                })
            }
            sort(e) {
                return e.sort((e, t) => e.isFolder && !t.isFolder ? -1 : !e.isFolder && t.isFolder ? 1 : e.name.localeCompare(t.name))
            }
        }
        t.CmModel = c;
        t.CmTreeDataProvider = class {
            constructor() {
                this._onDidChangeTreeData = new i.EventEmitter, this.onDidChangeTreeData = this._onDidChangeTreeData.event
            }
            getTreeItem(t) {
                return {
                    label: t.name,
                    collapsibleState: t.isFolder ? i.TreeItemCollapsibleState.Collapsed : void 0,
                    command: t.isFolder ? void 0 : {
                        command: "extension.openFile",
                        arguments: [t.resource],
                        title: "Open CM Resource"
                    },
                    iconPath: {
                        light: t.isFolder ? o.join(e, "..", "..", "..", "resources", "light", "dependency.svg") : o.join(e, "..", "..", "..", "resources", "cmIcon.png"),
                        dark: t.isFolder ? o.join(e, "..", "..", "..", "resources", "dark", "dependency.svg") : o.join(e, "..", "..", "..", "resources", "cmIcon.png")
                    }
                }
            }
            getChildren(e) {
                return e ? this.model.getChildren(e) : (this.model || (this.model = new c(n.cmConfig.cmPath())), this.model.roots)
            }
        }
    }).call(this, "/index.js")
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0);
    r(4);
    t.CMFileSymbolProvider = class {
        provideDocumentSymbols(e, t) {
            let r = [];
            return [{
                regex: /\b(?:public|package|private)\s+class\s+([a-zA-Z][_a-zA-Z0-9]*)/g,
                kind: i.SymbolKind.Class
            }, {
                regex: /(?:extend\s+)?(?:public|package|private)\s+([a-zA-Z<](?:[_\-\>,\sa-zA-Z0-9]|\{\}|\[\])*)\s+([a-zA-Z<][_>,\sa-zA-Z0-9]*)\s*\((.*)(?=\)\s*\{.*)/g,
                kind: i.SymbolKind.Method
            }, {
                regex: /(?:public|package|private)\s+([a-zA-Z<](?:[_\-\>,\sa-zA-Z0-9]|\{\}|\[\])*)\s+([a-zA-Z][_a-zA-Z0-9]*)[^{]*?(?=;)/g,
                kind: i.SymbolKind.Property
            }].forEach(t => {
                const n = e.getText();
                for (var o; null !== (o = t.regex.exec(n));) {
                    var s = e.positionAt(o.index);
                    r.push(new i.SymbolInformation(this.getNameFromKind(o, t.kind), t.kind, "", new i.Location(e.uri, s)))
                }
            }), Promise.resolve(r)
        }
        getNameFromKind(e, t) {
            return t == i.SymbolKind.Class ? e[1] : t == i.SymbolKind.Method ? `${e[2]}(${e[3]}) : ${e[1]}` : t == i.SymbolKind.Property ? `${e[2]} : ${e[1]}` : void 0
        }
    }
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    }), t.CM_MODE = {
        language: "cm",
        scheme: "file"
    }
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0);
    t.showReloadConfirm = (e => new Promise((t, r) => {
        i.window.showInformationMessage(e, "Reload").then(e => {
            t("Reload" == e)
        })
        .catch(err => console.log("Error Reloading Confirmation"))
    }))
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(2),
        n = r(17),
        o = r(0),
        s = r(0);
    var a = r(19);
    t.cmCompilerAdapter = class {
        constructor(e, t) {
            this.isStarted = !1, this.filePath = t, this.channel = new n.cmOutputChannel(e, t), this.diagnostics = e, this.compiler = new a({
                cmRoot: i.cmConfig.cmRoot(),
                gitMode: i.cmConfig.cmGitMode(),
                onRead: e => {
                    this.channel.write(e)
                },
                onError: e => {
                    o.window.showInformationMessage("Error from CM Process"), this.channel.write(`[INFO: CM_Process_Error -> ${e}]`)
                },
                cmArch: i.cmConfig.arch()
            })
        }
        reset() {
            return this.compiler.kill(), this.compiler = new a({
                cmRoot: i.cmConfig.cmRoot(),
                onRead: e => {
                    this.channel.write(e)
                },
                onError: e => {
                    o.window.showInformationMessage("Error from CM Process"), this.channel.write(`[INFO: CM_Process_Error -> ${e}]`)
                },
                cmArch: i.cmConfig.arch()
            }), this.clearOutputIfNeeded(), this.isStarted = !1, this.start()
        }
        startWritingOutputFile() {
            this.channel.write(`[Contents of output channel will now be written to: ${this.filePath}]\n`), this.channel.writeOutputToFile = !0
        }
        stopWritingOutputFile() {
            this.channel.writeOutputToFile = !1, this.channel.write("[Stopped writing output to file]\n")
        }
        start() {
            if (!this.isStarted) return new Promise((e, t) => {
                this.compiler.start().then(t => {
                    this.isStarted = t, e(t)
                }, t)
                .catch(err => console.log("Error starting Compiler"))
            })
        }
        getGitUsername() {
            this.run('getGitUsername')
        }
        clean() {
            this.channel.clear(), this.channel.write("Starting Clean...\n", !0);
            var e = this.compiler.clean();
            this.channel.write("[INFO make clean-cm:]\n", !0), this.channel.write("---------------------\n", !0), this.channel.write(e, !0), this.channel.write("---------------------\n", !0), this.channel.write("[INFO CM Clean]\n", !0), this.isStarted = !1
        }
        stop() {
            this.isStarted && (this.clearOutputIfNeeded(), this.channel.write("[INFO CM Killed]\n", !0), this.compiler.kill(), this.isStarted = !1)
        }
        loadAllKnown(e) {
            this.diagnostics.clear(), this.startIfNotStarted().then(t => {
                console.log(e), this.compiler.write(`loadAll("${e.replace(/\\/g,"/")}");`)
            })
            .catch(err => console.log("Error Loading"))
        }
        compileWorkspace() {
            this.startIfNotStarted().then(e => {
                i.cmConfig.currentWorkspace().then(e => {
                    e = e.replace(/\\/g, "/") + "/", this.run(`{ use cm.runtime.util; compileAllBelow(CompileAllEnv("${e}")); }`)
                })
                .catch(err => console.log("Error with cm.runtime.util compileAllBelow"))
            })
            .catch(err => console.log("Error Compiling Workspace"))
        }
        compileVSWorkspace() {
            this.startIfNotStarted().then(e => {
                var t = "";
                s.workspace.workspaceFolders.forEach(e => {
                    let r = e.uri.fsPath.replace(/\\/g, "/") + "/";
                    t += `compileAllBelow(CompileAllEnv("${r}"));`
                }), this.run(`{ use cm.runtime.util; ${t} }`)
            })
            .catch(err => console.log("Error Compiling VS Workspace"))
        }
        compileFile(e) {
            this.clearOutputIfNeeded(), this.diagnostics.clear(), this.startIfNotStarted().then(t => {
                this.compiler.compileFile(e)
            })
            .catch(err => console.log("Error Compiling File"))
        }
        runStatement(e) {
            if (e.start || this.isStarted) return this.clearOutputIfNeeded(e.doNotClear), this.startIfNotStarted().then(t => new Promise((t, r) => {
                this.channel.addOutputWatch(t, r, e.successEx, e.failureEx), this.compiler.write(e.code), setTimeout(() => {
                    this.channel.clearOutputWatch()
                }, 2e3)
            }))
            .catch(err => console.log("Error Running Statement"))
        }
        runIfStarted(e) {
            this.clearOutputIfNeeded(), this.diagnostics.clear(), this.isStarted && this.compiler.write(e)
        }
        run(e) {
            this.clearOutputIfNeeded(), this.diagnostics.clear(), this.startIfNotStarted().then(t => {
                this.compiler.write(e)
            })
            .catch(err => console.log("Error Running Statement"))
        }
        runCurrentFile(e) {
            e.endsWith("acloader.cm") || this.clearOutputIfNeeded(), this.diagnostics.clear(), this.startIfNotStarted().then(t => {
                this.compiler.runFile(e)
            })
            .catch(err => console.log("Error running current file"))
        }
        quitDebug() {
            this.isStarted && this.compiler.quitDebug()
        }
        functionComment() {
            const vscode = require('vscode');
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                // Return an error message if necessary.
                return 'Editor is not opening.';
            }
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
        
            const position = editor.selection.active;
            const textLine = document.lineAt(position).text;
            const whiteSpace = textLine.slice(0, textLine.search(/\S|$/));
            
            editor.edit(editBuilder => {
                // To surround a selected text in double quotes(Multi selection is not supported).
                editBuilder.replace(selection, 
                `/**\n${whiteSpace} * ${text}\n${whiteSpace} */`);
            });

            var newPosition = position.with(position.line + 1, textLine.length + 3);
            var newSelection = new vscode.Selection(newPosition, newPosition);
            editor.selection = newSelection;
        }
        ofsTab() {
			const vscode = require('vscode');
            const editor = vscode.window.activeTextEditor;

            editor.options.insertSpaces = true;
            editor.options.tabSize = 8;
            vscode.commands.executeCommand(`editor.action.indentationToSpaces`);
            editor.options.tabSize = 4;
            editor.options.insertSpaces = true;
        }
        titleComment() {
            const vscode = require('vscode');
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                // Return an error message if necessary.
                return 'Editor is not opening.';
            }
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
        
            const position = editor.selection.active;
            const textLine = document.lineAt(position).text;
            const whiteSpace = textLine.slice(0, textLine.search(/\S|$/));
            
            editor.edit(editBuilder => {
                // To surround a selected text in double quotes(Multi selection is not supported).
                editBuilder.replace(selection, 
                `/***********************************************************************\n${whiteSpace} * ${text}\n${whiteSpace} ***********************************************************************/`);
            });

            var newPosition = position.with(position.line + 1, textLine.length + 3);
            var newSelection = new vscode.Selection(newPosition, newPosition);
            editor.selection = newSelection;
        }
        selectionToComment(context) {
            const vscode = require('vscode');
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return 'Editor is not opening.';
            }

            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);

            const position = editor.selection.active;
            const textLine = document.lineAt(position).text;
            const whiteSpace = textLine.slice(0, textLine.search(/\S|$/));

            
            
            var usernameProcess = require('child_process')
            var dateProcess = require('child_process');

            var username = "Default";
            var date = "";
            

            usernameProcess.exec('git config user.name', (err, stdout, stderr) => {
                if (stdout) {
                    username = stdout;
                    username = username.replace("\n", "");
                } 
            });

            dateProcess.exec('powershell date', (err, stdout, stderr) => {
                
                if (stdout) {
                    date = stdout;
                    date = date.replace("\r\n", "");
                    date = date.replace("\r\n\r\n\r\n", "");
                }
                
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, 
                    `${whiteSpace}/* CUT THIS OUT ${date} ${username}\r${text}\r${whiteSpace}* CUT THIS OUT ${username}*/`);
                });
            });
            
            
        }
        goto(e, t) {
            return this.startIfNotStarted().then(r => {
                var i = this.channel.goToDefinitionPromise();
                return e = e.replace(/\\/g, "/"), this.compiler.write(`cm.runtime.refers("${e}", ${t});`), i
            })
        }
        startIfNotStarted() {
            return this.isStarted ? new Promise((e, t) => {
                e(!0)
            }) : this.start()
        }
        clearOutputIfNeeded(e = !1) {
            e || i.cmConfig.clearOutputOnBuild() && this.channel.clear()
        }
    }
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0),
        n = r(6);
    t.cmOutputChannel = class {
        constructor(e, t) {
            this.isResolving = !1, this.partial = "", this.filePath = t, this.output = i.window.createOutputChannel("CM"), this.hashOutput = i.window.createOutputChannel("CM - #"), this.diagnostics = e, this.parsers = [], this.parsers.push(new a(this)), this.activeParsers = []
        }
        clear() {
            this.output.clear()
        }
        write(e, t = !1) {
            if (t) return this.partial.length > 0 && this.output.appendLine(this.partial), void this.output.append(e);
            this.partial.length > 0 && (e = this.partial + e, this.partial = "");
            var r = this.lineParser(e);
            this.output.append(r.newLines)
        }
        goToDefinitionPromise() {
            return this.goToPromise || (this.goToPromise = new Promise((e, t) => {
                this.isResolving = !1, this.goToResolver = e, this.goToRejector = t
            })), this.goToPromise.then(e => (this.goToPromise = null, e), e => {
                throw this.goToPromise = null, e
            })
        }
        lineParser(e) {
            let t = e.replace(/[\x01\x02]/g, "\r\n");
            if (!(e.indexOf("\r\n") > -1) && -1 == t.indexOf("cm>")) return this.partial = t, {
                newLines: ""
            };
            var r = t.split(/\r\n/g),
                n = [];
            const o = /([cC]:.*\.cm)\((\d+)\,\s{1}(\d+)\):(.*)/gm,
                s = /\(cm-goto-def "(.[^"]+)"\s(\d+)/,
                a = /\(next-error\).cm>\s*/,
                c = /'\(cm-show-file-at-pos-selected-window\s"(.*)"\s(\d+)\)\)/,
                l = /^tt$|\(load\s".*"\s.*\)|\(cm-ac-result-none\)/,
                u = /cm>/;
            var m = Date.now();
            return r.forEach(e => {
                let t = !1;
                for (let r of this.parsers)
                    if (e = r.parse(e), r.isActive && r.exclusive) {
                        if (m - r.started < 1e4) {
                            t = !0;
                            break
                        }
                        r.isActive = !1, this.goToRejector && this.goToRejector(), r.complete()
                    } if (!t) {
                    var r = o.exec(e),
                        h = c.exec(e),
                        d = a.exec(e);
                    if (u.test(e) && this.goToPromise && !this.isResolving) this.goToRejector(), this.goToPromise = null;
                    else if (h) this.goToFileLocation(h[1], parseInt(h[2]));
                    else {
                        if (s.test(e)) {
                            var p = s.exec(e),
                                g = p[1],
                                f = parseInt(p[2]);
                            return this.isResolving = !0, void i.workspace.openTextDocument(g).then(e => {
                                var t = e.positionAt(f);
                                t = e.positionAt(f + t.line), this.goToPromise && this.goToResolver ? this.goToResolver(new i.Location(i.Uri.file(g), t)) : console.log("no promise for go to def")
                            })
                            .catch(err => console.log("Error Opening Text Document"))
                        }
                        if (r) {
                            if (!r[4].match(/\simplements\s\w*$/)) {
                                var w = i.DiagnosticSeverity.Error;
                                /found\sno\suses\sof/.test(e) && (w = i.DiagnosticSeverity.Warning), this.setDiagnostics(r[1], +r[2], +r[3], r[4], w), e = `${w==i.DiagnosticSeverity.Warning?"WARNING":"ERROR"} ` + r[1] + ":" + r[2] + ":" + r[3] + " - " + r[4]
                            }
                        } else d && !this.isResolving ? this.goToPromise && this.goToRejector && this.goToRejector() : null != this.watchSuccess && (this.watchSuccess.test(e) ? (this.watchResolve(), this.clearOutputWatch()) : this.watchFail.test(e) && (this.watchReject(), this.clearOutputWatch()))
                    }
                    l.test(e)
                }
                null != e && n.push(e.replace(/\x01/g, "").replace(/\x02/g, ""))
            }), n.length, {
                newLines: n.join("\r\n"),
                hashLines: [].join("\r\n")
            }
        }
        addOutputWatch(e, t, r, i) {
            this.watchResolve = e, this.watchReject = t, this.watchSuccess = r, this.watchFail = i
        }
        clearOutputWatch() {
            this.watchResolve = null, this.watchReject = null, this.watchSuccess = null, this.watchFail = null
        }
        goToFileLocation(e, t) {
            i.workspace.openTextDocument(e).then(e => {
                var r = e.positionAt(t);
                r = e.positionAt(t + r.line), i.window.showTextDocument(e).then(e => {
                    e.revealRange(new i.Range(r, r), i.TextEditorRevealType.InCenter)
                })
                .catch(err => console.log("Error Showing Text Document"))
            })
            .catch(err => console.log("Error Opening Text Document"))
        }
        setDiagnostics(e, t, r, n, o) {
            i.workspace.openTextDocument(e).then(r => {
                var s = r.lineAt(t - 1),
                    a = new i.Diagnostic(s.range, n, o);
                this.diagnostics.set(i.Uri.file(e), [a])
            })
            .catch(err => console.log("Error Opening Text Document"))
        }
    };
    const o = /([cC]:.*\.cm)\((\d+),\s(\d+)\)(.*)/g;
    class s {
        constructor() {
            this.isActive = !1, this.exclusive = !1, this.started = null
        }
        parse(e) {
            let t = o.exec(e);
            return t ? (this.didMatch(t[1], +t[2], +t[3], t[4]), t[1] + "(" + t[2] + "," + t[3] + "): " + t[4]) : e
        }
        complete() {}
        didMatch(e, t, r, i) {}
    }
    class a extends s {
        constructor(e) {
            super();
            this.exclusive = !0, this.startR = /\(cm-push-def\s"[^"]*"\s\d+\)/g, this.endR = /\(cm-next-error\)/g, this.channel = e
        }
        parse(e) {
            if (this.isActive) {
                return this.endR.exec(e) ? (this.isActive = !1, this.complete(), null) : super.parse(e)
            }
            return this.startR.exec(e) ? (this.isActive = !0, this.started = Date.now(), "Found References:") : e
        }
        complete() {
            let e = this.channel.goToResolver,
                t = n.refProvider.first();
            null != e && null != t ? (n.refProvider.clearCache(), e(t)) : n.refProvider.complete()
        }
        didMatch(e, t, r, i) {
            n.refProvider.addReference(e, t, r)
        }
    }
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0),
        n = r(3);
    t.CMReferenceProvider = class {
        constructor() {
            this.compiler = n.getCompiler()
        }
        provideReferences(e, t, r, i) {
            return this.abort(), new Promise((r, i) => (this.pRes = r, this.pRej = i, this.findReferences(e, t)))
        }
        complete() {
            this.pRes && this.pRes(this.cache), this.pRes = null, this.pRej = null
        }
        abort() {
            this.pRej && this.pRej(), this.clearCache(), this.pRes = null, this.pRej = null
        }
        first() {
            return this.cache.length > 0 ? this.cache[0] : null
        }
        addReference(e, t, r) {
            let n = i.Uri.file(e),
                o = new i.Position(t - 1, 0),
                s = new i.Position(t - 1, r);
            this.cache || (this.cache = []), this.cache.push(new i.Location(n, new i.Range(o, s)))
        }
        clearCache() {
            this.cache = []
        }
        findReferences(e, t) {
            var r = e.fileName,
                i = e.offsetAt(t);
            return i += 1 - t.line, r = r.replace(/\\/g, "/"), this.compiler.run(`cm.runtime.refers("${r}", ${i});`)
        }
    }
}, function(e, t, r) {
    (function(t) {
        var i = r(5);
        e.exports = function(e) {
            var r = this,
                n = null,
                o = e,
                s = o && o.onRead || null,
                a = o && o.onError || null,
                c = o && o.onExit || null,
                l = o && o.cmRoot || "C:\\CetDev\\version6.5",
                u = o && o.gitMode ? l + "\\base" : l + "\\home";
            this.start = function(e) {
                return new Promise(function(r, o) {
                    var m = ["/nocoloring"];
                    e && e.clean && m.push("/clean"), l.indexOf("9.5") > -1 ? (m = [l], n = i.spawn(t + "\\cmstartdev.cmd", m)) : n = i.spawn(u + "\\bin\\cmstartdev.cmd", m), n.stdout.on("data", function(e) {
                        e = e.toString(), s && s(e),
                            function(e) {
                                return e.match(/cm>\s*$/g)
                            }(e) && r(!0)
                    }), n.stderr.on("data", function(e) {
                        if (e = e.toString(), !a) throw new Error(e)
                    }), n.on("error", function(e) {
                        console.log("HELP"), console.log(e)
                    }), n.on("exit", function(e) {
                        console.log(e), c && c(e)
                    })
                })
            }, this.write = function(e) {
                var t = function(e) {
                    return e + ""
                }(e);
                o && o.debug && console.log(e), n.stdin.write(t)
            }, this.clean = function() {
                return r.kill(), i.execSync(u + "\\bin\\cmstarttestclean.cmd").toString()
            }, this.runFile = function(e) {
                var t = 'run("' + (e = e.replace(/\\/g, "/")) + '");';
                r.write(t)
            }, this.compileFile = function(e) {
                var t = 'load("' + (e = e.replace(/\\/g, "/")) + '");';
                r.write(t)
            }, this.quitDebug = function() {
                r.write("quit();")
            }, this.kill = function() {
                console.log("Killing pending processes");
                i.execSync(u + '\\bin\\cm_pskill /name "_cm.exe" /beginsWith "msdev" /beginsWith "link" /titleBeginsWith "Microsoft Visual"');
                console.log("All processes killed")
            }
        }
    }).call(this, "/")
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(0);
    var n = r(1),
        o = r(4);
    class s {
        static packageFileUsings() {
            let e = i.window.activeTextEditor.document.uri.fsPath;
            e = e.substring(0, e.lastIndexOf("\\"));
            let t = o.join(e, "package.cm");
            if (n.existsSync(t)) {
                var r = n.readFileSync(t, "utf8").split("\r\n"),
                    s = [];
                return r.forEach(e => {
                    if ("" == e) return;
                    let t = /^\s*?use\s+(.*);$/.exec(e);
                    t && s.push(t[1])
                }), s
            }
            return []
        }
        static getCurrentPackage(e) {
            var t = i.workspace.getWorkspaceFolder(e).uri.fsPath,
                r = -1;
            for (const e of ["\\home\\", "\\base\\", "\\extensions\\", "\\personal\\"])
                if ((r = t.indexOf(e)) > -1) return t.substring(r + e.length).replace("\\", ".");
            return t
        }
        static getDirsUnder(e, t) {
            let r = n.readdirSync(e).filter(t => ".vscode" != t && ".git" != t && n.statSync(o.join(e, t)).isDirectory()).map(e => ({
                    name: e,
                    path: t ? t + "." + e : e
                })),
                i = [];
            return r.forEach(t => {
                i = i.concat(s.getDirsUnder(o.join(e, t.name), t.path))
            }), r.map(e => e.path).concat(i)
        }
        static getObjectNameForMember(e, t) {
            var r = t.split("."),
                i = {
                    varName: r[0]
                };
            return r.length > 1 && (i.memberName = r[r.length - 1]), i
        }
        static getWordAtCursor(e, t) {
            var r = e.getWordRangeAtPosition(t);
            return r ? e.getText(r) : ""
        }
        static getUsingStatements(e) {
            var t, r = /use\s+([\w\.]+)\s*;/gim,
                i = /use\s+(\w+)\s*:\s*([^;]*)/gim,
                n = e.getText(),
                o = [];
            for ((t = n.match(/package\s+([\w\.]+)\s*;/i)) && t.length > 0 && o.push(t[1]); t = r.exec(n);) o.push(t[1]);
            for (; t = i.exec(n);) {
                var a = t[1];
                t[2].split(",").forEach(e => {
                    o.push(`${a}.${e.trim()}`)
                })
            }
            var c = s.packageFileUsings(),
                l = [];
            return c.forEach(e => {
                l.push(e)
            }), o.forEach(e => {
                l.indexOf(e) < 0 && l.push(e)
            }), l
        }
        static getDottedCallsForLine(e, t) {
            return s.getDottedCallsFromString(e.getText(new i.Range(e.positionAt(0), t)), e.offsetAt(t))
        }
        static getDottedCallsFromString(e, t) {
            var r = !1,
                i = [],
                n = [];
            let o = [";", "{", "}", "=", ",", "(", "?"];
            for (; !r;) {
                if (t < 0) {
                    r = 0 == i.length;
                    break
                }
                var s = e.charAt(t),
                    a = !1,
                    c = i[i.length - 1];
                if (o.indexOf(s) > -1) {
                    if (0 == i.length) {
                        t++, r = !0;
                        break
                    }
                    "(" == s && ")" == c && i.pop()
                } else if ('"' == s) {
                    if (!(t > 0 && "\\" == e.charAt(t - 1)))
                        if (a = 0 == i.length || ")" == c, '"' == c) i.pop();
                        else if (!a) {
                        console.log("Statement format error");
                        break
                    }
                } else ")" == s && (a = 0 == i.length || ")" == c);
                a && i.push(s), 0 == i.length && "(" != s && n.push(s), t--
            }
            if (r || console.log("Couldn't Parse"), r) {
                var l = n.reverse().join("").trim(),
                    u = l.match(/(?:public\s+)?class\s+\w+\s+extends\s+(.*)/);
                return u ? u[1] : l.replace(/(\/\/.*(?:\n|\r\n|\n\r))/, "").trim()
            }
        }
        static debounce(e, t, r) {
            let i = arguments,
                n = s.timeout,
                o = this,
                a = r && !n;
            clearTimeout(n), s.timeout = setTimeout(() => {
                n = null, r || e.apply(o, i)
            }, t), a && e.apply(o, i)
        }
        static addCopyright(e) {
            var t = "/** Configura CET Source Copyright Notice (CETSC)\n\n   This file contains Configura CM source code and is part of the\n   Configura CET Development Platform (CETDEV). Configura CM\n   is a programming language created by Configura Sverige AB.\n   Configura, Configura CET and Configura CM are trademarks of\n   Configura Sverige AB. Configura Sverige AB owns Configura CET,\n   Configura CM, and CETDEV.\n\n   Copyright (C) 2004 Configura Sverige AB, All rights reserved.\n\n   You can modify this source file under the terms of the Configura CET\n   Source Licence Agreement (CETSL) as published by Configura Sverige AB.\n\n   Configura Sverige AB has exclusive rights to all changes, modifications,\n   and corrections of this source file. Configura Sverige AB has exclusive\n   rights to any new source file containing material from this source file.\n   A new source file based on this source file or containing material from\n   this source file has to include this Configura CET Source Copyright Notice\n   in its full content. All changes, modifications, and corrections mentioned\n   above shall be reported to Configura Sverige AB within One Month from\n   the date that the modification occurred.\n\n   Configura CM is distributed in the hope that it will be useful, but\n   WITHOUT ANY WARRANTY; without even the implied warranty of\n   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\n   See the CETSL for more details.\n\n   You should have received a copy of the CETSL along with the CETDEV.\n   If not, write to Configura Sverige AB, Box 306, SE-581 02 Linköping, Sweden.\n   Tel +46 13377800, Fax +46 13377855,\n   Email: info@configura.com, www.configura.com\n\n   END OF CETSC\n*/\n\npackage {Package};\n\npublic class {Class} {\n    public constructor() {\n    }   \n}",
                r = i.workspace.asRelativePath(e, !1).replace(/\\/g, "/");
            r = "" == (r = r.substring(0, r.lastIndexOf("/")).replace(/\//g, ".")) ? "" : "." + r;
            let n = s.getCurrentPackage(e) + r;
            i.workspace.openTextDocument(e).then(r => {
                if (r.lineCount > 1) {
                    let e = /^package\s[^;]*/m.exec(r.getText()),
                        t = e.index,
                        o = e[0].length,
                        s = new i.Range(r.positionAt(t), r.positionAt(t + o)),
                        a = new i.WorkspaceEdit;
                    return a.replace(r.uri, s, "package " + n), void i.workspace.applyEdit(a).then(e => {
                        r.save()
                    })
                    .catch(err => console.log("Error Applying Edit"))
                }
                r.lineAt(0).text.match(/Configura CET Source Copyright Notice/) || i.window.showTextDocument(r).then(o => {
                    o.edit(r => {
                        r.insert(new i.Position(0, 0), t.replace("{Package}", n).replace("{Class}", e.path.substring(e.path.lastIndexOf("/") + 1, e.path.lastIndexOf("."))))
                    }).then(e => {
                        const t = new i.Position(0, 0);
                        o.selection = new i.Selection(t, t)
                    }).then(e => {
                        const t = new i.Position(39, 4),
                            n = new i.Selection(t, t);
                        o.selection = n, o.revealRange(o.selection, i.TextEditorRevealType.InCenter), r.save()
                    })
                    .catch(err => console.log("Error Editing"))
                })
                .catch(err => console.log("Error Showing Text Documents"))
            })
            .catch(err => console.log("Error Opening Text Document"))
        }
        static createResourceTemplate(e) {
            var t = 'package {Package};\n\n$ {\n    english "";\n}',
                r = i.workspace.asRelativePath(e, !1).replace(/\\/g, "/");
            r = "" == (r = r.substring(0, r.lastIndexOf("/")).replace(/\//g, ".")) ? "" : "." + r;
            let n = s.getCurrentPackage(e) + r;
            i.workspace.openTextDocument(e).then(e => {
                e.lineCount > 1 || e.lineAt(0).text.match(/package /) || i.window.showTextDocument(e).then(r => {
                    r.edit(e => {
                        e.insert(new i.Position(0, 0), t.replace("{Package}", n))
                    }).then(e => {
                        const t = new i.Position(0, 0);
                        r.selection = new i.Selection(t, t)
                    })
                    .catch(err => console.log("Error Editing"))
                    .then(t => {
                        const n = new i.Position(2, 1),
                            o = new i.Selection(n, n);
                        r.selection = o, r.revealRange(r.selection, i.TextEditorRevealType.InCenter), e.save()
                    })
                })
                .catch(err => console.log("Error Showing Text Document"))
            })
            .catch(err => console.log("Error Opening Text Document"))
        }
    }
    t.cmUtils = s
}, function(e, t, r) {
    "use strict";
    Object.defineProperty(t, "__esModule", {
        value: !0
    });
    const i = r(2),
        n = r(1);
    var o = "",
        s = [];
    const a = r(0);
    t.registerCommands = function(e) {

        let t = a.commands.registerCommand("cm.start", () => e.start()),

            selectionToComment = a.commands.registerCommand("commentSelection",() => e.selectionToComment(e)),
            addTitleComment = a.commands.registerCommand("titleComment",() => e.titleComment()),
            addFunctionComment = a.commands.registerCommand("functionComment",() => e.functionComment()),
            addOfsTab = a.commands.registerCommand("ofsTab", () => e.ofsTab()),
            r = a.commands.registerCommand("cm.stopcm", () => e.stop()),
            i = a.commands.registerCommand("cm.cleancm", () => e.clean()),
            m = a.commands.registerCommand("cm.startcet", () => e.run('run("cet.runtime","designer.cm");')),
            h = a.commands.registerCommand("cm.quitdebug", () => e.quitDebug()),
            d = a.commands.registerCommand("cm.runline", () => {
                l(!0, t => {
                    var r = t.document.lineAt(t.selection.active.line).text.trim();
                    e.run(r)
                })
            }),
            gitUsername = a.commands.registerCommand("getGitUsername", () => {
                e.getGitUsername()
            }),
            p = a.commands.registerCommand("cm.runcurrentfile", t => {
                l(!0, t => {
                    e.runCurrentFile(t.document.fileName)
                })
            }),
            g = a.commands.registerCommand("cm.compilefile", t => {
                t && t.file ? e.compileFile(t.file) : l(!0, t => {
                    e.compileFile(t.document.fileName)
                })
            }),
            f = a.commands.registerCommand("cm.compilepackage", () => {
                l(!0, t => {
                    e.compileFile(t.document.fileName)
                })
            }),
            w = a.commands.registerCommand("cm.loadall", () => {
                l(!0, t => {
                    t.document.save(), e.loadAllKnown(t.document.fileName)
                })
            }),
            C = a.commands.registerCommand("cm.profileboot", () => {
                l(!1, e => {
                    a.workspace.openTextDocument(u("boot.cm")).then(e => {
                        a.window.showTextDocument(e)
                    })
                    .catch(err => console.log("Error Opening Text Document"))
                })
            }),
            v = a.commands.registerCommand("cm.compileallbelow", () => {
                e.compileVSWorkspace()
            }),
            x = (a.commands.registerCommand("cm.compileworkspace", () => {
                e.compileWorkspace()
            }), a.commands.registerCommand("cm.runexternal", t => {
                "string" == typeof t && e.run(t)
            })),
            P = a.commands.registerCommand("cm.startwriteoutputfile", () => {
                e.startWritingOutputFile()
            }),
            b = a.commands.registerCommand("cm.stopwriteoutputfile", () => {
                e.stopWritingOutputFile()
            }),
            
            S = a.commands.registerCommand("cm.userScript", () => {
                a.window.showQuickPick(s.length > 0 ? Promise.resolve(s) : new Promise((e, t) => {
                    a.workspace.workspaceFolders.forEach(e => {
                        try {
                            let r = n.readFileSync(e.uri.fsPath + "/vscode.scripts.cm", "utf8"),
                                i = /public\s+void\s+(.[^\(\)]*)\s*\(\)/g,
                                a = /package\s(.[^;]*);/;
                            var t;
                            for (o = a.exec(r)[1]; null !== (t = i.exec(r));) s.push(`${t[1]} (${o})`)
                        } catch (e) {}
                    }), 0 == s.length ? t("No User Scripts Found") : (!0, e(s))
                })).then(t => {
                    if (t) {
                        let r = /([a-zA-Z0-9]*)\s\((.*)\)/.exec(t);
                        r && e.run(`{ use ${r[2]}; ${r[1]}();}`)
                    }
                }, e => {
                    console.log("ooo no")
                })
            }),
            y = (a.commands.registerCommand("extension.openFile", e => {
                a.workspace.openTextDocument(e).then(e => {
                    a.window.showTextDocument(e, {
                        preserveFocus: !0,
                        preview: !0
                    })
                })
                .catch(err => console.log("Error Opening Text Document"))
            }), a.commands.registerCommand("cm.implements", () => {
                l(!0, t => {
                    const r = c(t);
                    e.run(`cm.runtime.implementsMethod("${t.document.fileName.replace(/\\/g,"/")}", ${r});`)
                })
            })),
            T = a.commands.registerCommand("cm.subclasses", () => {
                l(!0, t => {
                    const r = c(t);
                    e.run(`cm.runtime.subClasses("${t.document.fileName.replace(/\\/g,"/")}", [${r},${r}], 4);`)
                })
            }),
            E = a.commands.registerCommand("cm.overrides", () => {
                l(!0, t => {
                    const r = c(t);
                    e.run(`cm.runtime.overridesMethod("${t.document.fileName.replace(/\\/g,"/")}", ${r});`)
                })
            });
        return a.commands.registerCommand("cm.profiletest", () => {
            l(!1, e => {
                a.workspace.openTextDocument(u("t.cm")).then(e => {
                    a.window.showTextDocument(e)
                })
                .catch(err => console.log("Error Opening Text Document"))
            })
        }), a.Disposable.from(t, r, i, m, h, d, p, g, f, w, C, v, x, P, b, S, y, T, E, addTitleComment, selectionToComment, addFunctionComment, addOfsTab, gitUsername)
    };
    a.commands.registerCommand("cm.Test", () => {
        console.log("I DID IT")
    });

    function c(e) {
        const t = e.selection.start;
        return e.document.offsetAt(t) + (1 - t.line)
    }

    function l(e, t) {
        const r = a.window.activeTextEditor;
        if (e) {
            if (!r) return;
            if (r.document.save(), "cm" != r.document.languageId) return
        }
        t(r)
    }

    function u(e) {
        const t = process.env.USER || process.env.USERNAME;
        if (!t) return void a.window.showErrorMessage("Unable to retrieve username");
        let r = i.cmConfig.cmGitMode() ? "personal" : "home";
        return a.Uri.file(`${i.cmConfig.cmRoot()}\\${r}\\profile\\${t.toLowerCase()}\\${e}`)
    }
    t.foldCopyright = function(e) {
        if (e?.document) {
            if (e.document.uri.fsPath.endsWith(".cm")) return a.commands.executeCommand("editor.fold", {
                selectionLines: [0]
            }).then(t => {
                e.revealRange(e.selection, a.TextEditorRevealType.InCenterIfOutsideViewport)
            }, e => {})
        }
        
    }
}]);
//# sourceMappingURL=extension.js.map
exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;

