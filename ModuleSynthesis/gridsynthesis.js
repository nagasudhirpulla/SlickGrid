//On page load...
var grid = {};
var sectionsArray;
var genName = "CGPL";
var comment = "userComment";
var genRamp;
var genDecCap;
var genOnBar;
var constituentNames = [];
var columns = {};
var options;
var pluginOptions;

$(function() {
    genRamp = 70;
    genDecCap = 1450;
    genOnBar = 1400;
    constituentNames = ["A", "B", "C", "D"];
    columns = setReqTableColumns(columns, true, true);
    grid = initialiseReqGrid("myGrid", genRamp, genDecCap, genOnBar, constituentNames, columns, options, pluginOptions, headerClick, "FULL", true, 0, true, 'Yes');
    //Populate the Constituent Options
    var selList = document.getElementById("selectReqConst");
    decorateSelectList(selList,constituentNames);
});
function initialiseReqGrid(tableID, genRamp, genDecCap, genOnBar, constituentNames, columns, options, pluginOptions, headerClick, defValue, isRSDPresent, defRSDValue, isURSPresent, defURSValue){
    console.log("Initialising the grid");
    //Set the whole grid to default values, rsd urs not included
    var data = [];
    for (var i = 0; i < 96; i++) {
        //Setting the data values of the grid here...
        //i is iterator for the row i or block i+1...
        var d = (data[i] = {});
        d["SNo"] = i + 1;
        d["rampNum"] = genRamp;
        d["DC"] = genDecCap;
        d["onBar"] = genOnBar;
        d["offBar"] = genDecCap - genOnBar;
        for (var j = 0; j < constituentNames.length; j++) {
            //j is iterator the column j ...
            //Setting the data value for the cell i,j(row,column) or block i+1,j
            d[j] = defValue;
            if(isRSDPresent) {
                d['RSD' + j] = defRSDValue;
            }
            if(isURSPresent) {
                d['URS' + j] = defURSValue;
            }
        }
        d["avail"] = 0;
        if (i > 0) {
            d["rampedVal"] = 0;
        }
        else{
            d["rampedVal"] = "NA";
        }
    }
    //Building the grid and configuring the grid
    grid = new Slick.Grid("#"+tableID, data, columns, options);
    grid.setSelectionModel(new Slick.CellSelectionModel());
    grid.registerPlugin(new Slick.AutoTooltips());
    //enabling the excel style functionality by the plugin
    grid.registerPlugin(new Slick.CellExternalCopyManager(pluginOptions));
    grid.onHeaderClick.subscribe(headerClick);
    //return multiple values from function --> http://stackoverflow.com/questions/2917175/return-multiple-values-in-javascript
    return grid;
}

function setReqTableColumns(columns, isRSDPresent, isURSPresent) {
    columns = [];
    columns.push({
        id: 'maxRamp',
        name: 'MaxRamp',
        field: 'rampNum',
        width: 30,
        toolTip: "Maximum Ramp",
        editor: Slick.Editors.Text}, {
        id: 'DC',
        name: 'DC',
        field: 'DC',
        width: 40,
        toolTip: "Declared Capacity",
        editor: Slick.Editors.Text}, {
        id: "offBarDC",
        name: "OffBarDC",
        field: "offBar",
        toolTip: "Offbar DC",
        width: 40}, {
        id: 'onBarDC',
        name: 'OnBarDC',
        field: 'onBar',
        width: 40,
        toolTip: "On Bar DC",
        editor: Slick.Editors.Text}, {
        id: "selector",
        name: "Block",
        field: "SNo",
        width: 50,
        toolTip: "Block Number"}, {
        id: "ramp",
        name: "Ramp",
        field: "rampedVal",
        width: 40,
        toolTip: "Ramp"}, {
        id: "availGen",
        name: "AvailableGeneration",
        field: "avail",
        width: 40,
        toolTip: "Available Generation"
    });
    //Adding Constituent Requisition columns iteratively
    for (var i = 0; i < constituentNames.length; i++) {
        columns.push({
            id: i,
            //name field is just for display
            name: constituentNames[i],
            //"field" is the field used by the program a particular cell in row
            field: i,
            width: 50,
            toolTip: constituentNames[i],
            editor: Slick.Editors.Text
        });
    }
    if(isRSDPresent) {
        for (var i = 0; i < constituentNames.length; i++) {
            columns.push({
                id: 'RSD' + i,
                //name field is just for display
                name: constituentNames[i] + 'RSD',
                //"field" is the field used by the program a particular cell in row
                field: 'RSD' + i,
                width: 65,
                toolTip: constituentNames[i] + 'RSD',
                editor: Slick.Editors.Text
            });
        }
    }
    if(isURSPresent) {
        for (var i = 0; i < constituentNames.length; i++) {
            columns.push({
                id: 'URS' + i,
                //name field is just for display
                name: constituentNames[i] + 'URS',
                //"field" is the field used by the program a particular cell in row
                field: 'URS' + i,
                width: 65,
                toolTip: constituentNames[i] + 'URS',
                editor: Slick.Editors.Text
            });
        }
    }
    return columns;
}

