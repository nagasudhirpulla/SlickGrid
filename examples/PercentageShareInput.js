/**
 * Created by PSSE on 10/23/2015.
 */
//Table Parameters
var grid; //The cell grid object.
var data = []; //The data used by the cell grid
//The constituent configuration settings for this particular generator.These are same throughout all revisions.
var localhost = "59.182.133.232";
var constituentNames = ['BPDB-ER','CSEB-NVVN','DD','DNH','GUVNL','GOA','HVDC-BHD','HVDC-VIN','JNK-NR','MPSEB','MSEB','MS-NVVN','RAJ-SOLAR'];
var constituentIDs = [];
var genNames = [];
var genIDs = [];

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
setTableColumns();
function setTableColumns() {
    columns = [];
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
}
//Table Parameters End

//Global Parameters of the app
var genName = "CGPL";
var sectionsArray = [];
var tiedToGrid = true;
var tiedToReq = false;

$(function() {
    //fetch the constituent names
    fetchConsNamesAjax();
});

function afterInitialFetch(){
    decorateSelectList(document.getElementById("selectReqConst"),constituentNames);
    setTableColumns();
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
    //Virtually press shareFeedByGrid Button and shareGetFromSummButton Buttton
    updateFromGrid();
    getSummSecsToManual();
}

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
    manualTableTied = tiedToReq ? ' and Manual Entry' : '';
    document.getElementById('tiedInfo').innerHTML = 'Shares Summary Table, tied to ' + gridTied + manualTableTied + '.';
}

function getSummSecsToManual() //sections version of summtomanual
{
    var table = document.getElementById("shareInputTable");
    var sections;
    table.innerHTML = "<tbody><tr><td>Constituent Name</td><td>From Block</td><td>To Block</td><td>ShareValue</td><td><input type=\"checkbox\" name=\"chk\" onclick=\"SelectAll(this,'reqInputTable')\"/></td></tr></tbody>";
    for (var j = 0; j < sectionsArray.length; j++) {
        sections = sectionsArray[j];
        for (var k = 0; k < sections.length; k++) {
            addRowOfInput(table, constituentNames[j], sections[k].secStart + 1, sections[k].secEnd + 1, sections[k].val);
        }
    }
}

//Adds a row of edittext inputs with values specified already, used in getsummtomanual
function addRowOfInput(table, colName, fromb, tob, val, chosenval) {
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    var colCount = table.rows[0].cells.length;
    var newcell = row.insertCell(0);
    var t = document.createTextNode(colName);
    var s = document.createElement("span");
    s.appendChild(t);
    newcell.appendChild(s);
    for (var i = 1; i < 4; i++) {
        newcell = row.insertCell(i);
        var t = document.createElement("input");
        if (i == 1) {
            t.min = '1';
            t.max = '100';
            t.type = 'number';
            t.onkeypress = isNumberKey;
            t.value = fromb;
        } else if (i == 2) {
            t.min = '1';
            t.max = '100';
            t.type = 'number';
            t.onkeypress = isNumberKey;
            t.value = tob;
        } else {
            t.min = '1';
            t.maxLength = 5;
            t.type = 'number';
            t.onkeypress = isNumberKey;
            t.value = val;
        }
        newcell.appendChild(t);
    }
    newcell = row.insertCell(colCount - 1);
    var cb = document.createElement("input");
    cb.type = 'checkbox';
    newcell.appendChild(cb);
}

function createSumm(overridePermissionRequired) { //by pressing modify revision by input tables button
    //tieing all the tables to one button
    modifyShares(overridePermissionRequired);
    grid.invalidateAllRows();
    grid.render();
    tiedToGrid = true;
    tiedToReq = true;
    //Now to find the revision tag to be attached, find the smallest row index of this requested revision column which differs from the previous revision cell and from that cell all below cells are of the requested revision
    sectionsArray = createSections();
    createSectionSummaryTable(sectionsArray);

}

function modifyShares(overridePermissionRequired) {
    var table = document.getElementById("shareInputTable");
    var rowCount = table.rows.length;
    if (rowCount < 2)
        return false;
    //Fisrt validate the input semantics.Allowable values are 1 to 96 in case of block numbers and possitive integers along with null, full, nochange, percentage loads.
    for (var i = 1; i < rowCount; i++) {
        var cellval = table.rows[i].cells[3].childNodes[0].value;
        //For null cell value validation
        if (!cellval) {
            alert('Null values at row ' + i + ' of SharesInput Table. Null values not allowed');
            return false;
        }
        //For cell value validation
        var isValid = cellval.match(/^[+]?\d+(\.\d+)?$/i);
        if (!isValid) {
            alert('Invalid values at block ' + (i + 1) + ' of SharesInput Table. Invalid values not allowed');
            return false;
        }
        //from block <  to block
        if (Number(table.rows[i].cells[1].childNodes[0].value) > Number(table.rows[i].cells[2].childNodes[0].value)) {
            alert('From value > TO value at row ' + i);
            return false;
        }
        //from block &  to block belong to [1,96]
        if ((Number(table.rows[i].cells[1].childNodes[0].value) < 1) || (Number(table.rows[i].cells[1].childNodes[0].value) > 96) || (Number(table.rows[i].cells[2].childNodes[0].value) < 1) || (Number(table.rows[i].cells[2].childNodes[0].value) > 96)) {
            alert('From value or TO value not in limits at row ' + i + ' of SharesInput Table');
            return false;
        }
    }
    //Requisition Table Validation over...
    if (overridePermissionRequired) {
        if (!confirm("Override the grid Data...?"))
            return false;
    }
    //Resetting the table  to a value called 0
    resetGrid(data, constituentNames, 0);
    //changing the table data depending on the share input table
    //formulas not implemented
    for (var i = 1; i < rowCount; i++) { //iterator leaving the the table header
        for (var blkNum = Number(table.rows[i].cells[1].childNodes[0].value) - 1; blkNum <= Number(table.rows[i].cells[2].childNodes[0].value) - 1; blkNum++) {
            var constcol = table.rows[i].cells[0].childNodes[0].innerHTML.toString();
            //alert(constcol);
            constcol = constituentNames.indexOf(constcol);
            //table.rows[i].cells[3].childNodes[0].value = number in the form of string and no need to convert to number since javascript takes care of it
            var cellvalue = table.rows[i].cells[3].childNodes[0].value;
            if (isNaN(cellvalue)) {
                cellvalue = cellvalue.toUpperCase();
            }
            (data[blkNum])[constcol] = cellvalue;
        }
    }
    return true;
}

