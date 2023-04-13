"use strict";
exports.__esModule = true;
exports.Configuration = void 0;
var path = require("path");
var vscode = require("vscode");
var rules_1 = require("./rules");
var fs = require("fs");
var json5 = require("json5");
const { stringify } = require("querystring");

var parser;
var Configuration = /** @class */ (function () {



    /**
     * Creates a new instance of the Parser class
     */
    function Configuration() {
        this.extensionName = "ofs";
        this.singleLineBlockCommand = "ofs.singleLineBlock";
        this.singleLineConfigFile = __dirname +
            "\\language-configuration\\single-line-configuration.json";
        this.multiLineConfigFile = __dirname +
            "\\language-configuration\\multi-line-configuration.json";
        this.commentConfig = new Map();
        this.languageConfigFiles = new Map();
        this.singleLineBlockOnEnter = "singleLineBlockOnEnter";
        this.slashStyleBlocks = "slashStyleBlocks";
        this.hashStyleBlocks = "hashStyleBlocks";
        this.semicolonStyleBlocks = "semicolonStyleBlocks";
        this.disabledLanguages = "disabledLanguages";
        this.singleLineBlocksMap = new Map();

        this.disabledLanguageList = this.getConfiguration().get(this.disabledLanguages);
        this.UpdateLanguagesDefinitions();
    }


    Configuration.prototype.getConfiguration = function () {
        return vscode.workspace.getConfiguration(this.extensionName);
    };
    Configuration.prototype.isLangIdDisabled = function (langId) {
        return this.disabledLanguageList.indexOf(langId) !== -1;
    };
    Configuration.prototype.getMultiLineLanguages = function () {
        var multiLineConfig = JSON.parse(fs.readFileSync(this.multiLineConfigFile, 'utf8'));
        return multiLineConfig["languages"];
    };

    Configuration.prototype.setLanguageConfiguration = function (langId, multiLine, singleLineStyle, event) {
        
        var langConfig = {
            onEnterRules: []
        };
        if (multiLine) {
            if (this.isWithinMultiLineComment(event)) {
                langConfig.onEnterRules = langConfig.onEnterRules.concat(rules_1.Rules.multilineEnterRules);
            }
        }
        var isOnEnter = this.getConfiguration().get(this.singleLineBlockOnEnter);
        if (isOnEnter && singleLineStyle) {
            if (singleLineStyle === '//') {
                langConfig.onEnterRules =
                    langConfig.onEnterRules.concat(rules_1.Rules.slashEnterRules);
            }
            else if (singleLineStyle === '#') {
                langConfig.onEnterRules =
                    langConfig.onEnterRules.concat(rules_1.Rules.hashEnterRules);
            }
            else if (singleLineStyle === ';') {
                langConfig.onEnterRules =
                    langConfig.onEnterRules.concat(rules_1.Rules.semicolonEnterRules);
            }
        }
        langConfig.onEnterRules = langConfig.onEnterRules.concat(rules_1.Rules.endCommentEnterRules);
        return vscode.languages.setLanguageConfiguration(langId, langConfig, singleLineStyle, event);
    };


    Configuration.prototype.getSingleLineLanguages = function () {
        var singleLineConfig = JSON.parse(fs.readFileSync(this.singleLineConfigFile, 'utf8'));
        var commentStyles = Object.keys(singleLineConfig);
        for (var _i = 0, commentStyles_1 = commentStyles; _i < commentStyles_1.length; _i++) {
            var key = commentStyles_1[_i];
            for (var _a = 0, _b = singleLineConfig[key]; _a < _b.length; _a++) {
                var langId = _b[_a];
                if (!this.isLangIdDisabled(langId)) {
                    this.singleLineBlocksMap.set(langId, key);
                }
            }
        }
        // get user-customized langIds for this key and add to the map
        var customSlashLangs = this.getConfiguration().get(this.slashStyleBlocks);
        for (var _c = 0, customSlashLangs_1 = customSlashLangs; _c < customSlashLangs_1.length; _c++) {
            var langId = customSlashLangs_1[_c];
            if (langId && langId.length > 0) {
                this.singleLineBlocksMap.set(langId, '//');
            }
        }
        var customHashLangs = this.getConfiguration().get(this.hashStyleBlocks);
        for (var _d = 0, customHashLangs_1 = customHashLangs; _d < customHashLangs_1.length; _d++) {
            var langId = customHashLangs_1[_d];
            if (langId && langId.length > 0) {
                this.singleLineBlocksMap.set(langId, '#');
            }
        }
        var customSemicolonLangs = this.getConfiguration().get(this.semicolonStyleBlocks);
        for (var _e = 0, customSemicolonLangs_1 = customSemicolonLangs; _e < customSemicolonLangs_1.length; _e++) {
            var langId = customSemicolonLangs_1[_e];
            if (langId && langId.length > 0) {
                this.singleLineBlocksMap.set(langId, ';');
            }
        }
    };


    /* 
     * Configure comment blocks. 
     */
    Configuration.prototype.configureCommentBlocks = function (context) {
        this.getSingleLineLanguages();
        // set language configurations
        var multiLineLangs = this.getMultiLineLanguages();
        for (var _i = 0, _a = this.singleLineBlocksMap; _i < _a.length; _i++) {
            var _b = _a[_i], langId = _b[0], style = _b[1];
            var multiLine = multiLineLangs.indexOf(langId) !== -1;
            var disposable = this.setLanguageConfiguration(langId, multiLine, style, context);
            context.subscriptions.push(disposable);
        }
        for (var _c = 0, multiLineLangs_1 = multiLineLangs; _c < multiLineLangs_1.length; _c++) {
            var langId = multiLineLangs_1[_c];
            if (!this.singleLineBlocksMap.has(langId) &&
                !this.isLangIdDisabled(langId)) {
                    var disposable = this.setLanguageConfiguration(langId, true, null, context);
                    if (context?.subscriptions) {
                        context.subscriptions.push(disposable);
                    }
            }
        }
    };


    /* 
     * Check if the cursor location is located within a block comment. 
     */
    Configuration.prototype.isWithinMultiLineComment = function(event) {
        if (event) {
            if (event.selections) {
                if(this.parser.CheckIfInComment(vscode.window.activeTextEditor, event.selections[0].active)) {
                    return true;
                }
            }
        }
        return false;
    };

    
    /* 
     * This is used by the extension file to make a connection between this, and the existing
     * parser instance. 
     */
    Configuration.prototype.setParser = function(newParser)  {
        this.parser = newParser;
    };

    /* 
    Handle single line blocks. 
    */
    Configuration.prototype.handleSingleLineBlock = function (textEditor, edit) {
        var langId = textEditor.document.languageId;
        var style = this.singleLineBlocksMap.get(langId);
        if (style && textEditor.selection.isEmpty) {
            var line = textEditor.document.lineAt(textEditor.selection.active);
            var isCommentLine = true;
            var indentRegex;
            if (style === '//' && line.text.search(/^\s*\/\/\s*/) !== -1) {
                indentRegex = /\//;
                if (line.text.search(/^\s*\/\/\/\s*/) !== -1) {
                    style = '///';
                }
            }
            else if (style === '#' && line.text.search(/^\s*#\s*/) !== -1) {
                indentRegex = /#/;
            }
            else if (style === ';' && line.text.search(/^\s*;\s*/) !== -1) {
                indentRegex = /;/;
            }
            else {
                isCommentLine = false;
            }
            if (!isCommentLine) {
                return;
            }
            var indentedNewLine = '\n' +
                line.text.substring(0, line.text.search(indentRegex));
            var isOnEnter = this.getConfiguration().get(this.singleLineBlockOnEnter);
            if (!isOnEnter) {
                indentedNewLine += style + ' ';
            }
            edit.insert(textEditor.selection.active, indentedNewLine);
        }
    };


    Configuration.prototype.registerCommands = function () {
        var _this = this;
        vscode.commands.registerTextEditorCommand(this.singleLineBlockCommand, function (textEditor, edit, args) {
            _this.handleSingleLineBlock(textEditor, edit);
        });
    };


    /**
     * Generate a map of configuration files by language as defined by extensions
     * External extensions can override default configurations os VSCode
     */
    Configuration.prototype.UpdateLanguagesDefinitions = function () {
        this.commentConfig.clear();
        for (var _i = 0, _a = vscode.extensions.all; _i < _a.length; _i++) {
            var extension = _a[_i];
            var packageJSON = extension.packageJSON;
            if (packageJSON.contributes && packageJSON.contributes.languages) {
                for (var _b = 0, _c = packageJSON.contributes.languages; _b < _c.length; _b++) {
                    var language = _c[_b];
                    if (language.configuration) {
                        var configPath = path.join(extension.extensionPath, language.configuration);
                        this.languageConfigFiles.set(language.id, configPath);
                    }
                }
            }
        }
    };
    /**
     * Gets the configuration information for the specified language
     * @param languageCode
     * @returns
     */
    Configuration.prototype.GetCommentConfiguration = function (languageCode) {
        // * check if the language config has already been loaded
        if (this.commentConfig.has(languageCode)) {
            return this.commentConfig.get(languageCode);
        }
        // * if no config exists for this language, back out and leave the language unsupported
        if (!this.languageConfigFiles.has(languageCode)) {
            return undefined;
        }
        try {
            // Get the filepath from the map
            var filePath = this.languageConfigFiles.get(languageCode);
            var content = fs.readFileSync(filePath, { encoding: 'utf8' });
            // use json5, because the config can contains comments
            var config = json5.parse(content);
            this.commentConfig.set(languageCode, config.comments);
            return config.comments;
        }
        catch (error) {
            this.commentConfig.set(languageCode, undefined);
            return undefined;
        }
    };
    return Configuration;
}());
exports.Configuration = Configuration;
