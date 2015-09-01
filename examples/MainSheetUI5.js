var curRev = 0; //can be modified only by loadRevision() function
var grid;
var data = [];
var constituentNames = ['MSEB', 'GUVNL', 'MPSEB', 'CSEB', 'DD', 'DNH'];
var consReqPercentages = [0.2, 0.3, 0.2, 0.1, 0.1, 0.1];
var genRamp = 30;
var genOnBar = 100;
var markRev = []; 

//LOCAL Instance Data
var sectionsArray = [];
var revStrtBlkNums = [];
//Revision Summary Tables stored as the main revision data, from which the latest rev tag can be computed for every cell in the grid.
//Database Array
var revDataArray = new Array();
//Add the sections and the column rev start array as the object data into the database


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
}

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

var columns = [
  //This is the serial number column - can be used for block number display
  {
    id: 'ramp',
    name: 'MaxRamp',
    field: 'rampNum',
    width: 30
  }, {
    id: 'onBarDC',
    name: 'OnBarDC',
    field: 'onBar',
    width: 40
  }, {
    id: "selector",
    name: "BlockNo",
    field: "SNo",
    width: 40
  }, {
    id: "ramp",
    name: "Ramp",
    field: "rampedVal",
    width: 40
  }, {
    id: "availGen",
    name: "AvailableGeneration",
    field: "avail",
    width: 40
  }
];

//Adding more columns iteratively
for (var i = 0; i < constituentNames.length; i++) {
  columns.push({
    id: i,
    //name: String.fromCharCode("A".charCodeAt(0) + i),
    //name field is just for display
    name: constituentNames[i],
    //"field" is the field used by the program a particular cell in row
    field: i,
    width: 50,
    editor: Slick.Editors.Text
  });
}

$(function() {
  //add options to the dropdowns
  addOptions(['selectRSDConst', 'selectURSConst', 'selectReqConst']);
  /*TODO
  This is to add the select all and deselect all capability to all the  forms with checkboxes
    var checkbox = document.getElementById('no_photo');
    checkbox.addEventListener('click', function() {
      var photo = document.getElementById('photo_upload');
      if(photo.style.display != 'none') {
        photo.style.display = 'none';
      } 
      else if(photo.style.display == 'none') {
        photo.style.display = 'block';
      };
    });
  */
  for (var i = 0; i < 96; i++) {
    //Setting the data values of the grid here...
    //i is iterator for the row i ...
    var d = (data[i] = {});
    //Accommodating markRev
    var m = (markRev[i] = {});
    d["SNo"] = i + 1;
    d["rampNum"] = genRamp;
    var sumgen = 0;
    for (var j = 0; j < constituentNames.length; j++) {
      //j is iterator the column j ...
      //Setting the data value for the cell i,j(row,column)
      //d[j] = genOnBar*consReqPercentages[j];
      d[j] = 'FULL';
      sumgen += ConvertCellValToNum(d[j], j, i);
      //Accommodating markRev
      m[j] = 0;
    }
    d["onBar"] = genOnBar;
    d["avail"] = genOnBar - sumgen;
    if (i > 0) {
      d["rampedVal"] = d["avail"] - (data[i - 1])["avail"];
    } else
      d["rampedVal"] = "NA";
  }

  grid = new Slick.Grid("#myGrid", data, columns, options);
  grid.setSelectionModel(new Slick.CellSelectionModel());
  grid.registerPlugin(new Slick.AutoTooltips());
  grid.onCellChanged;

  // set keyboard focus on the grid
  grid.getCanvasNode().focus();

  grid.registerPlugin(new Slick.CellExternalCopyManager(pluginOptions));

  grid.onAddNewRow.subscribe(function(e, args) {
    var item = args.item;
    var column = args.column;
    grid.invalidateRow(data.length);
    data.push(item);
    grid.updateRowCount();
    grid.render();
  });
})

