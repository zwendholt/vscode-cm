'use strict';

import { cmConfig } from './cmConfig';
import { cmOutputChannel } from './cmOutputChannel';
import vscode = require('vscode');
import { workspace } from 'vscode';

var compilerContainer = require("./helpers/cmCompilerBridge");

export class cmCompilerAdapter {
    
    private channel: cmOutputChannel;
    private filePath: string;
    private compiler;
    private isStarted: boolean = false;
    private diagnostics: vscode.DiagnosticCollection;
    
    constructor( diagnostics: vscode.DiagnosticCollection, filePath: string ) {
        this.filePath = filePath;
        this.channel = new cmOutputChannel( diagnostics, filePath );
        this.diagnostics = diagnostics;
        
        this.compiler = new compilerContainer( {
            cmRoot: cmConfig.cmRoot(),
            onRead: (data) => {
                this.channel.write( data );
            },
            onError: (data) => {
                vscode.window.showInformationMessage( "Error from CM Process" );
                this.channel.write( `[INFO: CM_Process_Error -> ${data}]` );
            },
            //debug: true,
            nocoloring: true
        });
    }

    public reset() {
        this.compiler.kill();

        this.compiler = new compilerContainer( {
            cmRoot: cmConfig.cmRoot(),
            onRead: (data) => {
                this.channel.write( data );
            },
            onError: (data) => {
                vscode.window.showInformationMessage( "Error from CM Process" );
                this.channel.write( `[INFO: CM_Process_Error -> ${data}]` );
            },
            //debug: true,
            "cmArch": cmConfig.arch()
        });
        this.clearOutputIfNeeded();
        this.isStarted = false;
        return this.start();
    }
    
    public startWritingOutputFile() : void {
        this.channel.write( `[Contents of output channel will now be written to: ${this.filePath}]\n` );
        this.channel.writeOutputToFile = true;
    }
    
    public stopWritingOutputFile() : void {
        this.channel.writeOutputToFile = false;
        this.channel.write( "[Stopped writing output to file]\n" );
    }
    
    public start() : Thenable<boolean> {
        if ( this.isStarted ) { return; }
        
        return new Promise((resolve, reject) => {
            this.compiler.start()
            .then( (success) => {
                this.isStarted = success;
                resolve(success);  
            }, reject);
        });        
    }
    
    public clean() {
        // this.clearOutputIfNeeded();
        this.channel.clear();
        this.channel.write("Starting Clean...\n", true);
        var results = this.compiler.clean();
        this.channel.write( "[INFO make clean-cm:]\n", true );
        this.channel.write( "---------------------\n", true );
        this.channel.write( results, true );
        this.channel.write( "---------------------\n", true );
        this.channel.write( "[INFO CM Clean]\n", true );
        this.isStarted = false;
    }
    
    public stop() {
        if ( !this.isStarted ) { return; }
        this.clearOutputIfNeeded();
        this.channel.write( "[INFO CM Killed]\n", true );
        this.compiler.kill();
        this.isStarted = false;
    }
    
    public loadAllKnown( file: string ) {
        this.diagnostics.clear();
        this.startIfNotStarted().then( (succuess) => {
        //    this.compiler.write( "use cm.rs; updateParsedRs();" );
            console.log(file);
            this.compiler.write(`loadAll("${file.replace(/\\/g, "/")}");`);
        });
    }

    public compileWorkspace() {
        this.startIfNotStarted().then( (succuess) => {
            cmConfig.currentWorkspace()
            .then( path => {
                path = path.replace( /\\/g, "/" ) + "/";
                this.run( `{ use cm.runtime.util; compileAllBelow(CompileAllEnv("${path}")); }` );
            })
            // const path = cmConfig.currentWorkspace()
            
        } );
    }

    public compileVSWorkspace() {
        this.startIfNotStarted().then( (succuess) => {
            var command = "";
            workspace.workspaceFolders.forEach( wf => {
                let path = wf.uri.fsPath.replace( /\\/g, "/" ) + "/";
                command += `compileAllBelow(CompileAllEnv("${path}"));`;
            });
            this.run( `{ use cm.runtime.util; ${command} }` );
        } );
    }
    
    public compileFile( file: string ) {
        this.clearOutputIfNeeded();
        this.diagnostics.clear();
        this.startIfNotStarted().then((success) => {
            this.compiler.compileFile( file );
        });    
    }

    public runStatement( statement: CodeStatement ): Thenable<boolean> {
        if ( !statement.start && !this.isStarted ) return;
        this.clearOutputIfNeeded( statement.doNotClear );
        return this.startIfNotStarted()
        .then( (success) => {
            var promise = new Promise<boolean>( (res, rej) => { 
                this.channel.addOutputWatch( 
                    res, 
                    rej, 
                    statement.successEx,
                    statement.failureEx );
                this.compiler.write( statement.code );
                setTimeout( () => {
                    this.channel.clearOutputWatch();
                }, 2000 ); // give CM 2 seconds to respond 
            });
            
            return promise;
        });
    }
    
    public runIfStarted( cmCode: string ) {
        this.clearOutputIfNeeded();
        this.diagnostics.clear();
        if ( this.isStarted ) {
            this.compiler.write( cmCode );
        }
    }

    public run( cmCode: string ) {
        this.clearOutputIfNeeded();
        this.diagnostics.clear();
        this.startIfNotStarted().then((success) => {
            this.compiler.write( cmCode );
        });
    }
    
    public runCurrentFile( file: string ) {
        if ( !file.endsWith("acloader.cm") ) this.clearOutputIfNeeded();
        this.diagnostics.clear();
        this.startIfNotStarted().then((success) => {
            this.compiler.runFile( file );
        });
    }
    
    public quitDebug() {
        if(!this.isStarted) return;
        
        this.compiler.quitDebug();
    }
    
    public goto( file: string, offset: number ): Thenable<vscode.Location> {
        return this.startIfNotStarted()
        .then( (success) => {
            var promise = this.channel.goToDefinitionPromise();
            file = file.replace( /\\/g, '/' ); // make sure we have the right slashses        
            this.compiler.write( `cm.runtime.refers("${file}", ${offset});` );
            return promise;    
        });

    }
    
    private startIfNotStarted() : Thenable<boolean> {
        if(this.isStarted) 
            return new Promise((resolve, reject) => { resolve(true); });
        
        return this.start();
    }

    private clearOutputIfNeeded( skip = false ) {
        if ( skip ) return;
        if ( cmConfig.clearOutputOnBuild() ) {
            this.channel.clear();
        }
    }


    public selectionToComment() {
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

    public titleComment() {
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

    public functionComment() {
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

    public emacsToVscodeTabs() {
        const vscode = require('vscode');
        const editor = vscode.window.activeTextEditor;
        editor.options.insertSpaces = true;
        editor.options.tabSize = 8;
        vscode.commands.executeCommand(`editor.action.indentationToSpaces`);
        editor.options.tabSize = 4;
        editor.options.insertSpaces = true;
    }
}

export interface CodeStatement {
    // should start compiler if not started
    start: boolean; 
    // code to execute
    code: string;
    // regex to match for "success"
    successEx: RegExp;
    // regex to match for "failure"
    failureEx: RegExp;
    // should clear output
    doNotClear: boolean;
}