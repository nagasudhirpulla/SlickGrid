//TODO add a headerdouble click to quickfill feature
//TODO add a prompting platform like boothead
//TODO add a growl like card notifications platform like pnotify or gritter
//TODo add slider of slider buttons for grid on mobile devices
//TODO follow the guidelines in the ppt to modify the format of grid columns and sectionsArray
var grid = {};
var implementedGrid = {};
var desiredGrid = {};
var sectionsArray;
var sectionsArrayImplemented;
var genNames = [];
var genIDs = [];
var genName = "CGPL";
var genID = 23;
var comment = "userComment";
var genRamp;
var genDecCap;
var genOnBar;
var percentageData = createArray(96,1);
var constituentNames = [];
var constituentIDs = [];
var columns = {};
var options;
var pluginOptions;

//On page load
$(function() {
    datePickerInitialise();
    genRamp = 70;
    genDecCap = 1450;
    genOnBar = 1400;
    constituentNames = ["A", "B", "C", "D"];
    constituentIDs = [1, 2, 3, 4];
    columns = setReqTableColumns(true, true, true);
    grid = initialiseReqGrid("myGrid", genRamp, genDecCap, genOnBar, constituentNames, constituentIDs, columns, options, pluginOptions, headerClick, "FULL", true, 0, true, 'YES', true, 0);
    //Populate the Constituent Options
    var selList = document.getElementById("selectReqConst");
    decorateSelectList(selList,constituentNames);
    //make the columns un editable
    var unEditableColumns  = makeColumnsUneditable(columns);
    //initialise the desired numeric schedule grid
    desiredGrid = initialiseReqGrid("desiredGrid", genRamp, genDecCap, genOnBar, constituentNames, constituentIDs, unEditableColumns, options, pluginOptions, headerClick, "FULL", true, 0, true, 'YES', true, 0);
    //initialise the implemented schedule grid
    implementedGrid = initialiseReqGrid("implementedGrid", genRamp, genDecCap, genOnBar, constituentNames, constituentIDs, columns, options, pluginOptions, headerClick, "FULL", true, 0, true, 'YES', true, 0);
    constituentNamesFetch();
});

//Grid Utility Functions - new Column Format not needed
function makeColumnsUneditable(columns) {
    //Cloning the object Array
    var tempArray = JSON.parse(JSON.stringify(columns));
    for(var i=0;i<tempArray.length;i++){
        delete tempArray[i]['editor'];
    }
    return tempArray;
}

