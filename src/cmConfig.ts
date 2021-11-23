'use strict';

import vscode = require('vscode');
import { getCompiler } from './extension';
import fs = require('fs');
import path = require('path');
import { IColorData } from './cmOutputHandler';

export class cmConfig {
    
    static LangName = "cm";
    static root: string = null;
    
    static isDebug(): boolean {
        return this.getConfig()["debugMode"];
    }

    static terminalColors() : IColorData[] {
        let data: IColorData[] = [];
        let rawData = this.getConfig()["terminalColors"];

        for( let c of rawData ) {
            if ( isColorData( c ) ) {
                data.push( c );
            }
        }

        return data;
    }

    static currentWorkspace(): Thenable<string> {
        if ( vscode.workspace.workspaceFolders ) {
            if ( vscode.workspace.workspaceFolders.length == 1 ) {
                let path = vscode.workspace.workspaceFolders[0].uri.fsPath;
                return Promise.resolve(path);
            } else {
                return vscode.window.showWorkspaceFolderPick()
                .then( choice => {
                    return choice.uri.fsPath;
                } );
                
                // return vscode.workspace.workspaceFolders[0].uri.path;
            }
        } else {
            return Promise.resolve(vscode.workspace.rootPath);
        }
    }

    static clearOutputOnBuild(): boolean {
        let isEnabled = this.getConfig()["clearOutputBuild"]; 
        if ( typeof isEnabled !== "boolean" ) {
            isEnabled = false;
        }
        return isEnabled;
    }

    static cmRoot(): string {
        if ( !this.root ) {
            // this needs to be a bit smarter, but for now we use the first folder
            const match = vscode.workspace.workspaceFolders[0].uri.fsPath.match( /.*(?=\\home\\|\\base\\|\\extensions\\|\\personal\\)/ );
            this.root = this.getConfig()["root"];
            if ( this.root == "auto" && match && match.length > 0 ) {
                console.log("CM Root Auto Mode - Using Path '" + match.toString() + "'");
                this.root = match.toString();
            }
        }
        return this.root;
    }

    static cmPath(): string {
        return this.cmRoot() + "\\base";
    }

    static arch(): string {
        return "win64";
    }

    static rsWatcherEnabled(): Boolean {
        return this.getConfig()["rsSaveWatch"];
    }

    static useNewSyntax(): Boolean {
        let useNewSyntax = this.getConfig()["newSyntax"]; 
        if ( typeof useNewSyntax !== "boolean" ) {
            useNewSyntax = false;
        }
        return useNewSyntax;
    }

    private static getConfig() {
        return vscode.workspace.getConfiguration(this.LangName);
    }
}

function isColorData( arg: any ) : arg is IColorData {
    return arg && 
            arg.name && typeof(arg.name) == 'string' && 
            arg.hasOwnProperty("r") && typeof(arg.r) == 'number' && 
            arg.hasOwnProperty("b") && typeof(arg.g) == 'number' && 
            arg.hasOwnProperty("g") && typeof(arg.b) == 'number';
}