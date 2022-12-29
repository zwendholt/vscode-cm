'use strict';

import { cmCompilerAdapter } from './cmCompilerAdapter';
import { cmConfig } from './cmConfig';
import * as vscode from 'vscode';
import {exec} from 'child_process';

const fs = require('fs');
var didLoadScripts = false;
var scriptPackage = "";
var scriptFuncs: string[] = [];
var ofsExtensions: Promise<string[]> = getAllOfsExtensions();

import { commands, Disposable, Position, Range, Selection, TextDocument, TextEditor, Uri, window, workspace, TextEditorRevealType } from 'vscode';
import { stderr } from 'process';



export function registerCommands( compiler: cmCompilerAdapter ) {
    let d1 = commands.registerCommand( "cm.start", () => compiler.start() );
    let d2 = commands.registerCommand( "cm.stopcm", () => compiler.stop() );
    let d3 = commands.registerCommand( "cm.cleancm", () => compiler.clean() );
    let d4 = commands.registerCommand( "cm.startcet", () => compiler.run( `run("cet.runtime","designer.cm");`) );
    let d5 = commands.registerCommand( "cm.quitdebug", () => compiler.quitDebug() );
    
    let d6 = commands.registerCommand( "cm.runline", () => {
        validateCMFileAndRun( true, (editor) => {
            var text = editor.document.lineAt( editor.selection.active.line ).text.trim();
            compiler.run( text );
        } );
    } );
    
    let d7 = commands.registerCommand( "cm.runcurrentfile", (args) => {
        validateCMFileAndRun( true, (editor) => {
            compiler.runCurrentFile( editor.document.fileName );
        } );
    } );
    
    let d8 = commands.registerCommand( "cm.compilefile", (args) => {
        if ( args && args.file ) {
            compiler.compileFile( args.file );
        } else {
            validateCMFileAndRun( true, (editor) => {
                compiler.compileFile( editor.document.fileName );
            });
        }
        
    } );
    
    let d9 = commands.registerCommand( "cm.compilepackage", () => {
        validateCMFileAndRun( true, (editor) => {
            compiler.compileFile( editor.document.fileName );
        });
    } );
    
    let d10 = commands.registerCommand( "cm.loadall", () => {
        validateCMFileAndRun( true, (editor) => {
            editor.document.save();
            compiler.loadAllKnown( editor.document.fileName );
        } );
    } );
    
    let d11 = commands.registerCommand( "cm.profileboot", () => {
        validateCMFileAndRun( false, (editor) => {
            workspace.openTextDocument( getFilePathInUserProfile("boot.cm") )
            .then( (doc) => {
                window.showTextDocument( doc );
            });
        } );
    } );
    
    let d12 = commands.registerCommand( "cm.compileallbelow", () => {
        compiler.compileVSWorkspace();
    } );

    let d30 = commands.registerCommand( "cm.compileworkspace", () => {
        compiler.compileWorkspace();
    })
   
    let d14 = commands.registerCommand( "cm.runexternal", (args) => {
        // this is a hook for anything to run CM Commands via "commands.executeCommand(...)"
        if ( typeof args == "string" ) {
            compiler.run( args );
        }
    } )
    
    let d15 = commands.registerCommand( "cm.startwriteoutputfile", () => {
        compiler.startWritingOutputFile();
    });
    
    let d16 = commands.registerCommand( "cm.stopwriteoutputfile", () => {
        compiler.stopWritingOutputFile();
    });
   
    let scripts = commands.registerCommand( "cm.userScript", () => {
        window.showQuickPick( getUserScripts() )
        .then( (picked) => {
            if ( picked ) {
                let match = /([a-zA-Z0-9]*)\s\((.*)\)/.exec(picked);
                if ( match ) {
                    compiler.run( `{ use ${match[2]}; ${match[1]}();}` );
                }
            }
        }, (err) => {
            console.log("ooo crap");
        } );
    });

    let d19 = commands.registerCommand('extension.openFile', file => {
        workspace.openTextDocument( file ).then( doc => { window.showTextDocument( doc, { preserveFocus: true, preview: true } ); } );
    });

    let d20 = commands.registerCommand( "cm.implements", () => {
        validateCMFileAndRun( true, (editor) => {
            const offset = getPosition(editor);
            compiler.run( `cm.runtime.implementsMethod("${editor.document.fileName.replace( /\\/g, '/' )}", ${offset});` );
        } );
    } );

    let d21 = commands.registerCommand( "cm.subclasses", () => {
        validateCMFileAndRun( true, (editor) => {
            const offset = getPosition(editor);
            compiler.run( `cm.runtime.subClasses("${editor.document.fileName.replace( /\\/g, '/' )}", [${offset},${offset}], 4);` );
        })
    });

    let d22 = commands.registerCommand( "cm.overrides", () => {
        validateCMFileAndRun( true, (editor) => {
            const offset = getPosition(editor);
            compiler.run( `cm.runtime.overridesMethod("${editor.document.fileName.replace( /\\/g, '/' )}", ${offset});` );
        })
    });

    let d25 = commands.registerCommand( "cm.profiletest", () => {
        validateCMFileAndRun( false, (editor) => {
            workspace.openTextDocument( getFilePathInUserProfile("t.cm") )
            .then( (doc) => {
                window.showTextDocument( doc );
            });
        } );
    } );

    let selectionToComment = commands.registerCommand( "cm.commentSelection", () => {
        compiler.selectionToComment();
    });

    let addTitleComment = commands.registerCommand("cm.titleComment", () => {
        compiler.titleComment();
    });

    let addFunctionComment = commands.registerCommand("cm.functionComment", () => {
        compiler.functionComment();
    });

    let emacsToVscodeTab = commands.registerCommand("cm.emacsToVscodeTab", () => {
        compiler.emacsToVscodeTabs();
    });

    let increaseVersion = commands.registerCommand("cm.increaseVersion",() => {
        increaseVersionCall(compiler);
    } );
    
    let buildRelease = commands.registerCommand("cm.buildRelease", () => {
        buildReleaseCall(compiler);
    } );

    let uploadExtensionCommand = commands.registerCommand("cm.uploadExtension", () => {
        uploadExtension(compiler);
    });

    let openBuildCentralGUICommand = commands.registerCommand("cm.openBuildCentralGUI", () => {
        openBuildCentralGUI(compiler);
    });

    return Disposable.from( d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d14, d15, d16, scripts, d20, d21, d22, selectionToComment, addTitleComment, addFunctionComment, emacsToVscodeTab, increaseVersion, buildRelease, uploadExtensionCommand, openBuildCentralGUICommand);
}
    
    let d99 = commands.registerCommand( "cm.Test", () => {
        console.log("I DID IT");
    } );