function addRow(tableID) {
  //stub
  var table = document.getElementById(tableID);
  var rowCount = table.rows.length;
  var selectmenu;
  switch (tableID) {
    case 'URSInputTable':
      selectmenu = document.getElementById('selectURSConst');
      break;
    case 'RSDInputTable':
      selectmenu = document.getElementById('selectRSDConst');
      break;
    case 'reqInputTable':
      selectmenu = document.getElementById('selectReqConst');
      break;
  }
  var chosenval = constituentNames[selectmenu.selectedIndex];
  var alreadypr = false;

  //check for duplicates for urs and rsd inputs
  for (var i = 1; i < rowCount && (tableID == "URSInputTable" || tableID == "RSDInputTable"); i++) {
    if (table.rows[i].cells[0].childNodes[0].innerHTML == chosenval) {
      if (tableID == "URSInputTable") {
        var ifok = confirm("Constituent already present, add duplicates?");
        if (ifok == false) {
          return false; //jumping out of the function
        }
      } else //tableID == RSDInputTable
      {
        //No duplicate rsd columns allowed...
        return false; //jumping out of the function
      }
      break;
    }
  }
  var row = table.insertRow(rowCount); 
  var colCount = table.rows[0].cells.length;
  var newcell = row.insertCell(0);
  var t = document.createTextNode(chosenval);
  var s = document.createElement("span");
  s.appendChild(t);
  newcell.appendChild(s);
  for (var i = 1; i < colCount - 1; i++) { 
    newcell = row.insertCell(i);
    var t = document.createElement("input");
    if (i != colCount - 2) {
      t.type = 'number';
      t.onkeypress = isNumberKey;
    }
    t.min = '0';
    t.value = '';
    newcell.appendChild(t);
  }
  newcell = row.insertCell(colCount - 1);
  var cb = document.createElement("input");
  cb.type = 'checkbox';
  newcell.appendChild(cb);
}

function deleteRow(tableID) {
  try {            
    var table = document.getElementById(tableID);            
    var rowCount = table.rows.length;

                
    for (var i = 1; i < rowCount; i++) {
      var row = table.rows[i];
      var colCount = table.rows[0].cells.length;
      var chkbox = row.cells[colCount - 1].childNodes[0];                
      if (null != chkbox && true == chkbox.checked) {                    
        table.deleteRow(i);                    
        rowCount--;                    
        i--;                
      }
    }
  } catch (e) {
    alert(e);
  }
}

function isNumberKey(evt) {
  evt = (evt) ? evt : window.event
  var charCode = (evt.which) ? evt.which : evt.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
}

function createSumm(overridePermissionRequired) { //by pressing validate inputs button

  var table = document.getElementById("reqInputTable");
  var rowCount = table.rows.length;
  if (rowCount < 2)
    return false;

  //Fisrt validate the input semantics.Allowable values are 1 to 96 in case of block numbers and possitive integers along with null, full, nochange, percentage loads.
  for (var i = 1; i < rowCount; i++) {
    var cellval = table.rows[i].cells[3].childNodes[0].value;
    //For null cell value validation
    if (!cellval) {
      alert('Null values at row ' + i + '. Null values not allowed');
      return false;
    }
    //For cell value validation
    var isValid = cellval.match(/^\d+(\.\d+)?\p$/i) || cellval.match(/^\FULL$/i) || cellval.match(/^[+]?\d+(\.\d+)?$/i);
    if (!isValid) {
      alert('Invalid values at row ' + i + '. Invalid values not allowed');
      return false;
    }
    //from block <  to block   
    if (Number(table.rows[i].cells[1].childNodes[0].value) > Number(table.rows[i].cells[2].childNodes[0].value)) {
      alert('From value > TO value at row ' + i);
      return false;
    }
    //from block &  to block belong to [1,96]
    if ((Number(table.rows[i].cells[1].childNodes[0].value) < 1) || (Number(table.rows[i].cells[1].childNodes[0].value) > 96) || (Number(table.rows[i].cells[2].childNodes[0].value) < 1) || (Number(table.rows[i].cells[2].childNodes[0].value) > 96)) {
      alert('From value or TO value not in limits at row ' + i);
      return false;
    }
  }
  //Requisition Table Validation over...
  if (overridePermissionRequired) {
    if (!confirm("Override the grid Data...?"))
      return false;
  }
  //changing the table data depending on the requisition input table
  //formulas not implemented 
  for (var i = 1; i < rowCount; i++) { //iterator leaving the the table header
    for (var blkNum = Number(table.rows[i].cells[1].childNodes[0].value) - 1; blkNum <= Number(table.rows[i].cells[2].childNodes[0].value) - 1; blkNum++) {
      var constcol = table.rows[i].cells[0].childNodes[0].innerHTML.toString();
      //alert(constcol);
      constcol = constituentNames.indexOf(constcol);
      //alert(constcol);
      //table.rows[i].cells[3].childNodes[0].value = number in the form of string and no need to convert to number since javascript takes care of it
      var cellvalue = table.rows[i].cells[3].childNodes[0].value;
      if (isNaN(cellvalue)) {
        cellvalue = cellvalue.toUpperCase();
      }
      (data[blkNum])[constcol] = cellvalue;
    }
  }
  //Now values of the table are updated. 
  //For getting the revision changes, we need to verify with the previous revision if there is an NC from top to bottom of a  constituent column.
  //The row at which we first encounter a value which is not NC will be the row or block from which the revision change happens in this particular constituent column.
  //So  we save this number as revchange[<constituent column index>] = blkNumber.
  //And, to get a revision summary we store this revChange Array also in the database.
  //ToDO Stub
  //verifyWithPrevRev();

  calulateFormulaColumns();
  document.getElementById('tiedInfo').innerHTML = 'Revision Summary, tied to grid and Manual Entry';
  //Now to find the revision tag to be attached, find the smallest row index of this requested revision column which differs from the previous revision cell and from that cell all below cells are of the requested revision
  //stub
  createSections();
  createSectionSummaryTable();
}

