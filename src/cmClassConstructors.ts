'use strict';

import vscode = require('vscode');
import { foldCopyright } from './commands';


export function getSnapperClassSkeleton() : string {
    var res =  
`
public class {Class} { 

    /***********************************************************************
     * Construction
     ***********************************************************************/

    /**
     * Constructor.
     */
    public constructor() {
        super(..);
    }


    /**
     * Pre data initialize.
     */
    public void preDataInitialize() {
        super(..);
    }


    /**
     * Post data initialize.
     */
    public void postDataInitialize() { 
        super(..);
    }


    /***********************************************************************
     * Data
     ***********************************************************************/
    
    /**
     * Part number.
     */
    public str partNumber(str dataKey=cMainData) { 
        return "";
    }

    /***********************************************************************
     * Domains
     ***********************************************************************/

    /**
     * Width domain.
     */
    public SubSet widthDomain(bool nominal=false) {
        return DoubleEnum(1inch);
    }


    /**
     * Depth domain.
     */
    public SubSet depthDomain(bool nominal=false) {
        return DoubleEnum(1inch);
    }


    /**
     * Height domain.
     */
    public SubSet heightDomain(bool nominal=false) {  
        return DoubleEnum(1inch);
    }


    /***********************************************************************
     * Graphics
     ***********************************************************************/

    /**
     * Graphics rotation.
     */
    public orientation graphicsRot() {
        return orientation();
    }


    /**
     * Graphics offset.
     */
    public point graphicsOffset() {
        return point0;
    }
}`;
    return res;
}


export function getMigrationClassSkeleton() : string {
    var res = 
`
public class {Class} extends OfsDataMigrator {

    private str{} partNumbersToMigrate = {""};
    
    /**
     * Constructor.
     */
    public constructor() {}


    /**
     * Migrate data.
     */
    public bool migrateData(DsPData data) {
        if (data.partNumber() in partNumbersToMigrate) {
            return true;
        }
        return false;
    }
}`;
    return res;
}


export function getDefaultClassSkeleton() : string {
    var res = 
`
public class {Class} { 
    public constructor() { 
    
    }    
}`;
    return res;
}


export function chooseSkeletonCodeType(uri, editor, nameSpace, doc, copy) {

    let classSubString = uri.path.substring( uri.path.lastIndexOf( '/' ) + 1, uri.path.lastIndexOf( '.' ) );
    classSubString = classSubString.charAt(0).toUpperCase() + classSubString.slice(1);

    vscode.window.showInformationMessage("Choose a skeleton code type", {modal: true},"Snapper", "Migration", "Default").then((selection) => {
        editor.edit( (edit) => {
            edit.insert( new vscode.Position( 0, 0 ), copy.replace( "{Package}", nameSpace ));

            var snapperConstructor;
            if (selection === "Snapper") {
                snapperConstructor = getSnapperClassSkeleton();   
            } else if (selection === "Migration") {
                snapperConstructor = getMigrationClassSkeleton();
            } else {
                snapperConstructor = getDefaultClassSkeleton();
            }
                                
            snapperConstructor = snapperConstructor.replace("{Class}", classSubString);
            edit.insert(new vscode.Position(100, 100), snapperConstructor);
            
        } );
    }).then( (res) => {
        const fileStart = new vscode.Position( 0, 0 );
        editor.selection = new vscode.Selection(fileStart, fileStart);        
    })
    .then( (res) => {
        const newPosition = new vscode.Position( 39, 4 );
        const newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
        
        editor.revealRange( editor.selection, vscode.TextEditorRevealType.InCenter );
        foldCopyright(editor);
        doc.save();  
    });  
}


export function defaultSkeletonCode(uri, editor, nameSpace, doc, copy) {

    let classSubString = uri.path.substring( uri.path.lastIndexOf( '/' ) + 1, uri.path.lastIndexOf( '.' ) );
    classSubString = classSubString.charAt(0).toUpperCase() + classSubString.slice(1);

        editor.edit( (edit) => {
        edit.insert( new vscode.Position( 0, 0 ), copy.replace( "{Package}", nameSpace ));
        var snapperConstructor = getDefaultClassSkeleton();                       
                        
        snapperConstructor = snapperConstructor.replace("{Class}", classSubString);
        edit.insert(new vscode.Position(100, 100), snapperConstructor);
            
        } ).then( (res) => {
        const fileStart = new vscode.Position( 0, 0 );
        editor.selection = new vscode.Selection(fileStart, fileStart);
    })
        
    .then( (res) => {
        const newPosition = new vscode.Position( 39, 4 );
        const newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
        
        editor.revealRange( editor.selection, vscode.TextEditorRevealType.InCenter );
        foldCopyright(editor);
        doc.save();  
                
            // });
    });   
}