function getPosition( editor: TextEditor ): Number {
    const position = editor.selection.start;
    let offset = editor.document.offsetAt( position ) + ( 1 - position.line ); // emacs is 1 based, and it treats line end as 1 character not 2;
    return offset;
}


function increaseVersionCall(compiler:cmCompilerAdapter) {
    compiler.writeStringToOutput("\nStarting Version Increase Process\n");

    //! lets make a text input box that users will use to enter the version that they want. 
    //! figure out a way to actually do some kind of verification on what they are entering in this box. 
    //! IE make sure it fits the version format. if it doesn't just call this thing again. 

    //!version increase text box for users to set the version (vscode)

    //!add a button that shows up after a release has been released. essentially ask the users if they would like to make another release,
    //!if they say yes, just call the same function again. (this is useful for how we release 2 builds, one with impulse, and another without.


    var child = exec('cop setversions version=nextRevision', { cwd: vscode.workspace.rootPath },(error, stdout, stderr) => {
      if (error) {
        compiler.writeStringToOutput(`error increasing version : ${error}`);
        return;
      }

      compiler.writeStringToOutput("\nFinished Version Increase Process");
    });

    child.stdout.on('data', data => compiler.writeStringToOutput(data));
    child.stderr.on('data', data => compiler.writeStringToOutput(data));

}