//Grid Utility Functions
function resetGrid(grid, constituentNames, defVal, isDecCapPresent, defDecCap, isOnBarPresent, defOnBar, isMaxRampPresent, defMaxRamp, isRSDPresent, defRSDValue, isURSPresent, defURSValue){
    var data = grid.getData();
    for (var i = 0; i < 96; i++) {
        var d = (data[i]);
        for (var j = 0; j < constituentNames.length; j++) {
            //Resetting the data values of the cell i,j(row,column) to val
            d[j] = defVal;
        }
    }
    if(isRSDPresent) {
        for (var i = 0; i < 96; i++) {
            //i is iterator for the row i ...
            d = (data[i]);
            for (var j = 0; j < constituentNames.length; j++) {
                //Resetting the data values of the cell i,j(row,column) to val
                d['RSD' + j] = defRSDValue;
            }
        }
    }
    if(isURSPresent) {
        for (var i = 0; i < 96; i++) {
            //i is iterator for the row i ...
            d = (data[i]);
            for (var j = 0; j < constituentNames.length; j++) {
                //Resetting the data values of the cell i,j(row,column) to val
                d['URS' + j] = defURSValue;
            }
        }
    }
    if(isDecCapPresent) {
        for (var i = 0; i < 96; i++) {
            //i is iterator for the row i ...
            (data[i])['DC'] = defDecCap;
        }
    }
    if(isOnBarPresent) {
        for (var i = 0; i < 96; i++) {
            (data[i])['onBar'] = defOnBar;
        }
    }
    if(isMaxRampPresent) {
        for (var i = 0; i < 96; i++) {
            (data[i])['rampNum'] = defMaxRamp;
        }
    }
    grid.invalidateAllRows();
    grid.render();
}

//Grid Utility Functions
function setGridCell(grid, rowNumber, columnID, value){
    //Note: Data not rendered from here, so render grid from outside
    //Note: rowNumber starts from 0 to 95, not 1 to 96.
    var data = grid.getData();
    (data[rowNumber])[columnID] = value;
}

//Grid Utility Functions
function feedSectionsToGrid(grid, sectionsArray){
    //first reset the grid;
    resetGrid(grid,constituentNames,"fu",true,"dec",true,'onb',true,'max',true,'rsd',true,'ur');
    //Feeding the normal shares
    var sectionsArrayKeys = getKeys(sectionsArray);
    for(var i=0;i<sectionsArrayKeys.length;i++){
        //i is the iterator for sectionsArray index
        var column = sectionsArrayKeys[i];
        var sections = sectionsArray[column];
        for(j=0;j<sections.length;j++){
            var sectionObject = sections[j];
            for(var k=sectionObject.secStart;k<=sectionObject.secEnd;k++){
                setGridCell(grid,k,column,sectionObject.val);
            }
        }
    }
    //Now invalidate and render the the grid
    grid.invalidateAllRows();
    grid.render();
}

