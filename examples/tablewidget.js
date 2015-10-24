//All Table Routines
function showhide(el) {
    //Toggle Display button for the table
    var div = findSibling(el, "hidingClass");
    if (div.style.display !== "none") {
        div.style.display = "none";
    } else {
        div.style.display = "block";
    }
}

function findSibling(el, cls) {
    while (!el.classList.contains(cls)) {
        el = el.nextElementSibling;
    }
    return el;
}

function findPrevSibling(el, cls) {
    while (!el.classList.contains(cls)) {
        el = el.previousElementSibling;
    }
    return el;
}

function isNumberKey(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

//Add Row to the tables of input requisitions and rsd and urs tables
function addRow(el) {
    var table = findPrevSibling(el, "tableInputClass");
    var rowCount = table.rows.length;
    var selectmenu = findPrevSibling(el, "selectAbsorb");
    var chosenval = selectmenu.options[selectmenu.selectedIndex].text;
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
        t.min = '1';
        t.maxlength = "5";
        t.value = '';
        if (i != colCount - 2) {
            t.type = 'number';
            t.onkeypress = isNumberKey;
            t.min = '1';
            t.max = '100';
        }
        newcell.appendChild(t);
    }
    newcell = row.insertCell(colCount - 1);
    var cb = document.createElement("input");
    cb.type = 'checkbox';
    newcell.appendChild(cb);
    //row inserted in to the table
}

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

function deleteRow(el) {
    try {
        var table = findPrevSibling(el, "tableInputClass");
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