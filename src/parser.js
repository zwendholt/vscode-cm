"use strict";
exports.__esModule = true;
exports.Parser = void 0;
var vscode = require("vscode");
var Parser = /** @class */ (function () {
    /**
     * Creates a new instance of the Parser class
     * @param configuration
     */
    function Parser(config) {

        this.tags = [];
        this.expression = "";
        this.delimiter = "";
        this.blockCommentStart = "";
        this.blockCommentEnd = "";
        this.highlightSingleLineComments = true;
        this.highlightMultilineComments = false;
        this.highlightJSDoc = false;
        // * this will allow plaintext files to show comment highlighting if switched on
        this.isPlainText = false;
        // * this is used to prevent the first line of the file (specifically python) from coloring like other comments
        this.ignoreFirstLine = false;
        // * this is used to trigger the events when a supported language code is found
        this.supportedLanguage = true;
        // Read from the package.json
        this.contributions = vscode.workspace.getConfiguration('better-comments');
        this.configuration = config;
        this.setTags();
    }
    /**
     * Sets the regex to be used by the matcher based on the config specified in the package.json
     * @param languageCode The short code of the current language
     * https://code.visualstudio.com/docs/languages/identifiers
     */
    Parser.prototype.SetRegex = function (languageCode) {
        this.setDelimiter(languageCode);
        // if the language isn't supported, we don't need to go any further
        if (!this.supportedLanguage) {
            return;
        }
        var characters = [];
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var commentTag = _a[_i];
            characters.push(commentTag.escapedTag);
        }
        if (this.isPlainText && this.contributions.highlightPlainText) {
            // start by tying the regex to the first character in a line
            this.expression = "(^)+([ \\t]*[ \\t]*)";
        }
        else {
            // start by finding the delimiter (//, --, #, ') with optional spaces or tabs
            this.expression = "(" + this.delimiter + ")+( |\t)*";
        }
        // Apply all configurable comment start tags
        this.expression += "(";
        this.expression += characters.join("|");
        this.expression += ")+(.*)";
    };
    /**
     * Finds all single line comments delimited by a given delimiter and matching tags specified in package.json
     * @param activeEditor The active text editor containing the code document
     */
    Parser.prototype.FindSingleLineComments = function (activeEditor) {
        // If highlight single line comments is off, single line comments are not supported for this language
        if (!this.highlightSingleLineComments) {
            return;
        }
        
        var text = activeEditor.document.getText();
        // if it's plain text, we have to do mutliline regex to catch the start of the line with ^
        var regexFlags = (this.isPlainText) ? "igm" : "ig";
        var regEx = new RegExp(this.expression, regexFlags);
        var match;
        while (match = regEx.exec(text)) {
            var startPos = activeEditor.document.positionAt(match.index);
            var endPos = activeEditor.document.positionAt(match.index + match[0].length);
            var range = { range: new vscode.Range(startPos, endPos) };
            // Required to ignore the first line of .py files (#61)
            if (this.ignoreFirstLine && startPos.line === 0 && startPos.character === 0) {
                continue;
            }
            // Find which custom delimiter was used in order to add it to the collection
            var matchTag = this.tags.find(function (item) { return item.tag.toLowerCase() === match[3].toLowerCase(); });
            if (matchTag) {
                matchTag.ranges.push(range);
            }
        }
    };


    /**
     * @param  activeEditor 
     * @param  changedIndex 
     */
    Parser.prototype.CheckIfInComment = function(activeEditor, changedIndex) {
        // If highlight multiline is off in package.json or doesn't apply to his language, return
        if (!this.highlightMultilineComments)
            return;
        var text = activeEditor.document.getText();
        // Build up regex matcher for custom delimiter tags
        var characters = [];
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var commentTag = _a[_i];
            characters.push(commentTag.escapedTag);
        }
        // Combine custom delimiters and the rest of the comment block matcher
        var commentMatchString = "(^)+([ \\t]*[ \\t]*)(";
        commentMatchString += characters.join("|");
        commentMatchString += ")([ ]*|[:])+([^*/][^\\r\\n]*)";
        // Use start and end delimiters to find block comments
        var regexString = "(^|[ \\t])(";
        regexString += this.blockCommentStart;
        // adding this so that the title comments are accepted. /******.... 
        regexString += "\\*\*"
        regexString += "[\\s])+([\\s\\S]*?)(";
        regexString += this.blockCommentEnd;
        
        regexString += ")";
        var regEx = new RegExp(regexString, "gm");
        var commentRegEx = new RegExp(commentMatchString, "igm");

        var match;
        while (match = regEx.exec(text)) {

            var commentBlock = match[0];
            var line = void 0;
            var _loop_1 = function () {
                var startPos = activeEditor.document.positionAt(match.index + line.index + line[2].length);
                if (startPos.line === changedIndex.line || changedIndex.line === startPos.line - 1) {
                    return true;
                }
            };
            var this_1 = this;
            while (line = commentRegEx.exec(commentBlock)) {
                if(_loop_1()) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * Finds block comments as indicated by start and end delimiter
     * @param activeEditor The active text editor containing the code document
     */
    Parser.prototype.FindBlockComments = function (activeEditor) {
        // If highlight multiline is off in package.json or doesn't apply to his language, return
        if (!this.highlightMultilineComments)
            return;
        var text = activeEditor.document.getText();
        // Build up regex matcher for custom delimiter tags
        var characters = [];
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var commentTag = _a[_i];
            characters.push(commentTag.escapedTag);
        }
        // Combine custom delimiters and the rest of the comment block matcher
        var commentMatchString = "(^)+([ \\t]*[ \\t]*)(";
        commentMatchString += characters.join("|");
        commentMatchString += ")([ ]*|[:])+([^*/][^\\r\\n]*)";
        // Use start and end delimiters to find block comments
        var regexString = "(^|[ \\t])(";
        regexString += this.blockCommentStart;
        regexString += "[\\s])+([\\s\\S]*?)(";
        regexString += this.blockCommentEnd;
        regexString += ")";
        var regEx = new RegExp(regexString, "gm");
        var commentRegEx = new RegExp(commentMatchString, "igm");


        //*** I think in here, What I actually need to do is instead of finding a match, I need to loop over the whole thing. 
        //*** essentialy instead of finding the entire match, find a match for the beginning, and keep track of that. add it to some variable like "closureStatementsNeeded"
        //*** and then when you actually find an end, subtract 1 from the "closureStatementsNeeded" var. When that hits 0, you are at the end of the statement. 
        //*** then use that first start position, and the final end position. 
        
        // Find the multiline comment block
        var match;
        while (match = regEx.exec(text)) {
            var commentBlock = match[0];
            // Find the line
            var line = void 0;
            var _loop_1 = function () {
                
                var startPos = activeEditor.document.positionAt(match.index + line.index + line[2].length);
                var endPos = activeEditor.document.positionAt(match.index + line.index + line[0].length);

                var range = { range: new vscode.Range(startPos, endPos) };
                // Find which custom delimiter was used in order to add it to the collection
                var matchString = line[3];

                var matchTag = this_1.tags.find(function (item) { return item.tag.toLowerCase() === matchString.toLowerCase(); });
                if (matchTag) {
                    matchTag.ranges.push(range);
                }
            };
            var this_1 = this;
            while (line = commentRegEx.exec(commentBlock)) {
                _loop_1();
            }
        }
    };


    /**
     * Finds all multiline comments starting with "*"
     * @param activeEditor The active text editor containing the code document
     */
    Parser.prototype.FindJSDocComments = function (activeEditor) {
        // If highlight multiline is off in package.json or doesn't apply to his language, return
        if (!this.highlightMultilineComments && !this.highlightJSDoc)
            return;
        var text = activeEditor.document.getText();
        // Build up regex matcher for custom delimiter tags
        var characters = [];
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var commentTag = _a[_i];
            characters.push(commentTag.escapedTag);
        }
        // Combine custom delimiters and the rest of the comment block matcher
        var commentMatchString = "(^)+([ \\t]*\\*[ \\t]*)("; // Highlight after leading *
        var regEx = /(^|[ \t])(\/\*\*)+([\s\S]*?)(\*\/)/gm; // Find rows of comments matching pattern /** */
        commentMatchString += characters.join("|");
        commentMatchString += ")([ ]*|[:])+([^*/][^\\r\\n]*)";
        var commentRegEx = new RegExp(commentMatchString, "igm");
        // Find the multiline comment block
        var match;
        while (match = regEx.exec(text)) {
            var commentBlock = match[0];
            // Find the line
            var line = void 0;
            var _loop_2 = function () {
                var startPos = activeEditor.document.positionAt(match.index + line.index + line[2].length);
                var endPos = activeEditor.document.positionAt(match.index + line.index + line[0].length);
                var range = { range: new vscode.Range(startPos, endPos) };
                // Find which custom delimiter was used in order to add it to the collection
                var matchString = line[3];
                var matchTag = this_2.tags.find(function (item) { return item.tag.toLowerCase() === matchString.toLowerCase(); });
                if (matchTag) {
                    matchTag.ranges.push(range);
                }
            };
            var this_2 = this;
            while (line = commentRegEx.exec(commentBlock)) {
                _loop_2();
            }
        }
    };
    /**
     * Apply decorations after finding all relevant comments
     * @param activeEditor The active text editor containing the code document
     */
    Parser.prototype.ApplyDecorations = function (activeEditor) {
        for (var _i = 0, _a = this.tags; _i < _a.length; _i++) {
            var tag = _a[_i];
            activeEditor.setDecorations(tag.decoration, tag.ranges);
            // clear the ranges for the next pass
            tag.ranges.length = 0;
        }
    };
    //#region  Private Methods
    /**
     * Sets the comment delimiter [//, #, --, '] of a given language
     * @param languageCode The short code of the current language
     * https://code.visualstudio.com/docs/languages/identifiers
     */
    Parser.prototype.setDelimiter = function (languageCode) {
        this.supportedLanguage = false;
        this.ignoreFirstLine = false;
        this.isPlainText = false;
        var config = this.configuration.GetCommentConfiguration(languageCode);
        if (config) {
            var blockCommentStart = config.blockComment ? config.blockComment[0] : null;
            var blockCommentEnd = config.blockComment ? config.blockComment[1] : null;
            this.setCommentFormat(config.lineComment || blockCommentStart, blockCommentStart, blockCommentEnd);
            this.supportedLanguage = true;
        }
        switch (languageCode) {
            case "apex":
            case "javascript":
            case "javascriptreact":
            case "typescript":
            case "typescriptreact":
                this.highlightJSDoc = true;
                break;
            case "elixir":
            case "python":
            case "tcl":
                this.ignoreFirstLine = true;
                break;
            case "plaintext":
                this.isPlainText = true;
                // If highlight plaintext is enabled, this is a supported language
                this.supportedLanguage = this.contributions.highlightPlainText;
                break;
        }
    };
    /**
     * Sets the highlighting tags up for use by the parser
     */
    Parser.prototype.setTags = function () {
        var items = this.contributions.tags;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var options = { color: item.color, backgroundColor: item.backgroundColor };
            // ? the textDecoration is initialised to empty so we can concat a preceeding space on it
            options.textDecoration = "";
            if (item.strikethrough) {
                options.textDecoration += "line-through";
            }
            if (item.underline) {
                options.textDecoration += " underline";
            }
            if (item.bold) {
                options.fontWeight = "bold";
            }
            if (item.italic) {
                options.fontStyle = "italic";
            }
            var escapedSequence = item.tag.replace(/([()[{*+.$^\\|?])/g, '\\$1');
            this.tags.push({
                tag: item.tag,
                escapedTag: escapedSequence.replace(/\//gi, "\\/"),
                ranges: [],
                decoration: vscode.window.createTextEditorDecorationType(options)
            });
        }
    };
    /**
     * Escapes a given string for use in a regular expression
     * @param input The input string to be escaped
     * @returns {string} The escaped string
     */
    Parser.prototype.escapeRegExp = function (input) {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    };
    /**
     * Set up the comment format for single and multiline highlighting
     * @param singleLine The single line comment delimiter. If NULL, single line is not supported
     * @param start The start delimiter for block comments
     * @param end The end delimiter for block comments
     */
    Parser.prototype.setCommentFormat = function (singleLine, start, end) {
        var _this = this;
        if (start === void 0) { start = null; }
        if (end === void 0) { end = null; }
        this.delimiter = "";
        this.blockCommentStart = "";
        this.blockCommentEnd = "";
        // If no single line comment delimiter is passed, single line comments are not supported
        if (singleLine) {
            if (typeof singleLine === 'string') {
                this.delimiter = this.escapeRegExp(singleLine).replace(/\//ig, "\\/");
            }
            else if (singleLine.length > 0) {
                // * if multiple delimiters are passed, the language has more than one single line comment format
                var delimiters = singleLine
                    .map(function (s) { return _this.escapeRegExp(s); })
                    .join("|");
                this.delimiter = delimiters;
            }
        }
        else {
            this.highlightSingleLineComments = false;
        }
        if (start && end) {
            this.blockCommentStart = this.escapeRegExp(start);
            this.blockCommentEnd = this.escapeRegExp(end);
            this.highlightMultilineComments = this.contributions.multilineComments;
        }
    };
    return Parser;
}());
exports.Parser = Parser;