//Grid Utility Functions - Used new Column Format
function initialiseReqGrid(tableID, genRamp, genDecCap, genOnBar, constituentNames, constituentIDs, columns, options, pluginOptions, headerClick, defValue, isRSDPresent, defRSDValue, isURSPresent, defURSValue, isMTOAPresent, defMTOAVal){
    var gridStr = "grid";
    switch(tableID){
        case "myGrid":
            gridStr = "Requisition grid";
            break;
        case "desiredGrid":
            gridStr = "Desired Numeric Requisition grid";
            break;
        case "implementedGrid":
            gridStr = "Implemented revision grid";
            break;
    }
    console.log("Initialising the " + gridStr);
    //Set the whole grid to default values, rsd urs not included
    var data = [];
    for (var i = 0; i < 96; i++) {
        //Setting the data values of the grid here...
        //i is iterator for the row i or block i+1...
        var d = (data[i] = {});
        //id property for external overlay plugin
        d["id"] = i;
        d["block"] = i + 1;
        d["maxRamp"] = genRamp;
        d["dc"] = genDecCap;
        d["onBar"] = genOnBar;
        d["offBar"] = genDecCap - genOnBar;
        if(isMTOAPresent){
            d["mtoa"] = defMTOAVal;
        }
        for (var j = 0; j < constituentNames.length; j++) {
            //j is iterator the column j ...
            //Setting the data value for the cell i,j(row,column) or block i+1,j
            d[constituentIDs[j]+"_"+"Normal"] = defValue;
            if(isRSDPresent) {
                d[constituentIDs[j]+"_"+"RSD"] = defRSDValue;
            }
            if(isURSPresent) {
                d[constituentIDs[j]+"_"+"URS"] = defURSValue;
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
    var grid = new Slick.Grid("#"+tableID, data, columns, options);
    grid.setSelectionModel(new Slick.CellSelectionModel());
    grid.registerPlugin(new Slick.AutoTooltips());
    //enabling the excel style functionality by the plugin
    grid.registerPlugin(new Slick.CellExternalCopyManager(pluginOptions));
    // Need to use a DataView for the filler plugin
    var dataView = new Slick.Data.DataView();
    dataView.onRowCountChanged.subscribe(function (e, args) {
        grid.updateRowCount();
        grid.render();
    });
    dataView.onRowsChanged.subscribe(function (e, args) {
        grid.invalidateRows(args.rows);
        grid.render();
    });
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();
    var overlayPlugin = new Ext.Plugins.Overlays({});
    // Event fires when a range is selected
    overlayPlugin.onFillUpDown.subscribe(function (e, args) {
        var column = grid.getColumns()[args.range.fromCell];
        // Ensure the column is editable
        if (!column.editor) {
            return;
        }
        // Find the initial value
        var value = dataView.getItem(args.range.fromRow)[column.field];
        dataView.beginUpdate();
        // Copy the value down
        for (var i = args.range.fromRow + 1; i <= args.range.toRow; i++) {
            dataView.getItem(i)[column.field] = value;
            grid.invalidateRow(i);
        }
        dataView.endUpdate();
        grid.render();
    });
    grid.registerPlugin(overlayPlugin);
    grid.onHeaderClick.subscribe(headerClick);
    //return multiple values from function --> http://stackoverflow.com/questions/2917175/return-multiple-values-in-javascript
    return grid;
}

//Grid Utility Functions - Used new Column Format
function setReqTableColumns(isRSDPresent, isURSPresent, isMTOAPresent) {
    var columns = [];
    columns.push({
        id: 'maxRamp',
        name: 'MaxRamp',
        field: 'maxRamp',
        category: 'MaxRamp',
        columnKey: null,
        width: 30,
        toolTip: "Maximum Ramp",
        editor: Slick.Editors.Text}, {
        id: 'dc',
        name: 'DC',
        field: 'dc',
        category: 'DC',
        columnKey: null,
        width: 40,
        toolTip: "Declared Capacity",
        editor: Slick.Editors.Text}, {
        id: "offBar",
        name: "OffBarDC",
        field: "offBar",
        category: 'OffBarDC',
        columnKey: null,
        width: 40,
        toolTip: "OffBar DC"}, {
        id: 'onBar',
        name: 'OnBarDC',
        field: 'onBar',
        category: 'OnBarDC',
        columnKey: null,
        width: 40,
        toolTip: "OnBar DC",
        editor: Slick.Editors.Text}, {
        id: "selector",
        name: "Block",
        field: "block",
        category: 'Block',
        columnKey: null,
        width: 50,
        toolTip: "Block Number"}, {
        id: "rampedVal",
        name: "Ramp",
        field: "rampedVal",
        category: 'Ramp',
        columnKey: null,
        width: 40,
        toolTip: "Ramp"}, {
        id: "avail",
        name: "AvailableGeneration",
        field: "avail",
        category: 'AvailableGeneration',
        columnKey: null,
        width: 40,
        toolTip: "Available Generation"
    });
    //Adding Constituent Requisition columns iteratively
    var constituentNames = getConstituentNames();
    var constituentIDs = getConstituentIDs();
    for (var i = 0; i < constituentNames.length; i++) {
        columns.push({
            id: constituentIDs[i]+"_"+"Normal",
            //name field is just for display
            name: constituentNames[i],
            //"field" is the field used by the program a particular cell in row
            field: constituentIDs[i]+"_"+"Normal",
            category: 'Normal',
            columnKey: constituentIDs[i],
            width: 50,
            toolTip: constituentNames[i],
            editor: Slick.Editors.Text
        });
    }
    if(isRSDPresent) {
        for (var i = 0; i < constituentNames.length; i++) {
            columns.push({
                id: constituentIDs[i]+"_"+"RSD",
                //name field is just for display
                name: constituentNames[i] + '_RSD',
                //"field" is the field used by the program a particular cell in row
                field: constituentIDs[i]+"_"+"RSD",
                category: 'RSD',
                columnKey: constituentIDs[i],
                width: 65,
                toolTip: constituentNames[i] + 'RSD',
                editor: Slick.Editors.Text
            });
        }
    }
    if(isURSPresent) {
        for (var i = 0; i < constituentNames.length; i++) {
            columns.push({
                id: constituentIDs[i]+"_"+"URS",
                //name field is just for display
                name: constituentNames[i] + '_URS',
                //"field" is the field used by the program a particular cell in row
                field: constituentIDs[i]+"_"+"URS",
                category: 'URS',
                columnKey: constituentIDs[i],
                width: 65,
                toolTip: constituentNames[i] + 'URS',
                editor: Slick.Editors.Text
            });
        }
    }
    if(isMTOAPresent){
        columns.push({
                id: "mtoa",
                name: "MTOA/STOA",
                field: "mtoa",
                category: 'MTOA/STOA',
                columnKey: null,
                width: 40,
                toolTip: "MTOA/STOA"
            }
        );
    }
    return columns;
}

//Grid Utility Functions - Used new Column Format
function resetGrid(grid, constituentNames, defVal, isDecCapPresent, defDecCap, isOnBarPresent, defOnBar, isMaxRampPresent, defMaxRamp, isRSDPresent, defRSDValue, isURSPresent, defURSValue){
    var data = grid.getData();
    for (var i = 0; i < 96; i++) {
        var d = (data[i]);
        for (var j = 0; j < constituentNames.length; j++) {
            //Resetting the data values of the cell i,j(row,column) to val
            d[constituentIDs[j]+"_"+"Normal"] = defVal;
        }
    }
    if(isRSDPresent) {
        for (var i = 0; i < 96; i++) {
            //i is iterator for the row i ...
            d = (data[i]);
            for (var j = 0; j < constituentNames.length; j++) {
                //Resetting the data values of the cell i,j(row,column) to val
                d[constituentIDs[j]+"_"+"RSD"] = defRSDValue;
            }
        }
    }
    if(isURSPresent) {
        for (var i = 0; i < 96; i++) {
            //i is iterator for the row i ...
            d = (data[i]);
            for (var j = 0; j < constituentNames.length; j++) {
                //Resetting the data values of the cell i,j(row,column) to val
                d[constituentIDs[j]+"_"+"URS"] = defURSValue;
            }
        }
    }
    if(isDecCapPresent) {
        for (var i = 0; i < 96; i++) {
            //i is iterator for the row i ...
            (data[i])['dc'] = defDecCap;
        }
    }
    if(isOnBarPresent) {
        for (var i = 0; i < 96; i++) {
            (data[i])['onBar'] = defOnBar;
        }
    }
    if(isMaxRampPresent) {
        for (var i = 0; i < 96; i++) {
            (data[i])['maxRamp'] = defMaxRamp;
        }
    }
    grid.invalidateAllRows();
    grid.render();
}

//Grid Utility Functions - new Column Format not needed
function setGridCell(grid, rowNumber, gridColumnKey, value){
    //Note: Data not rendered from here, so render grid from outside
    //Note: rowNumber starts from 0 to 95, not 1 to 96.
    var data = grid.getData();
    (data[rowNumber])[gridColumnKey] = value;
}

//Grid Utility Functions - Used new Column Format
function feedSectionsToGrid(grid, sectionsArray){
    //first reset the grid;
    resetGrid(grid,constituentNames,"FULL",true,genDecCap,true,genOnBar,true,genRamp,true,0,true,0);
    //Feeding the normal shares
    var sectionsArrayKeys = getKeys(sectionsArray);
    for(var i=0;i<sectionsArrayKeys.length;i++){
        //i is the iterator for sectionsArray index
        var columnIndex = sectionsArrayKeys[i];
        var columnData = sectionsArray[columnIndex];
        var cat = columnData.columnCategory;
        var columnKey = columnData.columnKey;
        var sections = columnData.columnSections;
        for(j=0;j<sections.length;j++){
            var sectionObject = sections[j];
            for(var k=sectionObject.secStart;k<=sectionObject.secEnd;k++){
                //Not complete but works for now
                setGridCell(grid,k,columnIndex,sectionObject.val);
            }
        }
    }
    //Now invalidate and render the the grid
    grid.invalidateAllRows();
    grid.render();
}

//Grid Utility Functions - Used new Column Format
function getSectionsFromGrid(grid){
//Find the sections of the columns
    var data = grid.getData();
    var sectionsArray = [];
    var constCol;
    var cat = "";
    for (var constCol1 = 0; constCol1 < 3; constCol1++) {
        //Three for OnBarDC and MaxRamp and DC respectively
        switch (constCol1) {
            case 0:
                constCol = "onBar";
                cat = "OnBarDC";
                break;
            case 1:
                constCol = "maxRamp";
                cat = "MaxRamp";
                break;
            case 2:
                constCol = "dc";
                cat = "DC";
                break;
            default:

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
        var colData = {};
        colData.columnCategory = cat;
        colData.columnKey = constCol;
        colData.columnSections = sections;
        sectionsArray[constCol] = colData;
    }
    for (constCol = 0; constCol < constituentNames.length; constCol++) {
        sections = [];
        sectionStart = 0;
        for (var blkNum = 1; blkNum <= 95; blkNum++) {
            if ((data[blkNum])[constituentIDs[constCol]+"_"+"Normal"] != (data[blkNum - 1])[constituentIDs[constCol]+"_"+"Normal"]) {
                sections.push({
                    'secStart': sectionStart,
                    'secEnd': blkNum - 1,
                    'val': (data[blkNum - 1])[constituentIDs[constCol]+"_"+"Normal"]
                });
                sectionStart = blkNum;
            }
        }
        sections.push({
            'secStart': sectionStart,
            'secEnd': 95,
            'val': (data[95])[constituentIDs[constCol]+"_"+"Normal"]
        });
        colData = {};
        colData.columnCategory = "Normal";
        colData.columnKey = constituentIDs[constCol];
        colData.columnSections = sections;
        sectionsArray[constituentIDs[constCol]+"_"+"Normal"] = colData;
    }
    //URS Version
    for (constCol = 0; constCol < constituentNames.length; constCol++) {
        sections = [];
        sectionStart = 0;
        for (var blkNum = 1; blkNum <= 95; blkNum++) {
            if ((data[blkNum])[constituentIDs[constCol]+"_"+"RSD"] != (data[blkNum - 1])[constituentIDs[constCol]+"_"+"RSD"]) {
                sections.push({
                    'secStart': sectionStart,
                    'secEnd': blkNum - 1,
                    'val': (data[blkNum - 1])[constituentIDs[constCol]+"_"+"RSD"]
                });
                sectionStart = blkNum;
            }
        }
        sections.push({
            'secStart': sectionStart,
            'secEnd': 95,
            'val': (data[95])[constituentIDs[constCol]+"_"+"RSD"]
        });
        colData = {};
        colData.columnCategory = "RSD";
        colData.columnKey = constituentIDs[constCol];
        colData.columnSections = sections;
        sectionsArray[constituentIDs[constCol]+"_"+"RSD"] = colData;
    }
    //For URS option
    for (constCol = 0; constCol < constituentNames.length; constCol++) {
        sections = [];
        sectionStart = 0;
        for (var blkNum = 1; blkNum < 96; blkNum++) {
            if ((data[blkNum])[constituentIDs[constCol]+"_"+"URS"] != (data[blkNum - 1])[constituentIDs[constCol]+"_"+"URS"]) {
                sections.push({
                    'secStart': sectionStart,
                    'secEnd': blkNum - 1,
                    'val': (data[blkNum - 1])[constituentIDs[constCol]+"_"+"URS"]
                });
                sectionStart = blkNum;
            }
        }
        sections.push({
            'secStart': sectionStart,
            'secEnd': 95,
            'val': (data[95])[constituentIDs[constCol]+"_"+"URS"]
        });
        colData = {};
        colData.columnCategory = "URS";
        colData.columnKey = constituentIDs[constCol];
        colData.columnSections = sections;
        sectionsArray[constituentIDs[constCol]+"_"+"URS"] = colData;
    }
    //URS Version
    //TODO eliminate saving these in the sectionsArray
    //sectionsArray['genName'] = genName;
    //sectionsArray['comment'] = document.getElementById('commentInput').value;
    //sections of the columns found
    return sectionsArray;
}

//Common Utility Functions - new Column Format not needed
function getKeys(obj){
    var keys = [];
    for(var key in obj){
        keys.push(key);
    }
    return keys;
}

//Grid Utility Functions - Used new Column Format
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
            cellVal = d[constituentIDs[j]+"_"+"Normal"];
            //Reset cell Color
            $(grid.getCellNode(i,grid.getColumnIndex(constituentIDs[j]+"_"+"Normal"))).removeClass("redError");
            //check if it is a number
            if (typeof cellVal == "number") {
                //No Validation required
            } else {
                isValid = cellVal.match(/^\d+(\.\d+)?\p$/i) || cellVal.match(/^\FULL$/i) || cellVal.match(/^[+]?\d+(\.\d+)?$/i);
                if (!isValid) {
                    alertAdd(alertComment, 'Invalid values at Block ' + (i + 1) + ' of the Constituent ' + constituentNames[j] + '.');
                    $(grid.getCellNode(i,grid.getColumnIndex(constituentIDs[j]+"_"+"Normal"))).addClass("redError");
                    //return false;
                } else {
                    //If valid then capitalize all letters.Design decision
                    d[constituentIDs[j]+"_"+"Normal"] = cellVal.toUpperCase();
                }
            }
            //URS Version
            cellVal = d[constituentIDs[j]+"_"+"RSD"];
            //Reset cell Color
            $(grid.getCellNode(i,grid.getColumnIndex(constituentIDs[j]+"_"+"RSD"))).removeClass("redError");
            if (typeof cellVal == "number") {

            } else {
                isValid = cellVal.match(/^\d+(\.\d+)?\p$/i) || cellVal.match(/^\FULL$/i) || cellVal.match(/^[+]?\d+(\.\d+)?$/i) || cellVal.match(/^\YES$/i);
                if (!isValid) {
                    alertAdd(alertComment, 'Invalid values at Block ' + (i + 1) + ' of the RSD of Constituent ' + constituentNames[j] + '.');
                    $(grid.getCellNode(i,grid.getColumnIndex(constituentIDs[j]+"_"+"RSD"))).addClass("redError");
                    //return false;
                } else {
                    //if valid then capitalize all letters.Design decision
                    d[constituentIDs[j]+"_"+"RSD"] = cellVal.toUpperCase();
                }
            }
            cellVal = d[constituentIDs[j]+"_"+"URS"];
            //Reset cell Color
            $(grid.getCellNode(i,grid.getColumnIndex(constituentIDs[j]+"_"+"URS"))).removeClass("redError");
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
                    $(grid.getCellNode(i,grid.getColumnIndex(constituentIDs[j]+"_"+"URS"))).addClass("redError");
                    //return false;
                } else {
                    //if valid then capitalize all letters.Design decision
                    d[constituentIDs[j]+"_"+"URS"] = cellVal.toUpperCase();
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
                    colStr = 'maxRamp';
                    alertStr = 'Invalid values at Block ' + (i + 1) + ' of MaxRamp grid column';
                    break;
                case 2:
                    colStr = 'dc';
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

//Common Utility Functions - new Column Format not needed
function alertAdd(alertComment, alertStr){
    alertComment.str += alertStr;
    alertComment.str += '\n\n';
}

//Grid Utility Functions - new Column Format not needed
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

//Extra Grid features - new Column Format not needed
function headerClick(e, args) {
    var colInd = args.grid.getColumnIndex(args.column.id);
    args.grid.getSelectionModel().setSelectedRanges([new Slick.Range(0,colInd,95,colInd)]);
    //console.log(columnID);
}
//Extra Grid features - new Column Format not needed
pluginOptions = {
    clipboardCommandHandler: function(editCommand) {
        undoRedoBuffer.queueAndExecuteCommand.call(undoRedoBuffer, editCommand);
    },
    includeHeaderWhenCopying: false
};
//Extra Grid features - new Column Format not needed
options = {
    editable: true,
    enableAddRow: false,
    enableCellNavigation: true,
    asyncEditorLoading: false,
    autoEdit: false
};
//Extra Grid features - new Column Format not needed
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
//Extra Grid features undo shortcut - new Column Format not needed
$(document).keydown(function(e) {
    if (e.which == 90 && (e.ctrlKey || e.metaKey)) { // CTRL + (shift) + Z
        if (e.shiftKey) {
            undoRedoBuffer.redo();
        } else {
            undoRedoBuffer.undo();
        }
    }
});

//UI Layer Layer Testing Functions - new Column Format not needed
function onResetClick(){
    resetGrid(grid,constituentNames,"fu",true,"dec",true,'onb',true,'max',true,'rsd',true,'ur');
}

//UI Layer Layer Testing Functions - new Column Format not needed
function onSetGridSectionsClick(){
    feedSectionsToGrid(grid,sectionsArray);
}

//UI Layer Layer Testing Functions - new Column Format not needed
function onGetGridSectionsClick(){
    if(validateGrid(grid)) {
        sectionsArray = getSectionsFromGrid(grid);
    }
}

//UI Layer Layer Testing Functions - new Column Format not needed
function onValidateGridClick(){
    var isGridValid = validateGrid(grid);
}

//UI Layer Layer Testing Functions - new Column Format not needed
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
        sectionsArray = getSectionsFromRows(constituentNames, "reqInputTable", "FULL", 0, genDecCap, genOnBar, genRamp, 0);
    }
}

//UI Layer Layer Testing Functions
function onValidateReqTableClick(){
    var isReqTableValid = validateReqTable("reqInputTable");
}

//UX Utility function
function loadLatestRevisionDB() {
    var date = getDateInput();
    var genID = getGenID();
    var constituentNames = getConstituentNames();
    loadRevisionFromDB(genID, date, "latest", constituentNames)
}

//UX Utility function
function loadRevisionFromDB(genID, date, requested, constituentNames){
    console.log('Loading Revision '+requested);
    $.ajax({
        type: 'GET',
        url: "http://"+localhost+"/api/revisions/"+date+"/"+genID+"/"+requested,
        dataType: "json", // data type of response
        success: function(dataFetched) {
            if(dataFetched.error == false){
                console.log('Error in loading the revision ' + requested);
                return false;
            }
            // serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var fetchedRevData = dataFetched == null ? [] : (dataFetched.revData instanceof Array ? dataFetched.revData : [dataFetched.revData]);
            console.log('fetched revision data of revision '+requested+': '+JSON.stringify(fetchedRevData));
            //convert revision data into sections
            var sectionsArrayFetched = convertRevDataToSectionsArray(fetchedRevData);
            console.log('fetched sectionsArray of revision '+ requested, sectionsArrayFetched);
            //Now the revision can be loaded...
            //Set the comment
            var revParams = getCommentAndTimeOfOriginFromDataFetched(dataFetched);
            setCommentAndTO('commentInput', 'TO', revParams);
            //So if wanted change the table data accordingly and update the curRev variable
            setCurrRevDisplay(requested);
            feedSectionsToGrid(grid, sectionsArrayFetched);
            getRowsFromSections(sectionsArrayFetched, constituentNames, "reqInputTable");
            createSectionSummaryTable("summTab", sectionsArrayFetched);
            //TODO modify the global variables for sectionsArray
            setSectionsArray(sectionsArrayFetched);
        }
    });
    //Loading the implemented revision also
    console.log('Loading Implemented Revision number '+requested);
    $.ajax({
        type: 'GET',
        url: "http://"+localhost+"/api/revisionsimplemented/"+date+"/"+genID+"/"+requested,
        dataType: "json", // data type of response
        success: function(dataFetched) {
            if(dataFetched.error == false){
                console.log('Error in loading the implemented number revision ' + requested);
                return false;
            }
            // serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var fetchedRevData = dataFetched == null ? [] : (dataFetched.revData instanceof Array ? dataFetched.revData : [dataFetched.revData]);
            console.log('fetched revision data of revision '+requested+': '+JSON.stringify(fetchedRevData));
            //convert revision data into sections
            var sectionsArrayFetched = convertRevDataToSectionsArray(fetchedRevData);
            console.log('fetched sectionsArray of revision '+ requested, sectionsArrayFetched);
            setCurrRevDisplay(requested);
            feedSectionsToGrid(implementedGrid, sectionsArrayFetched);
            //TODO modify the global variables for sectionsArrayImplemented
            setSectionsArrayImplemented(sectionsArrayFetched);
        }
    });

}

//UX Utility function
function saveRevisionToDB(genID, sectionsArray, constituentIDs){
    var date = getDateInput();
    var curRev = getCurrentRevisionLoaded();
    //Sending the ajax request to the server for saving the revision
    console.log('saving revision to the server');
    var formattedJSON = convertSectionsArrayToSeverJSON(genID, sectionsArray, constituentIDs);
    var revParams = getCommentAndTO('commentInput', 'TO');
    $.ajax({
        type: 'PUT',
        url: "http://"+localhost+"/api/revisions/"+date+"/"+curRev,
        dataType: "json", // data type of response
        data: JSON.stringify({
            'TO':revParams.TO,
            'comm':revParams.comment,
            'genID':genID,
            'cats':formattedJSON.cats,
            'conIDs': formattedJSON.conIDs,
            'frombs': formattedJSON.frombs,
            'tobs': formattedJSON.tobs,
            'vals': formattedJSON.vals
        }),
        success: function (data, textStatus, jqXHR) {
            alert("Updated the revision " + curRev + "successfully...");
            console.log(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('updateRevision Error: ' + textStatus);
            console.log("updateRevision errorThrown: " + errorThrown);
            console.log("updateRevision jqXHR: " + JSON.stringify(jqXHR));
        }
    });
    //Save the implemented revision also
    console.log('saving revision to the server');
    var formattedJSON1 = convertSectionsArrayToSeverJSON(genID, sectionsArray, constituentIDs);
    $.ajax({
        type: 'PUT',
        url: "http://"+localhost+"/api/revisionsimplemented/"+date+"/"+curRev,
        dataType: "json", // data type of response
        data: JSON.stringify({
            'TO':revParams.TO,
            'comm':revParams.comment,
            'genID':genID,
            'cats':formattedJSON1.cats,
            'conIDs': formattedJSON1.conIDs,
            'frombs': formattedJSON1.frombs,
            'tobs': formattedJSON1.tobs,
            'vals': formattedJSON1.vals
        }),
        success: function (data, textStatus, jqXHR) {
            alert("Updated the implemented revision " + curRev + "successfully...");
            console.log(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('update Implemented Revision Error: ' + textStatus);
            console.log("update Implemented Revision errorThrown: " + errorThrown);
            console.log("update Implemented Revision jqXHR: " + JSON.stringify(jqXHR));
        }
    });
}

//UX utility functions
function createRevDB(genID, constituentNames){
    console.log('Creating a new revision');
    var date = getDateInput();
    var revParams = getCommentAndTO('commentInput', 'TO');
    $.ajax({
        type: 'POST',
        url: "http://"+localhost+"/api/revisions/"+date+"/"+genID,
        dataType: "json", // data type of response
        data: JSON.stringify({'TO':revParams.TO,'comm':revParams.comment}),
        success: function (data, textStatus, jqXHR) {
            console.log("New Revision number created ",data.new_rev);
            loadRevisionFromDB(genID, date, data.new_rev, constituentNames);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('createRevision error: ' + textStatus);
            console.log("createNewRevision errorThrown: " + errorThrown);
            console.log("createNewRevision jqXHR: " + JSON.stringify(jqXHR));
        }
    });
}

//UX utility functions
function deleteRevisionFromDB(genID, constituentNames){
    var date = getDateInput();
    var curRev = getCurrentRevisionLoaded();
    console.log("Requesting the Database to delete the Revision " + curRev);
    $.ajax({
        type: 'DELETE',
        url: "http://"+localhost+"/api/revisions/"+date+"/"+curRev,
        success: function(data, textStatus, jqXHR){
            if(data.error == false) {
                console.log("Deleted the revision " + curRev + " successfully!");
                alert("Deleted the revision " + curRev + " successfully!");
                //Load the latest revision
                console.log("Requesting to load the latest revision after deletion...");
                deleteImplementedRevisionFromDB();
                //TODO this function
                loadRevisionFromDB(genID, date, "latest", constituentNames);
            }
            else{
                console.log("deleteRevision "+curRev+" error:",data.num_rows);
                alert("Failed to Delete Revision "+curRev+".\nSee Console for message...");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('deleteRevision error: '+textStatus);
            console.log("deleteRevision "+curRev+" jqXHR:",jqXHR);
            console.log("deleteRevision "+curRev+" errorThrown:", errorThrown);
        }
    });
    function deleteImplementedRevisionFromDB(){
        console.log("Requesting the Database to delete the Implemented Revision");
        $.ajax({
            type: 'DELETE',
            url: "http://"+localhost+"/api/revisionsimplemented/"+date+"/"+curRev,
            success: function(data, textStatus, jqXHR){
                if(data.error == false) {
                    console.log("Deleted the implemented revision " + curRev + " successfully!");
                }
                else{
                    console.log("deleteImplementedRevision "+curRev+" error:",data.num_rows);
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log("deleteImplementedRevision "+curRev+" jqXHR:",jqXHR);
                console.log("deleteImplementedRevision "+curRev+" errorThrown:", errorThrown);
            }
        });
    }
}

function datePickerInitialise(){
    $("#datePicker").datepicker({
        dateFormat: "dd-mm-yy",
        onSelect:function(dateText) {
            //On date selected from calendar
            decorateGrid();
        }
    });
    var today = new Date();
    var dd = ("0" + (today.getDate())).slice(-2);
    var mm = ("0" + (today.getMonth()+1)).slice(-2);
    var yyyy = today.getFullYear();
    today = dd + '-' + mm + '-' + yyyy ;
    $("#datePicker").attr("value", today);
}

//Common Utility Functions
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

//Getters
//UX utility functions
function setCommentAndTO(commentID, timeOfOriginID, revParams){
    document.getElementById(commentID).value = revParams.comment;
    document.getElementById(timeOfOriginID).value = revParams.TO;
}

//UX utility functions
function getCommentAndTO(commentID, timeOfOriginID){
    var revParams = {};
    revParams.comment = document.getElementById(commentID).value;
    revParams.TO = document.getElementById(timeOfOriginID).value;
    return revParams;
}

//UX utility functions
function getDateInput(){
    var picker = $( "#datePicker" );
    var date = picker.datepicker("getDate").getFullYear()+"-"+(picker.datepicker("getDate").getMonth()+1)+"-"+picker.datepicker("getDate").getDate();
    return date;
}

//UX utility functions
function getCurrentRevisionLoaded(){
    return curRev;
}

//UX utility functions
function getGenID(){
    return genID;
}

//UX utility functions
function getConstituentNames(){
    return constituentNames;
}

//UX utility functions
function getConstituentIDs(){
    return constituentIDs;
}

//UX utility functions
function getGenNames(){
    return genNames;
}

//UX utility functions
function getGenIDs(){
    return genIDs;
}

//UX utility functions
function getGenRamp(){
    return genRamp;
}

//UX utility functions
function getGenDecCap(){
    return genDecCap;
}

//UX utility functions
function getGenOnBar(){
    return genOnBar;
}

//UX utility functions
function getSectionsArray(){
    return sectionsArray;
}

//UX utility functions
function getSectionsArrayImplemented(){
    return sectionsArrayImplemented;
}

//Setters
//UX utility functions
function setGenNames(arr){
    genNames = arr;
}

//UX utility functions
function setGenIDs(arr){
    genIDs = arr;
}

//UX utility functions
function setGenID(id){
    genID = id;
}

//UX utility functions
function setConstituentNames(arr){
    constituentNames = arr;
}

//UX utility functions
function setConstituentIDs(arr){
    constituentIDs = arr;
}

//UX utility functions
function setGenRamp(ramp){
    genRamp = ramp;
}

//UX utility functions
function setGenDecCap(dec){
    genDecCap = dec;
}

//UX utility functions
function setGenOnBar(onb){
    genOnBar = onb;
}

//UX utility functions
function setSectionsArray(arr){
    sectionsArray = arr;
}

//UX utility functions
function setSectionsArrayImplemented(arr){
    sectionsArrayImplemented = arr;
}

//UX utility functions
function setCurrRevDisplay(requested){

}