//Server Utility Function
function convertRevDataToSectionsArray(fetchedRevData){
    var sectionsArrayFetched = [];
    for (var i = 0; i < fetchedRevData.length; i++) {
        var sectionObject = fetchedRevData[i];
        var sectionsArrayIndex;
        if(sectionObject.cat == 'n'||sectionObject.cat == 'r'||sectionObject.cat == 'u'||sectionObject.cat == 'd'||sectionObject.cat == 'on'||sectionObject.cat == 'ra') {
            if (sectionObject.cat == 'n') {
                //Create a normal share section
                var memberID = sectionObject.p_id;
                var columnCategory = "Normal";
                sectionsArrayIndex = sectionObject.p_id + "_" + "Normal";
            }
            else if (sectionObject.cat == 'r') {
                //Create a RSD share section
                memberID = sectionObject.p_id;
                columnCategory = "RSD";
                sectionsArrayIndex = sectionObject.p_id + "_" + "RSD";
            }
            else if (sectionObject.cat == 'u') {
                //Create a RSD share section
                memberID = sectionObject.p_id;
                columnCategory = "URS";
                sectionsArrayIndex = sectionObject.p_id + "_" + "URS";
            }
            else if (sectionObject.cat == 'd') {
                //Create a RSD share section
                memberID = 'dc';
                columnCategory = "DC";
                sectionsArrayIndex = "dc";
            }
            else if (sectionObject.cat == 'on') {
                //Create a RSD share section
                memberID = 'onBar';
                columnCategory = "OnBarDC";
                sectionsArrayIndex = "onBar";
            }
            else if (sectionObject.cat == 'ra') {
                //Create a RSD share section
                memberID = 'rampNum';
                columnCategory = "MaxRamp";
                sectionsArrayIndex = 'maxRamp';
            }
            if (!(sectionsArrayFetched[sectionsArrayIndex] instanceof Array)) {
                sectionsArrayFetched[sectionsArrayIndex] = [];
                sectionsArrayFetched[sectionsArrayIndex]["columnKey"] = memberID;
                sectionsArrayFetched[sectionsArrayIndex]["columnCategory"] = columnCategory;
            }
            sectionsArrayFetched[sectionsArrayIndex][memberID]['columnSections'].push({
                'secStart': sectionObject.from_b - 1,
                'secEnd': sectionObject.to_b - 1,
                'val': sectionObject.val
            });
        }
        else{
            //TODO handle this separately
            if(sectionObject.cat == 'comm'){
                //Create a comment section
                sectionsArrayFetched['comment'] = sectionObject.val;
            }
        }
    }
    return sectionsArrayFetched;
}

//Server Utility Function
function getCommentAndTimeOfOriginFromDataFetched(dataFetched){
    var result = {};
    result.comment = dataFetched.comment;
    result.TO = dataFetched.TO;
    return result;
}

//Server Utility Function
function convertSectionsArrayToSeverJSON(genID, sectionsArray, constituentIDs){
    //Preparing data to post
    var cats = [];
    var conIDs = [];
    var fromBlocks = [];
    var toBlocks = [];
    var vals = [];
    //converting sections to a json format acceptable by the server api
    var sectionsArrayKeys = getKeys(sectionsArray);
    for (var j = 0; j < sectionsArrayKeys.length; j++) {
        var sectionsArrayIndex = sectionsArrayKeys[j];
        var columnData = sectionsArray[sectionsArrayIndex];
        var columnCategory = columnData.columnCategory;
        var memberID = columnData.columnKey;
        var sections = columnData.columnSections;
        if(columnCategory=="Normal"||columnCategory=="RSD"||columnCategory=="URS"){
            var categoryChar;
            switch(columnCategory){
                case "Normal":
                    categoryChar = "n";
                    break;
                case "RSD":
                    categoryChar = "r";
                    break;
                case "URS":
                    categoryChar = "u";
                    break;
                default :
                    categoryChar = columnCategory;
                    break;
            }
            for (var k = 0; k < sections.length; k++) {
                cats.push(categoryChar);
                conIDs.push(memberID);
                fromBlocks.push(sections[k].secStart + 1);
                toBlocks.push(sections[k].secEnd + 1);
                vals.push(sections[k].val);
            }
        }else if(columnCategory=="OnBarDC"||columnCategory=="DC"||columnCategory=="MaxRamp"){
            for (var k = 0; k < sections.length; k++) {
                switch(columnCategory){
                    case "OnBarDC":
                        categoryChar = "on";
                        break;
                    case "DC":
                        categoryChar = "d";
                        break;
                    case "MaxRamp":
                        categoryChar = "ra";
                        break;
                    default :
                        //TODO tackle this
                        break;
                }
                for (var k = 0; k < sections.length; k++) {
                    cats.push(categoryChar);
                    conIDs.push(genID);
                    fromBlocks.push(sections[k].secStart + 1);
                    toBlocks.push(sections[k].secEnd + 1);
                    vals.push(sections[k].val);
                }
            }
        }
    }
    //Saving the comment of the revision
    cats.push('comm');
    conIDs.push(genID);
    fromBlocks.push(1);
    toBlocks.push(96);
    vals.push(document.getElementById("commentInput").value);
    return {
        cats: cats,
        conIDs: conIDs,
        fromBlocks: fromBlocks,
        toBlocks: toBlocks,
        vals: vals
    }
}