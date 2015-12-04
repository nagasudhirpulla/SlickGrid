//Sections Utility Function
function createSectionSummaryTable(summaryTableID, sectionsArray) {
    var summaryTable = document.getElementById(summaryTableID);
    summaryTable.innerHTML = '';
    var sectionsArrayKeys = getKeys(sectionsArray);
    for (var j = 0; j < sectionsArrayKeys.length; j++) {
        createSectionSummaryTableRow(sectionsArrayKeys[j],sectionsArray, constituentNames, summaryTable);
    }
    summaryTable.border = '1';
    summaryTable.width = '200px';
}

//Sections Utility Function
function createSectionSummaryTableRow(j, sectionsArray, constituentNames, summaryTable) {
    var sections = sectionsArray[j];
    var textStr;
    if(isNaN(j)){
        if(j.length>=4 && (j.substring(0,3)=="RSD"||j.substring(0,3)=="URS") && isValidColumnNumber(j.substring(3, j.length))){
            textStr = constituentNames[Number(j.substring(3, j.length))] + j.substring(0,3);
        }else{
            if(j == "rampNum") {
                textStr = "MaxRamp";
            }else if(j == "onBar") {
                textStr = "OnBarDC";
            }else {
                textStr = j;
            }
        }
    } else{
        textStr = constituentNames[j];
    }
    for (var i = 0; i < sections.length; i++) {
        var texts = [textStr, (sections[i])['secStart'] + 1, (sections[i])['secEnd'] + 1, (sections[i])['val']];
        var tr = document.createElement('tr');
        //
        for(var j=0;j<texts.length;j++){
            var td0 = document.createElement('td');
            td0.appendChild(document.createTextNode(texts[j]));
            td0.style.padding = "4px";
            tr.appendChild(td0);
        }
        //
        /*
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
         */
        summaryTable.appendChild(tr);
    }
}

//Common Utility Function
function isValidColumnNumber(str){
    return /^(\d*)$/.test(str);
}