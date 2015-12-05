//Table Utility Functions
function showHide(el) {
    //Toggle Display button for the table
    var div = findSibling(el, "hidingClass");
    if (div.style.display !== "none") {
        div.style.display = "none";
    } else {
        div.style.display = "block";
    }
}

//Table Utility Functions
function findSibling(el, cls) {
    while (!el.classList.contains(cls)) {
        el = el.nextElementSibling;
    }
    return el;
}

//Table Utility Functions
function findPrevSibling(el, cls) {
    while (!el.classList.contains(cls)) {
        el = el.previousElementSibling;
    }
    return el;
}

//Table Utility Functions
function isNumberKey(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

//Table Utility Functions
function addRow(el) {
    var table = findPrevSibling(el, "tableInputClass");
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    var colCount = table.rows[0].cells.length;
    var selectMenu = findPrevSibling(el, "selectAbsorb");
    var chosenVal = selectMenu.options[selectMenu.selectedIndex].text;
    var newCell = row.insertCell(0);
    var t = document.createTextNode(chosenVal);
    var s = document.createElement("span");
    s.appendChild(t);
    newCell.appendChild(s);
    selectMenu = findPrevSibling(el, "catAbsorb");
    var selectedCategory = selectMenu.options[selectMenu.selectedIndex].text;
    newCell = row.insertCell(1);
    t = document.createTextNode(selectedCategory);
    s = document.createElement("span");
    s.appendChild(t);
    newCell.appendChild(s);
    //If selected category is not Normal DC or URS then change the first cell text
    if(selectedCategory!="Normal"&&selectedCategory!="URS"&&selectedCategory!="RSD"){
        var cell = row.cells[0];
        cell.innerHTML = "";
        t = document.createTextNode(selectedCategory);
        s = document.createElement("span");
        s.appendChild(t);
        cell.appendChild(s);
    }
    for (var i = 2; i < colCount - 1; i++) {
        newCell = row.insertCell(i);
        var inp = document.createElement("input");
        inp.min = '1';
        inp.maxlength = "5";
        inp.value = '';
        if (i != colCount - 2) {
            inp.type = 'number';
            inp.onkeypress = isNumberKey;
            inp.min = '1';
            inp.max = '100';
        }
        newCell.appendChild(inp);
    }
    newCell = row.insertCell(colCount - 1);
    var cb = document.createElement("input");
    cb.type = 'checkbox';
    newCell.appendChild(cb);
    //row inserted in to the table
}

//Table Utility Functions
function SelectAll(el) {
    var table = el.parentElement.parentElement.parentElement.parentElement;
    var action = true;
    if (!el.checked) action = false;
    var cb;
    for (var i = 1; i < table.rows.length; i++) {
        cb = table.rows[i].cells[table.rows[i].cells.length - 1].childNodes[0];
        cb.checked = action;
    }
}

//Table Utility Functions
function deleteRow(el) {
    try {
        var table = findPrevSibling(el, "tableInputClass");
        var rowCount = table.rows.length;
        for (var i = 1; i < rowCount; i++) {
            var row = table.rows[i];
            var colCount = table.rows[0].cells.length;
            var chkBox = row.cells[colCount - 1].childNodes[0];
            if (null != chkBox && true == chkBox.checked) {
                table.deleteRow(i);
                rowCount--;
                i--;
            }
        }
    } catch (e) {
        alert(e);
    }
}

//Common Utility Functions
function decorateSelectList(select,array) {
    select.options.length = 0;
    for(var i = 0; i < array.length; i++) {
        select.options[select.options.length] = new Option(array[i], i);
    }
}

//Table Utility Functions
function getRowsFromSections(sectionsArray, constituentNames, tableID){
    var table = document.getElementById(tableID);
    var sectionsArrayKeys = getKeys(sectionsArray);
    table.innerHTML = "<tbody><tr><td>Constituent Name</td><td>Category</td><td>From Block</td><td>To Block</td><td>Value</td><td><input type=\"checkbox\" name=\"chk\" onclick=\"SelectAll(this)\"/></td></tr></tbody>";
    for (var j = 0; j < sectionsArrayKeys.length; j++) {
        var sectionKey = sectionsArrayKeys[j];
        var sections = sectionsArray[sectionKey];
        var decoupled = decoupleKey(sectionKey);
        var reqStr = decoupled.str;
        var cat = decoupled.cat;
        if((cat=="Normal"&&isValidColumnNumber(reqStr))){
            for (var k = 0; k < sections.length; k++) {
                addRowOfReqInput(tableID, constituentNames[reqStr], cat, sections[k].secStart + 1, sections[k].secEnd + 1, sections[k].val);
            }
        }else if(cat=="URS"||cat=="RSD"||cat=="OnBarDC"||cat=="DC"||cat=="MaxRamp"){
            for (var k = 0; k < sections.length; k++) {
                addRowOfReqInput(tableID, reqStr, cat, sections[k].secStart + 1, sections[k].secEnd + 1, sections[k].val);
            }
        }
    }
}

//Table Utility Functions
function addRowOfReqInput(tableID, reqStr, cat, fromBlock, toBlock, val) {
    var table = document.getElementById(tableID);
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
    var colCount = table.rows[0].cells.length;
    var newCell = row.insertCell(0);
    var t = document.createTextNode(reqStr);
    var s = document.createElement("span");
    s.appendChild(t);
    newCell.appendChild(s);
    newCell = row.insertCell(1);
    t = document.createTextNode(cat);
    s = document.createElement("span");
    s.appendChild(t);
    newCell.appendChild(s);
    for (var i = 2; i < colCount-1; i++) {
        newCell = row.insertCell(i);
        var inp = document.createElement("input");
        if (i == 2) {
            inp.min = '1';
            inp.max = '100';
            inp.type = 'number';
            inp.onkeypress = isNumberKey;
            inp.value = fromBlock;
        } else if (i == 3) {
            inp.min = '1';
            inp.max = '100';
            inp.type = 'number';
            inp.onkeypress = isNumberKey;
            inp.value = toBlock;
        } else {
            inp.min = '0';
            inp.maxlength = "5";
            inp.value = val;
        }
        newCell.appendChild(inp);
    }
    newCell = row.insertCell(colCount - 1);
    var cb = document.createElement("input");
    cb.type = 'checkbox';
    newCell.appendChild(cb);
}

//Table Utility Functions
function decoupleKey(sectionKey){
    var textStr;
    var category;
    if(isNaN(sectionKey)){
        if(sectionKey.length>=4 && (sectionKey.substring(0,3)=="RSD"||sectionKey.substring(0,3)=="URS") && isValidColumnNumber(sectionKey.substring(3, sectionKey.length))){
            textStr = constituentNames[Number(sectionKey.substring(3, sectionKey.length))];
            category = sectionKey.substring(0,3);
        }else{
            if(sectionKey == "rampNum") {
                textStr = "MaxRamp";
                category = "MaxRamp"
            }else if(sectionKey == "onBar") {
                textStr = "OnBarDC";
                category = "OnBarDC"
            }else if(sectionKey == "DC") {
                textStr = "DC";
                category = "DC"
            }else {
                textStr = sectionKey;
                category = "Normal";
            }
        }
    } else{
        textStr = sectionKey;
        category = "Normal";
    }
    return{
        str: textStr,
        cat: category
    }
}

//Table Utility Functions
function getSectionsFromRows(constituentNames, tableID, defVal, defRSDURSVal, defDecCap, defOnBarDC, defMaxRamp, defUnCatVal){
    var sectionsArray = [];
    var virtualGrid = [];
    var table = document.getElementById(tableID);
    //Leave the tableHeader from iteration
    for(var i = 1; i < table.rows.length; i++){
        var row = table.rows[i];
        var cell = row.cells[0];
        var consName = cell.childNodes[0].childNodes[0].textContent;
        var index = consName;
        //get the category of the row
        cell = row.cells[1];
        var cat = cell.childNodes[0].childNodes[0].textContent;
        //Create the virtual grid columns if not present
        if(cat=="Normal" && (constituentNames.indexOf(consName)!= -1)){
            //Get the constituent index in constituentNames array
            index = constituentNames.indexOf(consName);
            if(virtualGrid[index] == undefined) {
                virtualGrid[index] = [];
                for(var j=0;j<96;j++){
                    virtualGrid[index].push(defVal);
                }
            }
        } else if(cat=="Normal"){
            //Not needed
            index = consName;
            if(virtualGrid[index] == undefined) {
                virtualGrid[index] = [];
                for(var j=0;j<96;j++){
                    virtualGrid[index].push(defUnCatVal);
                }
            }
        } else if(cat=="RSD"||cat=="URS"){
            index = cat+constituentNames.indexOf(consName);
            if(virtualGrid[index] == undefined) {
                virtualGrid[index] = [];
                for(var j=0;j<96;j++){
                    virtualGrid[index].push(defRSDURSVal);
                }
            }
        } else if(cat=="DC"){
            index = cat;
            if(virtualGrid[index] == undefined) {
                virtualGrid[index] = [];
                for(var j=0;j<96;j++){
                    virtualGrid[index].push(defDecCap);
                }
            }
        } else if(cat=="OnBarDC"){
            index = "onBar";
            if(virtualGrid[index] == undefined) {
                virtualGrid[index] = [];
                for(var j=0;j<96;j++){
                    virtualGrid[index].push(defOnBarDC);
                }
            }
        } else if(cat=="MaxRamp"){
            index = "rampNum";
            if(virtualGrid[index] == undefined) {
                virtualGrid[index] = [];
                for(var j=0;j<96;j++){
                    virtualGrid[index].push(defMaxRamp);
                }
            }
        } else{
            //Unexpected column category return false
            continue;
        }
        //Now fill the values into the virtual grid
        cell = row.cells[2];
        var fromBlock = cell.childNodes[0].value - 1;
        cell = row.cells[3];
        var toBlock = cell.childNodes[0].value - 1;
        cell = row.cells[4];
        var reqVal = cell.childNodes[0].value;
        for(var k = fromBlock;k<=toBlock;k++){
            var column = virtualGrid[index];
            column[k] = reqVal;
        }
    }
    //Now create and return the sectionsArray from the virtualGrid
    var virtualGridKeys = getKeys(virtualGrid);
    for(var i=0;i<virtualGridKeys.length;i++){
        var columnKey = virtualGridKeys[i];
        var sections = [];
        var sectionStart = 0;
        for (var blkNum = 1; blkNum < 96; blkNum++) {
            if (virtualGrid[columnKey][blkNum] != virtualGrid[columnKey][blkNum - 1]) {
                sections.push({
                    'secStart': sectionStart,
                    'secEnd': blkNum - 1,
                    'val': virtualGrid[columnKey][blkNum - 1]
                });
                sectionStart = blkNum;
            }
        }
        sections.push({
            'secStart': sectionStart,
            'secEnd': 95,
            'val': virtualGrid[columnKey][95]
        });
        //sectionsArray.push(sections);
        sectionsArray[columnKey] = sections;
    }
    return sectionsArray;
}

//Table Utility Functions
function validateReqTable(tableID){
    var table = document.getElementById(tableID);
    var alertComment = {};
    alertComment.str = "";
    var isValid;
    resetTableRowsColor(table);
    for(var i = 1; i < table.rows.length; i++) {
        var row = table.rows[i];
        var cell = row.cells[0];
        var consName = cell.childNodes[0].childNodes[0].textContent;
        //Get the category of the row
        cell = row.cells[1];
        var cat = cell.childNodes[0].childNodes[0].textContent;
        //For unknown category value
        if(!(cat=="Normal"||cat=="RSD"||cat=="URS"||cat=="OnBarDC"||cat=="DC"||cat=="MaxRamp")){
            alertAdd(alertComment,'Unknown category value at row ' + i + ' of RequisitionInput Table.');
            colorTableRow(table, i);
        }
        cell = row.cells[2];
        var fromBlock = cell.childNodes[0].value;
        //For non numeric fromBlock validation
        if(isNaN(fromBlock)){
            alertAdd(alertComment,'Non Numeric From block value at row ' + i + ' of RequisitionInput Table.');
            colorTableRow(table, i);
        }
        cell = row.cells[3];
        var toBlock = cell.childNodes[0].value;
        //For non numeric toBlock validation
        if(isNaN(toBlock)){
            alertAdd(alertComment,'Non Numeric To block value at row ' + i + ' of RequisitionInput Table.');
            colorTableRow(table, i);
        }
        cell = row.cells[4];
        var reqVal = cell.childNodes[0].value;
        //For null cell value validation
        if (!reqVal) {
            alertAdd(alertComment,'Null Requisition values at row ' + i + ' of RequisitionInput Table.');
            colorTableRow(table, i);
            //return false;
        }
        //For cell value validation
        if(cat=="Normal"){
            isValid = reqVal.match(/^\d+(\.\d+)?\p$/i) || reqVal.match(/^\FULL$/i) || reqVal.match(/^[+]?\d+(\.\d+)?$/i);
        } else if(cat=="URS"||cat=="RSD"){
            isValid = reqVal.match(/^\d+(\.\d+)?\p$/i) || reqVal.match(/^\YES$/i) || reqVal.match(/^[+]?\d+(\.\d+)?$/i);
        } else if(cat=="DC"||cat=="OnBarDC"||cat=="MaxRamp"){
            isValid = reqVal.match(/^\d+(\.\d+)?\p$/i) || reqVal.match(/^[+]?\d+(\.\d+)?$/i);
        }
        if(isNaN(reqVal)){
            //Setting the input to uppercase
            row.cells[4].childNodes[0].value = reqVal.toUpperCase();
        }
        if (!isValid) {
            alertAdd(alertComment,'Invalid values at row ' + i + ' of RequisitionInput Table.');
            colorTableRow(table, i);
            //return false;
        }
        //from block <  to block
        if (Number(fromBlock) > Number(toBlock)) {
            alertAdd(alertComment,'From value > TO value at row ' + i + ' of RequisitionInput Table.');
            colorTableRow(table, i);
            //return false;
        }
        //from block &  to block belong to [1,96]
        if ((Number(fromBlock) < 1) || (Number(fromBlock) > 96) || (Number(toBlock) < 1) || (Number(toBlock) > 96)) {
            alertAdd(alertComment,'From value or To value not in limits at row ' + i + ' of RequisitionInput Table');
            colorTableRow(table, i);
            //return false;
        }
    }
    if(alertComment.str.length != 0){
        alert(alertComment.str+'Invalid values are not allowed');
        return false;
    }
    return true;
}

//Table Utility Functions
function colorTableRow(table, i){
    $(table.rows[i]).addClass("redError");
}

//Table Utility Functions
function resetTableRowsColor(table){
    for(var i=1;i<table.rows.length;i++){
        $(table.rows[i]).removeClass("redError");
    }
}