//Grid Utility Functions
function getSectionsFromGrid(grid){
//Find the sections of the columns
    var data = grid.getData();
    var sectionsArray = [];
    var constCol;
    for (var constCol1 = 0; constCol1 < constituentNames.length + 3; constCol1++) {
        //Last three for onBarDC and MaxRamp and DC respectively
        switch (constCol1) {
            case constituentNames.length:
                constCol = "onBar";
                break;
            case constituentNames.length + 1:
                constCol = "rampNum";
                break;
            case constituentNames.length + 2:
                constCol = "DC";
                break;
            default:
                constCol = constCol1;
                break;
        }
        var sections = [];
        var sectionStart = 0;
        for (var blkNum = 1; blkNum <= 95; blkNum++) {
            if ((data[blkNum])[constCol] != (data[blkNum - 1])[constCol]) {
                sections.push({
                    'secStart': sectionStart,
                    'secEnd': blkNum - 1,
                    'val': (data[blkNum - 1])[constCol]
                });
                sectionStart = blkNum;
            }
        }
        sections.push({
            'secStart': sectionStart,
            'secEnd': 95,
            'val': (data[95])[constCol]
        });
        sectionsArray[constCol] = sections;
    }
    //URS Version
    for (constCol = 0; constCol < constituentNames.length; constCol++) {
        sections = [];
        sectionStart = 0;
        for (var blkNum = 1; blkNum <= 95; blkNum++) {
            if ((data[blkNum])['RSD' + constCol] != (data[blkNum - 1])['RSD' + constCol]) {
                sections.push({
                    'secStart': sectionStart,
                    'secEnd': blkNum - 1,
                    'val': (data[blkNum - 1])['RSD' + constCol]
                });
                sectionStart = blkNum;
            }
        }
        sections.push({
            'secStart': sectionStart,
            'secEnd': 95,
            'val': (data[95])['RSD' + constCol]
        });
        sectionsArray['RSD' + constCol] = sections;
    }
    //For URS option
    for (constCol = 0; constCol < constituentNames.length; constCol++) {
        sections = [];
        sectionStart = 0;
        for (var blkNum = 1; blkNum < 96; blkNum++) {
            if ((data[blkNum])['URS' + constCol] != (data[blkNum - 1])['URS' + constCol]) {
                sections.push({
                    'secStart': sectionStart,
                    'secEnd': blkNum - 1,
                    'val': (data[blkNum - 1])['URS' + constCol]
                });
                sectionStart = blkNum;
            }
        }
        sections.push({
            'secStart': sectionStart,
            'secEnd': 95,
            'val': (data[95])['URS' + constCol]
        });
        //sectionsArray.push(sections);
        sectionsArray['URS' + constCol] = sections;
    }
    //URS Version
    //TODO eliminate saving these in the sectionsArray
    //sectionsArray['genName'] = genName;
    //sectionsArray['comment'] = document.getElementById('commentInput').value;
    //sections of the columns found
    return sectionsArray;
}

//Common Utility Functions
function getKeys(obj){
    var keys = [];
    for(var key in obj){
        keys.push(key);
    }
    return keys;
}

