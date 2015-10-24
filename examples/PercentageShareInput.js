/**
 * Created by PSSE on 10/23/2015.
 */
//Table Parameters
var grid; //The cell grid object.
var data = []; //The data used by the cell grid
//The constituent configuration settings for this particular generator.These are same throughout all revisions.
var constituentNames = ['BPDB-ER','CSEB-NVVN','DD','DNH','GUVNL','GOA','HVDC-BHD','HVDC-VIN','JNK-NR','MPSEB','MSEB','MS-NVVN','RAJ-SOLAR'];

var options = {
    editable: true,
    enableAddRow: true,
    enableCellNavigation: true,
    asyncEditorLoading: false,
    autoEdit: false
};

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
// undo shortcut
$(document).keydown(function(e) {
    if (e.which == 90 && (e.ctrlKey || e.metaKey)) { // CTRL + (shift) + Z
        if (e.shiftKey) {
            undoRedoBuffer.redo();
        } else {
            undoRedoBuffer.undo();
        }
    }
});

var pluginOptions = {
    clipboardCommandHandler: function(editCommand) {
        undoRedoBuffer.queueAndExecuteCommand.call(undoRedoBuffer, editCommand);
    },
    includeHeaderWhenCopying: false
};
//cell grid options for customization over

//Setting the Column names of the grid
var columns = [];
//Adding Constituent Requisition columns iteratively
columns.push({
    id: "SNo",
    //name field is just for display
    name: "Block",
    //"field" is the field used by the program a particular cell in row
    field: "SNo",
    width: 50,
    toolTip: "Block Number"
});
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
//Table Parameters End

//Global Parameters of the app
var genName = "CGPL";
var sectionsArray = [];
var tiedToGrid = true;
var tiedToReq = false;

$(function() {
    for (var i = 0; i < 96; i++) {
        //Setting the data values of the grid here...
        //i is iterator for the row i or block i+1...
        var d = (data[i] = {});
        d["SNo"] = i + 1;
        for (var j = 0; j < constituentNames.length; j++) {
            d[j] = 0;
        }
    }
    grid = new Slick.Grid("#myGrid", data, columns, options);
    grid.setSelectionModel(new Slick.CellSelectionModel());
    grid.registerPlugin(new Slick.AutoTooltips());
    grid.onCellChanged;
    // set keyboard focus on the grid
    grid.getCanvasNode().focus();
    //enabling the excel style functionality by the plugin
    grid.registerPlugin(new Slick.CellExternalCopyManager(pluginOptions));
    //Things to do on adding a new Row - TODO - not needed coz we dont add new rows other than 96
    grid.onAddNewRow.subscribe(function(e, args) {
        var item = args.item;
        var column = args.column;
        grid.invalidateRow(data.length);
        data.push(item);
        grid.updateRowCount();
        grid.render();
    });
});

function updateFromGrid() {
    if (!validateGrid())
        return false;
    sectionsArray = createSections();
    tiedToGrid = true;
    tiedToReq = false;
    createSectionSummaryTable(sectionsArray);
}

function createSections() {
    //Find the sections of the columns
    var sectionsArray = [];
    for (var constcol = 0; constcol < constituentNames.length; constcol++) {
        var sections = [];
        var sectionStart = 0;
        for (var blkNum = 1; blkNum < 96; blkNum++) {
            if ((data[blkNum])[constcol] != (data[blkNum - 1])[constcol]) {
                sections.push({
                    'secStart': sectionStart,
                    'secEnd': blkNum - 1,
                    'val': (data[blkNum - 1])[constcol]
                });
                sectionStart = blkNum;
            }
        }
        sections.push({
            'secStart': sectionStart,
            'secEnd': 95,
            'val': (data[95])[constcol]
        });
        //sectionsArray.push(sections);
        sectionsArray[constcol] = sections;
    }
    //Saving the generator name also
    sectionsArray['genName'] = genName;
    //sections of the columns found
    return sectionsArray;
}

function createSectionSummaryTable(sectionsArray) {
    var summTab = document.getElementById('summTab');
    summTab.innerHTML = '';
    for (var j = 0; j < sectionsArray.length; j++) {
        createSectionSummaryTableRow(summTab,sectionsArray,j);
    }
    summTab.border = '1';
    summTab.width = '200px';
    //created the section summary table
    createSummTableTiedInfo();
}

function createSectionSummaryTableRow(summTab,sectionsArray,j) {
    var sections = sectionsArray[j];
    var textStr;
    if (isNaN(j))
        textStr = j;
    else
        textStr = constituentNames[j];
    for (var i = 0; i < sections.length; i++) {
        var tr = document.createElement('tr');
        var td0 = document.createElement('td');
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        td0.appendChild(document.createTextNode(textStr));
        td1.appendChild(document.createTextNode((sections[i])['secStart'] + 1));
        td2.appendChild(document.createTextNode((sections[i])['secEnd'] + 1));
        td3.appendChild(document.createTextNode((sections[i])['val']));
        td0.style.padding = "4px";
        td1.style.padding = "4px";
        td2.style.padding = "4px";
        td3.style.padding = "4px";
        tr.appendChild(td0);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        summTab.appendChild(tr);
    }
}

function createSummTableTiedInfo(atrr, val) {
    var gridTied, reqTableTied, DCTableTied, RampTableTied;
    gridTied = tiedToGrid ? 'grid' : '';
    manualTableTied = tiedToReq ? ', Manual Entry' : '';
    document.getElementById('tiedInfo').innerHTML = 'Revision Summary, tied to ' + gridTied + manualTableTied + '.';
}