/**
 * Created by PSSE on 11/19/2015.
 */
/**
 * Created by PSSE on 11/18/2015.
 */
//On loading of the html page do the following
$(function() {
    $("#datePicker").datepicker({
        dateFormat: "dd-mm-yy",
        onSelect:function(dateText) {
            //alert("Selected date: " + dateText + "; input's current value: " + this.value);
        }
    });
    var today = new Date();
    var dd = ("0" + (today.getDate())).slice(-2);
    var mm = ("0" + (today.getMonth()+1)).slice(-2);
    var yyyy = today.getFullYear();
    $("#datePicker").attr("value", dd + '-' + mm + '-' + yyyy);
    document.getElementById("timePicker").value = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
});

function refreshtime()
{
    var today = new Date();
    document.getElementById("timePicker").value = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
}

function startEdit(elem){
    var rowElem = elem.parentElement.parentElement;
    if(elem.children[0].className == "glyphicon glyphicon-pencil")
    {
        rowElem.style.backgroundColor = 'red';
        rowElem.style.color = 'white';
        elem.innerHTML = "<span class='glyphicon glyphicon-remove'></span>  EDIT";
        elem.style.color = 'initial';
        //Add the row to update list
        addToUpdateList(rowElem);
    }
    else{
        rowElem.style.backgroundColor = 'initial';
        rowElem.style.color = 'initial';
        elem.innerHTML = "<span class='glyphicon glyphicon-pencil'></span>  EDIT";
        //TODO remove the row from update list
        removeFromUpdateList(rowElem);
    }
}

function removeFromUpdateList(rowElem){
    //Find the table row with the code of the row
    var tableBody = document.getElementById("updateTable").getElementsByTagName('tbody')[0];
    var wantedDate = rowElem.children[0].textContent;
    var wantedCode = rowElem.children[1].textContent;
    //find the table rowIndex that has the code
    for(var i=0;i<tableBody.rows.length;i++){
        var tableDate = tableBody.rows[i].children[0].textContent;
        var tableCode = tableBody.rows[i].children[1].textContent;
        if(tableDate == wantedDate && tableCode == wantedCode){
            tableBody.deleteRow(i);
            break;
        }
    }
}

function addToUpdateList(rowElem){
    var tableBody = document.getElementById("updateTable").getElementsByTagName('tbody')[0];
    //Check if already edit row exists
    var wantedDate = rowElem.children[0].textContent;
    var wantedCode = rowElem.children[1].textContent;
    //find the table rowIndex that has the code
    for(var i=0;i<tableBody.rows.length;i++){
        var tableDate = tableBody.rows[i].children[0].textContent;
        var tableCode = tableBody.rows[i].children[1].textContent;
        if(tableDate == wantedDate && tableCode == wantedCode){
            return false;
        }
    }
    // Insert a row in the table at the last row
    var newRow   = tableBody.insertRow(tableBody.rows.length);
    var newCell, newText;
    for(var i=0;i<2;i++){
        // Insert a cell in the row at index 0
        newCell  = newRow.insertCell(newRow.cells.length);
        // Append a text node to the cell
        newText  = document.createTextNode(rowElem.children[i].innerHTML);
        newCell.appendChild(newText);
    }
    //Insert Input Fields
    for(i=0;i<5;i++) {
        // Insert issue time
        newCell = newRow.insertCell(newRow.cells.length);
        // Append a text node to the cell
        newText = document.createElement("input");
        newText.value = rowElem.children[2+i].innerHTML;
        newCell.appendChild(newText);
    }
    // Insert updateButton
    newCell = newRow.insertCell(newRow.cells.length);
    // Append a text node to the cell
    newText = document.createElement("button");
    var span = document.createElement("span");
    span.className = "glyphicon glyphicon-ok";
    newText.appendChild(span);
    newText.appendChild(document.createTextNode(" UPDATE"));
    //newText.className = "btn";
    newCell.appendChild(newText);
    // Insert Cancel Button
    newCell = newRow.insertCell(newRow.cells.length);
    // Append a text node to the cell
    newText = document.createElement("button");
    var span = document.createElement("span");
    span.className = "glyphicon glyphicon-remove";
    newText.appendChild(span);
    newText.appendChild(document.createTextNode(" CANCEL"));
    newText.onclick = cancelUpdate;
    //newText.className = "btn";
    newCell.appendChild(newText);
}

function cancelUpdate(){
    //alert(this.innerHTML);
    var rowElem = this.parentElement.parentElement;
    var wantedDate = rowElem.children[0].textContent;
    var wantedCode = rowElem.children[1].textContent;
    var table = this.parentElement.parentElement.parentElement;
    table.deleteRow(this.parentElement.parentElement.rowIndex-1);
    //virtually press the cancel button of the code list
    var tableBody = document.getElementById("MainList").getElementsByTagName("tbody")[0];
    //find the row with specified row codes
    //find the table rowIndex that has the code
    for(var i=0;i<tableBody.rows.length;i++){
        var tableDate = tableBody.rows[i].children[0].textContent;
        var tableCode = tableBody.rows[i].children[1].textContent;
        if(tableDate == wantedDate && tableCode == wantedCode){
            if(tableBody.rows[i].getElementsByTagName("button")[0].getElementsByTagName("span")[0].className == "glyphicon glyphicon-remove"){
                tableBody.rows[i].getElementsByTagName("button")[0].click();
            }
            break;
        }
    }
}
//TODOS remove underlines on href of footer
