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
function createSectionSummaryTableRow(sectionsArrayIndex, sectionsArray, constituentNames, summaryTable) {
    var columnData = sectionsArray[sectionsArrayIndex];
    var columnCategory = columnData.columnCategory;
    var memberID = columnData.columnKey;
    var sections = columnData.columnSections;
    var textStr;
    if(columnCategory == "Normal"){
        textStr = constituentNames[constituentIDs.indexOf(memberID)];
    } else if(columnCategory == "RSD" || columnCategory == "URS"){
        textStr = constituentNames[constituentIDs.indexOf(memberID)]+"_"+columnCategory;
    } else if(columnCategory == "MaxRamp"){
        textStr = columnCategory;
    } else if(columnCategory == "OnBarDC"){
        textStr = columnCategory;
    } else if(columnCategory == "DC"){
        textStr = columnCategory;
    }
    /*
    if(isNaN(sectionsArrayIndex)){
        if(sectionsArrayIndex.length>=4 && (sectionsArrayIndex.substring(0,3)=="RSD"||sectionsArrayIndex.substring(0,3)=="URS") && isValidColumnNumber(sectionsArrayIndex.substring(3, sectionsArrayIndex.length))){
            textStr = constituentNames[Number(sectionsArrayIndex.substring(3, sectionsArrayIndex.length))] + sectionsArrayIndex.substring(0,3);
        }else{
            if(sectionsArrayIndex == "rampNum") {
                textStr = "MaxRamp";
            }else if(sectionsArrayIndex == "onBar") {
                textStr = "OnBarDC";
            }else {
                textStr = sectionsArrayIndex;
            }
        }
    } else{
        textStr = constituentNames[sectionsArrayIndex];
    }
    */
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