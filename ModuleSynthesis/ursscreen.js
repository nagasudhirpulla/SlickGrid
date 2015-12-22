//Activity Function
function constituentNamesFetch(){
    console.log('Fetching the Constituents names...');
    $.ajax({
        type: 'GET',
        url: "http://"+localhost+"/api/names",
        dataType: "json", // data type of response
        success: function(data) {
            // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var list = data == null ? [] : (data.names instanceof Array ? data.names : [data.names]);
            console.log(JSON.stringify(list));
            var constituentNames = [];
            var constituentIDs = [];
            for(var i=0;i<list.length;i++){
                constituentNames.push(list[i].name);
                constituentIDs.push(list[i].id);
            }
            setConstituentNames(constituentNames);
            setConstituentIDs(constituentIDs);
            //fetch the generator names
            generatorNamesFetch();
        }
    });
}

//Activity Function
function generatorNamesFetch(){
    console.log('Fetching the generators names...');
    $.ajax({
        type: 'GET',
        url: "http://"+localhost+"/api/generators",
        dataType: "json", // data type of response
        success: function(data) {
            // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var list = data == null ? [] : (data.names instanceof Array ? data.names : [data.names]);
            console.log(JSON.stringify(list));
            var genNames = [];
            var genIDs = [];
            for(var i=0;i<list.length;i++){
                genNames.push(list[i].name);
                genIDs.push(list[i].id);
            }
            setGenIDs(genIDs);
            setGenNames(genNames);
            //Populate the Generator options
            var selList = document.getElementById("genList");
            decorateSelectList(selList,genNames);
            var defGenIndex =0;
            setGenID(genIDs[defGenIndex]);
            genParamsFetch();
        }
    });
}

//Activity Function
function genParamsFetch(){
    console.log('Fetching the generator parameters...');
    var genID = getGenID();
    var genNames = getGenNames();
    var genIDs = getGenIDs();
    $.ajax({
        type: 'GET',
        url: "http://"+localhost+"/api/generators/"+genNames[genIDs.indexOf(genID)],
        dataType: "json",
        success: function(data) {
            setGenRamp(data.ramp);
            setGenDecCap(data.dc);
            setGenOnBar(data.onbar);
            sharesOfGeneratorFetch();
        }
    });
}

//Activity Function
function afterInitialFetch() {
    setGridColumns();
    //Populate the Constituent Options
    var constituentNames = getConstituentNames();
    var selList = document.getElementById("selectReqConst");
    decorateSelectList(selList, constituentNames);
}

//Activity Function
function setGridColumns(){
    var genRamp = getGenRamp();
    var genDecCap = getGenDecCap();
    var genOnBar = getGenOnBar();
    var constituentNames = getConstituentNames();
    var constituentIDs = getConstituentIDs();
    columns = setReqTableColumns(true, true, true);
    grid = initialiseReqGrid("myGrid", genRamp, genDecCap, genOnBar, constituentNames, constituentIDs, columns, options, pluginOptions, headerClick, "FULL", true, 0, true, 'YES', true, 0);
    //Populate the Constituent Options
    var selList = document.getElementById("selectReqConst");
    decorateSelectList(selList,constituentNames);
    //make the columns un editable
    var unEditableColumns  = makeColumnsUneditable(columns);
    //initialise the desired numeric schedule grid
    desiredGrid = initialiseReqGrid("desiredGrid", genRamp, genDecCap, genOnBar, constituentNames, constituentIDs, unEditableColumns, options, pluginOptions, headerClick, "FULL", true, 0, true, 'YES', true, 0);
    //initialise the implemented schedule grid
    implementedGrid = initialiseReqGrid("implementedGrid", genRamp, genDecCap, genOnBar, constituentNames, constituentIDs, columns, options, pluginOptions, headerClick, "FULL", true, 0, true, 'YES', true, 0);
}

//Activity Function
function sharesOfGeneratorFetch(){
    afterInitialFetch();
    var genID = getGenID();
    console.log('Fetching the Generator shares...');
    $.ajax({
        type: 'GET',
        url: "http://"+localhost+"/api/generatorshares/"+genID,
        dataType: "json", // data type of response
        success: function(dataFetched) {
            // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var shares = dataFetched == null ? [] : (dataFetched.shares instanceof Array ? dataFetched.shares : [dataFetched.shares]);
            console.log(JSON.stringify(shares));
            //Changing the percentageData depending on the fetched generator shares
            for (var i = 0; i < shares.length; i++) {
                for (var blkNum = shares[i].from_b - 1; blkNum <= shares[i].to_b - 1; blkNum++) {
                    var constCol = shares[i].p_id;
                    //alert(constCol);
                    var constituentIDs = getConstituentIDs();
                    constCol = constituentIDs.indexOf(constCol);
                    //table.rows[i].cells[3].childNodes[0].value = number in the form of string and no need to convert to number since javascript takes care of it
                    (percentageData[blkNum])[constCol] = shares[i].percentage;
                }
            }
            //TODO reorder constituents array and subsequently the grid after fetching shares so as to send the zero share constituents to the end
            //TODO do SECTIONS implementation for storing the percentageData variable also to save memory
            loadLatestRevisionDB();
        }
    });
}

function decorateGrid(){
    genName = document.getElementById("genList").options[document.getElementById("genList").selectedIndex].text;
    setGenID(genIDs[genNames.indexOf(genName)]);
    genParamsFetch();
}