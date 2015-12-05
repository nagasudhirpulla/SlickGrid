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
function getSectionsFromRows(constituentNames, tableID){
    var sectionsArray = [];
    //TODO algorithm to create sections from table
    var table = document.getElementById(tableID);
    for(var i = 1; j < table.rows.length - 1; i++){
        var row = table.rows[i];
        //get the constituent index in constituentNames array
        var cell = row.cells[0];
        var consName = cell.childNodes[0].childNodes[0];
        //get the category of the row
        cell = row.cells[1];
        var cat = cell.childNodes[0].childNodes[0];
        if(cat=="Normal"){
            
        } else if(cat=="Normal"){
            
        } else if(cat=="RSD"||"URS"){
            
        } else if(cat=="DC"){
            
        } else if(cat=="OnBarDC"){
            
        } else if(cat=="MaxRamp"){
            
        }
    }
    
}

}