function createSections() {
  //Find the sections of the columns
  sectionsArray = new Array();
  for (var constcol = 0; constcol < constituentNames.length; constcol++) {
    var sections = new Array();
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
    sectionsArray.push(sections);
  }
  //sections of the column found
}

function createSectionSummaryTable() {
  var summTab = document.getElementById('summTab');
  summTab.innerHTML = '';
  for (var j = 0; j < sectionsArray.length; j++) {
    var sections = sectionsArray[j];
    for (var i = 0; i < sections.length; i++) {
      var tr = document.createElement('tr');
      var td0 = document.createElement('td');
      var td1 = document.createElement('td');
      var td2 = document.createElement('td');
      var td3 = document.createElement('td');
      td0.appendChild(document.createTextNode(constituentNames[j]));
      td1.appendChild(document.createTextNode((sections[i])['secStart'] + 1));
      td2.appendChild(document.createTextNode((sections[i])['secEnd'] + 1));
      td3.appendChild(document.createTextNode((sections[i])['val']));
      tr.appendChild(td0);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      summTab.appendChild(tr);
    }
  }
  summTab.border = '1';
  summTab.width = '200px';
  //created the section summary table
}

function updateFromGrid() {
  if (!validateGrid())
    return false;
  calulateFormulaColumns();
  createSections();
  createSectionSummaryTable();
  document.getElementById('tiedInfo').innerHTML = 'Revision Summary, tied to grid only';
}

function validateGrid() {
  //Stub
  //ToDo validate grid dynamically using on cellchange listener
  for (var i = 0; i < 96; i++) {
    //Validating the data values of the grid here...
    //i is iterator for the row i ...
    var d = (data[i]);
    for (var j = 0; j < constituentNames.length; j++) {
      //j is iterator the column j ...
      //Validating the data value for the cell i,j(row,column)
      var cellval = d[j];
      //check if it is a number
      if (typeof cellval == "number") {
        //No Validation required
      } else {
        var isValid = cellval.match(/^\d+(\.\d+)?\p$/i) || cellval.match(/^\FULL$/i) || cellval.match(/^[+]?\d+(\.\d+)?$/i);
        if (!isValid) {
          alert('Invalid values at Block ' + i + 'of the Constituent ' + constituentNames[j] + '. Invalid values not allowed');
          return false;
        } else {
          //if valid then capitalize all letters.Design  decision
          d[j] = cellval.toUpperCase();
        }
      }
    }
  }
  return true;
}