function fetchGenNamesAjax() {
    console.log('Fetching the generators names...');
    $.ajax({
        type: 'GET',
        url: "http://"+localhost+"/api/generators",
        dataType: "json", // data type of response
        success: function(data) {
            // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var list = data == null ? [] : (data.names instanceof Array ? data.names : [data.names]);
            console.log(JSON.stringify(list));
            genNames = [];
            genIDs = [];
            for(var i=0;i<list.length;i++){
                genNames.push(list[i].name);
                genIDs.push(list[i].id);

            }
            var selList = document.getElementById("genList");
            decorateSelectList(selList,genNames);
            afterInitialFetch();
            fetchSharesOfGenerator(genIDs[0]);

        }
    });
}

function decorateSelectList(select,array) {
    select.options.length = 0;
    for(var i = 0; i < array.length; i++) {
        select.options[select.options.length] = new Option(array[i], i);
    }
}

function decorateGrid() {
    //Load grid with ajax loaded sections of the generator
    var genID = genIDs[document.getElementById("genList").selectedIndex];
    fetchSharesOfGenerator(genID);
}

function fetchConsNamesAjax(){
    console.log('Fetching the Constituents names...');
    $.ajax({
        type: 'GET',
        url: "http://"+localhost+"/api/names",
        dataType: "json", // data type of response
        success: function(data) {
            // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var list = data == null ? [] : (data.names instanceof Array ? data.names : [data.names]);
            console.log(JSON.stringify(list));
            constituentNames = [];
            constituentIDs = [];
            for(var i=0;i<list.length;i++){
                constituentNames.push(list[i].name);
                constituentIDs.push(list[i].id);
            }
            //fetch the generator names
            fetchGenNamesAjax();
        }
    });
}

function fetchSharesOfGenerator(genID){
    console.log('Fetching the Generator shares...');
    $.ajax({
        type: 'GET',
        url: "http://"+localhost+"/api/generatorshares/"+genID,
        dataType: "json", // data type of response
        success: function(datafetched) {
            // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var shares = datafetched == null ? [] : (datafetched.shares instanceof Array ? datafetched.shares : [datafetched.shares]);
            console.log(JSON.stringify(shares));
            //Resetting the grid  to a value called 0
            resetGrid(data, constituentNames, 0);
            //changing the table data depending on the fetched generator shares
            for (var i = 0; i < shares.length; i++) { //iterator leaving the the table header
                for (var blkNum = shares[i].from_b - 1; blkNum <= shares[i].to_b - 1; blkNum++) {
                    var constcol = shares[i].p_id;
                    //alert(constcol);
                    constcol = constituentIDs.indexOf(constcol);
                    //table.rows[i].cells[3].childNodes[0].value = number in the form of string and no need to convert to number since javascript takes care of it
                    (data[blkNum])[constcol] = shares[i].percentage;
                }
            }
            grid.invalidateAllRows();
            grid.render();
            tiedToGrid = true;
            tiedToReq = true;
            //Now to find the revision tag to be attached, find the smallest row index of this requested revision column which differs from the previous revision cell and from that cell all below cells are of the requested revision
            sectionsArray = createSections();
            createSectionSummaryTable(sectionsArray);
            getSummSecsToManual();
        }
    });
}

function saveSharesToDatabase(){
    var genID = genIDs[document.getElementById("genList").selectedIndex];
    //Preparing data to post
    var conIDs = [];
    var frombs = [];
    var tobs = [];
    var percentages = [];
    //converting sections to a json format acceptable by the server api
    for (var j = 0; j < sectionsArray.length; j++) {
        sections = sectionsArray[j];
        for (var k = 0; k < sections.length; k++) {
            if(sections[k].val>0){
                conIDs.push(constituentIDs[j]);
                frombs.push(sections[k].secStart + 1);
                tobs.push(sections[k].secEnd + 1);
                percentages.push(sections[k].val);
            }
        }
    }
    //sending the ajax request to the server for saving
    console.log('saving shares of Generator to the server');
    $.ajax({
        type: 'POST',
        url: "http://"+localhost+"/api/generatorshares/"+genID,
        dataType: "json", // data type of response
        data: JSON.stringify({
            'conIDs': conIDs,
            'frombs': frombs,
            'tobs': tobs,
            'percentages': percentages
        }),
        success: function (data, textStatus, jqXHR) {
            alert("Saved the share Percentages successfully...");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('updateShares error: ' + textStatus);
        }
    });
}