//Grid Utility Functions
function validateGrid(grid) {
    var data = grid.getData();
    var alertComment = {};
    alertComment.str = "";
    //ToDo validate grid dynamically using on cellchange listener
    for (var i = 0; i < 96; i++) {
        //Validating the data values of the grid here...
        //i is iterator for the row i ...
        var d = (data[i]);
        var cellVal;
        var alertStr;
        var isValid;
        for (var j = 0; j < constituentNames.length; j++) {
            //Validating the data value for the cell i,j(row,column)
            cellVal = d[j];
            //Reset cell Color
            $(grid.getCellNode(i,grid.getColumnIndex(j))).removeClass("redError");
            //check if it is a number
            if (typeof cellVal == "number") {
                //No Validation required
            } else {
                isValid = cellVal.match(/^\d+(\.\d+)?\p$/i) || cellVal.match(/^\FULL$/i) || cellVal.match(/^[+]?\d+(\.\d+)?$/i);
                if (!isValid) {
                    alertAdd(alertComment, 'Invalid values at Block ' + (i + 1) + ' of the Constituent ' + constituentNames[j] + '.');
                    $(grid.getCellNode(i,grid.getColumnIndex(j))).addClass("redError");
                    //return false;
                } else {
                    //If valid then capitalize all letters.Design decision
                    d[j] = cellVal.toUpperCase();
                }
            }
            //URS Version
            cellVal = d["RSD" + j];
            //Reset cell Color
            $(grid.getCellNode(i,grid.getColumnIndex("RSD" + j))).removeClass("redError");
            if (typeof cellVal == "number") {

            } else {
                isValid = cellVal.match(/^\d+(\.\d+)?\p$/i) || cellVal.match(/^\FULL$/i) || cellVal.match(/^[+]?\d+(\.\d+)?$/i) || cellVal.match(/^\YES$/i);
                if (!isValid) {
                    alertAdd(alertComment, 'Invalid values at Block ' + (i + 1) + ' of the RSD of Constituent ' + constituentNames[j] + '.');
                    $(grid.getCellNode(i,grid.getColumnIndex("RSD" + j))).addClass("redError");
                    //return false;
                } else {
                    //if valid then capitalize all letters.Design decision
                    d["RSD" + j] = cellVal.toUpperCase();
                }
            }
            cellVal = d["URS" + j];
            //Reset cell Color
            $(grid.getCellNode(i,grid.getColumnIndex("URS" + j))).removeClass("redError");
            if (typeof cellVal == "number") {
                /*
                if (cellVal == 0) {
                    d["URS" + j] = "No";
                } else{
                    d["URS" + j] = "Yes";
                }
                */
            } else {
                isValid = cellVal.match(/^\LEFTOVER$/i) || cellVal.match(/^[+]?\d+(\.\d+)?$/i) || cellVal.match(/^\YES$/i);
                if (!isValid) {
                    alertAdd(alertComment, 'Invalid values at Block ' + (i + 1) + ' of the URS of Constituent ' + constituentNames[j] + '.');
                    $(grid.getCellNode(i,grid.getColumnIndex("URS" + j))).addClass("redError");
                    //return false;
                } else {
                    //if valid then capitalize all letters.Design decision
                    d["URS" + j] = cellVal.toUpperCase();
                }
            }
            //URS Version
        }
        //Validating MaxRamps and onBarDC
        for (var j = 0; j < 3; j++) {
            //Validating the data value for the cell i,j(row,column)
            var colStr;
            switch (j) {
                case 0:
                    colStr = 'onBar';
                    alertStr = 'Invalid values at Block ' + (i + 1) + ' of OnBarDC grid column';
                    break;
                case 1:
                    colStr = 'rampNum';
                    alertStr = 'Invalid values at Block ' + (i + 1) + ' of MaxRamp grid column';
                    break;
                case 2:
                    colStr = 'DC';
                    alertStr = 'Invalid values at Block ' + (i + 1) + ' of DC grid column';
                    break;
            }
            cellVal = d[colStr];
            //Reset Cell Color
            $(grid.getCellNode(i,grid.getColumnIndex(colStr))).removeClass("redError");
            //check if it is a number
            if (typeof cellVal == "number") {
                //No Validation required
            } else {
                isValid = cellVal.match(/^[+]?\d+(\.\d+)?$/i);
                if (!isValid) {
                    alertAdd(alertComment, alertStr);
                    $(grid.getCellNode(i,grid.getColumnIndex(colStr))).addClass("redError");
                    //return false;
                } else {
                    d[colStr] = cellVal;
                }
            }
        }
    }
    if(alertComment.str.length != 0){
        grid.render();
        alert(alertComment.str+'Invalid values are not allowed');
        return false;
    }
    return true;
}