function getSummToManual() {
  //stub
  var table = document.getElementById("reqInputTable");
  var sumtab = document.getElementById("summTab");
  table.innerHTML = "<tbody><tr><td>Constituent Name</td><td>From Block</td><td>To Block</td><td>Value</td><td></td></tr></tbody>";
  for (var j = 0; j < sumtab.rows.length; j++) {
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount); 
    var colCount = table.rows[0].cells.length;
    var newcell = row.insertCell(0);
    var t = document.createTextNode(sumtab.rows[j].cells[0].innerHTML);
    var s = document.createElement("span");
    s.appendChild(t);
    newcell.appendChild(s);
    for (var i = 1; i < colCount - 1; i++) { 
      newcell = row.insertCell(i);
      var t = document.createElement("input");
      if (i != 3) {
        t.type = 'number';
        t.onkeypress = isNumberKey;
      }
      t.min = '0';
      if (i == 1)
        t.value = sumtab.rows[j].cells[1].innerHTML;
      else if (i == 2)
        t.value = sumtab.rows[j].cells[2].innerHTML;
      else if (i == 3)
        t.value = sumtab.rows[j].cells[3].innerHTML;
      newcell.appendChild(t);
    }
    newcell = row.insertCell(colCount - 1);
    var cb = document.createElement("input");
    cb.type = 'checkbox';
    newcell.appendChild(cb);
  }
}

function addOptions(selNameArray) {
  for (var j = 0; j < selNameArray.length; j++) {
    var selList = document.getElementById(selNameArray[j]);
    selList.innerHTML = '';
    for (var i = 0; i < constituentNames.length; i++) {
      var option = document.createElement('option');
      option.text = constituentNames[i];
      selList.appendChild(option);
    }
  }
}

function saveToDatabase() //Update Operations of the database.
{
  //Get the current revision number.
  //Take the sections array and save it to the database
  if (!confirm("Save the changes to database in Revision " + curRev + "...?" + "\n" + "The data will be saved based on the Summary table"))
    return false;
  if (revDataArray.length == curRev)
    revDataArray.push(sectionsArray);
  else
    revDataArray[curRev] = sectionsArray;
}

function loadRevision() //Read Operation of the database.
{
  //Get the rev number from the revInput TextBox element.Validate it first
  var loadRev = +document.getElementById("revInput").value; //+ tries to converts string to a number
  if (isNaN(loadRev)) {
    alert('Invalid Input in the revision field. So cannot load...');
    return false;
  }
  //If semantics permit ask if sure to create a new revision.
  if (loadRev - getLastRevOfDb() == 1) {
    createNewRev();
    return false;
  }
  //First check if rev is present in the database.
  if (!checkForRevInDb(loadRev)) {
    alert("The revision " + loadRev + " is not present");
    return false;
  }
  //Then ask to save changes if not saved
  if (!confirm("Load the Revision " + loadRev + " ?" + "\n" + "If changes not saved, press cancel button and save, otherwise changes will be lost...")) {
    return false;
  }
  //Now the revision can be loaded...
  //So if wanted change the table data accordingly and update the curRev variable
  setCurrRevDisplay(loadRev);
  sectionsArray = revDataArray[curRev];
  createSectionSummaryTable();
  //press the button getfromsummarytable virtually and modify the grid
  getSummToManual();
  //now press the button reqFeedByTableButton virtually to recreate the summary table and modify the grid
  createSumm(false);
}

function checkForRevInDb(loadRev) {
  if (loadRev < revDataArray.length) //special case for zero
    return true;
  else
    return false;
}

function getLastRevOfDb() {
  return revDataArray.length - 1;
}

function createNewRev() //Create Operation of the database.
{
  if (!confirm("Revision not present." + "\n" + "Create a new Revision " + (getLastRevOfDb() + 1) + "?")) {
    return false;
  }
  setCurrRevDisplay(getLastRevOfDb() + 1);
  return true;
}

function setCurrRevDisplay(loadrev) {
  curRev = loadrev;
  //Change the display view
  document.getElementById("revDisplay").innerHTML = curRev;
}