function openBuildCentralGUI(compiler:cmCompilerAdapter) {
    compiler.writeStringToOutput("\nOpening the Build Central GUI\n");
    var child = exec('cop gui build', {cwd: vscode.workspace.rootPath}, (error, stdout, stderr) => {
        if (error) {
            compiler.writeStringToOutput(`Error Opening BuildCenter :  ${error}`);
            return;
        }
        compiler.writeStringToOutput("\nOpen GUI Command Passed");
    });

    child.stdout.on('data', data => compiler.writeStringToOutput(data));
    child.stderr.on('data', data => compiler.writeStringToOutput(data));
}


function buildReleaseCall(compiler:cmCompilerAdapter) {
    compiler.writeStringToOutput("\nStarting The Build Release Process\n\n");
    var child = exec('cop clean', { cwd: vscode.workspace.rootPath },(error, stdout, stderr) => {
      if (error) {
        compiler.writeStringToOutput(`error when trying to clean : ${error}`);
        return;
      }
      ofsExtensions = getAllOfsExtensions();
      compiler.writeStringToOutput("\n\nStarting Repair Process\n\n");
      buildRepair(compiler);
    });

    child.stdout.on('data', data => compiler.writeStringToOutput(data));
    child.stderr.on('data', data => compiler.writeStringToOutput(data));
}


function buildRepair(compiler:cmCompilerAdapter) {

    var child = exec('cop repair', { cwd: vscode.workspace.rootPath },(error, stdout, stderr) => {

      if (error) {
        compiler.writeStringToOutput(`error when trying to repair : ${error}`);
        return;
      }
      compiler.writeStringToOutput("\n\nStarting build process\n\n");
      buildExtension(compiler);
    });
    child.stdout.on('data', data => compiler.writeStringToOutput(data));
    child.stderr.on('data', data => compiler.writeStringToOutput(data));
}


function buildExtension(compiler:cmCompilerAdapter) {
    
    var child = exec('cop make [ofs]', { cwd: vscode.workspace.rootPath },(error, stdout, stderr) => {
        if (error) {
            compiler.writeStringToOutput(`error when trying to make the extensions : ${error}`);
            return;
        }
        compiler.writeStringToOutput("\n\nFinished making build");

        vscode.window.showInformationMessage("Do you want to release the build?", "Yes", "No").then((selection) => {
            if (selection === "Yes") {
                uploadExtension(compiler);
            } else {                
                return;
            }
        });
    });
    child.stdout.on('data', data => compiler.writeStringToOutput(data));
    child.stderr.on('data', data => compiler.writeStringToOutput(data));
}


async function uploadExtension(compiler:cmCompilerAdapter) {
    compiler.writeStringToOutput("\n\nStarting Upload Process\n\n");


    //! might want to look into actually updating this as well. 
    const options: Promise<string[]> = ofsExtensions;
    
    // Let the user select the extensions that they want to release for this build.
    const selectedExtensions = await vscode.window.showQuickPick(options, {
        placeHolder: "Hello. Please select the extensions that you want to release.",
        canPickMany: true
    }).then(selection => {

        // Enter the name of the build.
        vscode.window.showInputBox(
        {
            placeHolder: "Please Enter a name for the release."
        }
        ).then(extensionName => {
            var extensionString = extensionUploadStringFormatter(selection);
            var child = exec(`cop upload ${extensionString} --uploadname=[${extensionName}]`, { cwd: vscode.workspace.rootPath },(error, stdout, stderr) => {
                if (error) {
                    compiler.writeStringToOutput(`error when trying to make the extensions : ${error}`);
                    return;
                }
                compiler.writeStringToOutput("\n\nFinished making build");

                //! would you like to make another release?
                vscode.window.showInformationMessage("Would you like to release another version of the extension?", "Yes", "No").then((selection) => {
                    if (selection === "Yes") {
                        uploadExtension(compiler);
                    } else {                
                        return;
                    }
                });
            });
            child.stdout.on('data', data => compiler.writeStringToOutput(data));
            child.stderr.on('data', data => compiler.writeStringToOutput(data));
        });
    }) ;
}