//Common Utility Functions
function alertAdd(alertComment, alertStr){
    alertComment.str += alertStr;
    alertComment.str += '\n\n';
}

//Grid Utility Functions
function isSlickGridObject(grid){
    if(grid == null){
        console.log("Unable to validate grid because grid is null");
        return false;
    }else if(typeof(grid) != "object"){
        console.log("Unexpected grid data type");
        return false;
    } else if(grid.hasOwnProperty("getData")){
        console.log("Not a Slick grid Object");
        return false;
    }
    return true;
}

//Extra Grid features
function headerClick(e, args) {
    var colInd = args.grid.getColumnIndex(args.column.id);
    args.grid.getSelectionModel().setSelectedRanges([new Slick.Range(0,colInd,95,colInd)]);
    //console.log(columnID);
}
//Extra Grid features
pluginOptions = {
    clipboardCommandHandler: function(editCommand) {
        undoRedoBuffer.queueAndExecuteCommand.call(undoRedoBuffer, editCommand);
    },
    includeHeaderWhenCopying: false
};
//Extra Grid features
options = {
    editable: true,
    enableAddRow: false,
    enableCellNavigation: true,
    asyncEditorLoading: false,
    autoEdit: false
};
//Extra Grid features
var undoRedoBuffer = {
    commandQueue: [],
    commandCtr: 0,
    queueAndExecuteCommand: function(editCommand) {
        this.commandQueue[this.commandCtr] = editCommand;
        this.commandCtr++;
        editCommand.execute();
    },
    undo: function() {
        if (this.commandCtr == 0)
            return;

        this.commandCtr--;
        var command = this.commandQueue[this.commandCtr];

        if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
            command.undo();
        }
    },
    redo: function() {
        if (this.commandCtr >= this.commandQueue.length)
            return;
        var command = this.commandQueue[this.commandCtr];
        this.commandCtr++;
        if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
            command.execute();
        }
    }
};
//Extra Grid features undo shortcut
$(document).keydown(function(e) {
    if (e.which == 90 && (e.ctrlKey || e.metaKey)) { // CTRL + (shift) + Z
        if (e.shiftKey) {
            undoRedoBuffer.redo();
        } else {
            undoRedoBuffer.undo();
        }
    }
});

//UI Layer Layer Testing Functions
function onResetClick(){
    resetGrid(grid,constituentNames,"fu",true,"dec",true,'onb',true,'max',true,'rsd',true,'ur');
}

//UI Layer Layer Testing Functions
function onSetGridSectionsClick(){
    feedSectionsToGrid(grid,sectionsArray);
}

//UI Layer Layer Testing Functions
function onGetGridSectionsClick(){
    if(validateGrid(grid)) {
        sectionsArray = getSectionsFromGrid(grid);
    }
}

//UI Layer Layer Testing Functions
function onValidateGridClick(){
    var isGridValid = validateGrid(grid);
}

//UI Layer Layer Testing Functions
function onCreateSummaryFromSectionsClick(){
    createSectionSummaryTable("summTab", sectionsArray);
}

//UI Layer Layer Testing Functions
function onGetRowsFromSectionsClick(){
    getRowsFromSections(sectionsArray, constituentNames, "reqInputTable");
}

//UI Layer Layer Testing Functions
function onGetSectionsFromRowsClick(){
    var isReqTableValid = validateReqTable("reqInputTable");
    if(isReqTableValid) {
        var tableSectionsArray = getSectionsFromRows(constituentNames, "reqInputTable", "FULL", 0, genDecCap, genOnBar, genRamp, 0);
    }
}

//UI Layer Layer Testing Functions
function onValidateReqTableClick(){
    var isReqTableValid = validateReqTable("reqInputTable");
}