function ConvertCellValToNum(cVal, constIndex, blk, Cat) //Cat = 0:Normal;1:RSD;2:URS
{
  if (isNaN(cVal)) {
    if (cVal.match(/^\FULL$/i))
      return consReqPercentages[constIndex] * genOnBar;
    else if (cVal.match(/^\d+(\.\d+)?\p$/i))
      return consReqPercentages[constIndex] * genOnBar * (+(cVal.substr(0, cVal.length - 1))) * 0.01;
  } else
    return cVal;
}

function calulateFormulaColumns() {
  for (var i = 0; i < 96; i++) {
    //Validating the data values of the grid here...
    //i is iterator for the row i ...
    var d = (data[i]);
    var sumgen = 0;
    for (var j = 0; j < constituentNames.length; j++) {
      //j is iterator the column j ...
      sumgen += +ConvertCellValToNum(d[j], j, i);
    }
    d["avail"] = d["onBar"] - sumgen;
    if (i > 0) {
      d["rampedVal"] = d["avail"] - (data[i - 1])["avail"];
    } else
      d["rampedVal"] = "NA";
  }
  grid.invalidateAllRows();
  grid.render();
}

//Marking each cell with the latest affecting rev number till current revision
//Iterate through each revision from 1st till current revision and find the smallest block or row number affected 
//by the revision and mark the next remaining blocks of the column as the same rev number.
//Continue this till current revision.
function markCellsWithRevs()
{
 //First mark all cells with 0 rev.
 for(var i=0;i<96;i++)
 {
   var m = (markRev[i]);
   for(var j=0;j<constituentNames.length;j++)
   {
     m[j]=0;
   }
 }
 //Iterate from 1st to current revision 
 //works only for saved revisions now, if rev not saved or a new revision, then doesnot work
 var sectionsArray = revDataArray[0];
 for(var rev = 1;rev<=curRev;rev++)
 {
   //Get the revision data of the present ad prev revisons
   var sectionsArrayPrev = sectionsArray;
   sectionsArray = revDataArray[rev];
   //iterate through each column of this revision to find the min blk num affected by this rev in this column
   for(var constcol=0;constcol<constituentNames.length;constcol++)
   {
     //Column data of prev and present revisions
     var sectionsprev = sectionsArrayPrev[constcol];
     var sections = sectionsArray[constcol];
     var column = new Array(96);
     //var columnprev = new Array(96);
     //Build the columns of prev and present revisions of this constituent
     for (var i = 0; i < sections.length; i++) {
      for (var blkNum = Number(sections[i]["secStart"]); blkNum <= Number(sections[i]["secEnd"]); blkNum++) {
        column[blkNum] = sections[i]["val"];
      }
     }
     var changeRow = 96;
     for (var i = 0; i < sectionsprev.length; i++) {
      for (var blkNum = Number(sectionsprev[i]["secStart"]); blkNum <= Number(sectionsprev[i]["secEnd"]); blkNum++) {
        //Check if prev column mismatches with present and declare the min blk number or row
        if(sectionsprev[i]["val"]!=column[blkNum])//change row found
        {
          changeRow = blkNum;
          break;
        }
      }
     }
     //TODO
     //This computation for changeRow of each column in a rev can be avoided by calculating and saving the array of this variable in the database
     //Marking the row rev on the basis of changeRow variable
     for (var i = changeRow; i < 96; i++) {
       (markRev[i])[constcol] = rev;
     }
   }
 }
 //Now cells are marked with the latest rev change tags.
 //Lets output them to the revMarkTable
 var tab = document.getElementById("revMarkTable");
 tab.innerHTML = '';
 tab.border = '1';
 for(var i=0;i<96;i++)
 {
   //Add a row
   var tr = document.createElement('tr');
   for(var constcol = 0;constcol<constituentNames.length;constcol++)
   {
     //Add cells to the table
     var td0 = document.createElement('td');
     td0.appendChild(document.createTextNode((markRev[i])[constcol]);
     tr.appendChild(td0);
   }
   tab.appendChild(tr);
 }
}