function extensionUploadStringFormatter(extensionArray: string[]) :string {
    var outputString = "";
    for (const extension in extensionArray) {
        outputString += (extensionArray[extension] + " ");
    }    
    return outputString;
}


function asyncExtensionCollection(): Promise<string> {
    return new Promise(async(resolve, rejects) => {
        try {
            const child = exec('cop list extensions', {cwd: vscode.workspace.rootPath}, (error, stdout, stderr) => {
                
                if (error) {
                    console.log("woopsy");
                    return;
                }
                if (stdout.length === 0) {
                    rejects("I didn't find anything for the extension");
                } else {
                    resolve(stdout); 
                }
                        
            });
        } catch(err) {}
    });

}


//! if we decide to make a merge for this, change it to use just "custom."  instead of custom.ofs.
async function getAllOfsExtensions() : Promise<string[]> {

    let matches:string[] = [];
    //! If we decide to make a merge on this. 
    const ofsRegex = new RegExp("\\bcustom\\.ofs\\.\\w*\\b", "g");

    
    return new Promise(async (resolve, reject) => {
        try {
            await asyncExtensionCollection().then(result => {                
                for (let match of result.matchAll(ofsRegex)){            
                    matches.push(match[0]);
                }
                if (matches.length === 0) {
                    reject("couldn't find any extensions");
                } else {
                    resolve(matches);
                }
            });
        }
        catch(err) {
            reject("couldn't find any extensions");
        }
        
    });
}


function getUserScripts(): Thenable<string[]> {
    if ( scriptFuncs.length > 0 ) {
        return Promise.resolve(scriptFuncs);
    }
    return new Promise((resolve, reject) => {
        workspace.workspaceFolders.forEach( wf => {
            try {
                let data = fs.readFileSync( wf.uri.fsPath + "/vscode.scripts.cm", "utf8" );
                let myReg = /public\s+void\s+(.[^\(\)]*)\s*\(\)/g;
                let packageReg = /package\s(.[^;]*);/;
                scriptPackage = packageReg.exec( data )[1];
                var myArr;
                var myFuncs = [];
                while ( ( myArr = myReg.exec(data) ) !== null ) {
                    scriptFuncs.push(`${myArr[1]} (${scriptPackage})`);
                }
            } catch (err) {
                // couldn't find the scripts file
            }
        });

        if ( scriptFuncs.length == 0 ) {
            reject("No User Scripts Found");
        } else {
            didLoadScripts = true;
            resolve(scriptFuncs);
        }
    });
}

export function foldCopyright( editor: TextEditor ) {
    if ( editor.document.uri.fsPath.endsWith( ".cm" ) ) {
        return commands.executeCommand( "editor.fold", { "selectionLines": [0] } )
        .then( (val) => { 
            editor.revealRange( editor.selection, TextEditorRevealType.InCenterIfOutsideViewport );
        }, 
        (err) => {
            // console.log(err);
        });
    }
}

function validateCMFileAndRun( requireCMFile: boolean, func: ( editor: TextEditor ) => void ): void {
    const editor = window.activeTextEditor;
    if ( requireCMFile ) {
        if ( !editor ) return;
        editor.document.save();
        if ( editor.document.languageId != "cm" ) return;
    }
    func( editor );
}

function getFilePathInUserProfile( file: string ): Uri {
    const userName = process.env["USER"] || process.env["USERNAME"];
    if ( !userName ) {
        window.showErrorMessage( "Unable to retrieve username");
        return;
    }
    return Uri.file( `${cmConfig.cmRoot()}\\personal\\profile\\${userName.toLowerCase()}\\${file}` );
}