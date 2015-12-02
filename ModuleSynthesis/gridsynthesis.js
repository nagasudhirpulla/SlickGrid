//On page load...
var grid;
var data = [];
var genRamp;
var genDecCap;
var genOnBar;
var constituentNames = [];
var columns = {};
var options;
var pluginOptions;

$(function() {
    var gridAndData;
    genRamp = 70;
    genDecCap = 1450;
    genOnBar = 1400;
    constituentNames = ["A", "B", "C", "D"];
    columns = setReqTableColumns(columns, true, true);
    grid = initialiseReqGrid("myGrid", grid, genRamp, genDecCap, genOnBar, constituentNames, columns, options, pluginOptions, headerClick, "FULL", true, 0, true, 'Yes');
});
function initialiseReqGrid(tableID, grid, genRamp, genDecCap, genOnBar, constituentNames, columns, options, pluginOptions, headerClick, defValue, isRSDPresent, defRSDValue, isURSPresent, defURSValue){
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
    return grid;
}

//Grid Utility Functions
function feedSectionsToGrid(grid, sectionsArray){
    //first reset the grid;

    for(var i=0;i<sectionsArray.length;i++){
        //i is the iterator for sectionsArray index

    }
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
    grid = resetGrid(grid,constituentNames,"fu",true,"dec",true,'onb',true,'max',true,'rsd',true,'ur');
}