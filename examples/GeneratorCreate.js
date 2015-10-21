var rootURL = "http://localhost/api/generators";
var consRootURL = "http://localhost/api/names";
function  Skelitise(){
    var elems = document.body.getElementsByTagName("*");
    if(window.getComputedStyle(document.body).borderLeftWidth == "1px"){
        for(var i = 0; i < elems.length; i++) {
            elems[i].style.border = "none";
            document.body.style.border = "none";
        }
    }
    else{
        for(var i = 0; i < elems.length; i++) {
            elems[i].style.border = "1px solid black";
            document.body.style.border = "1px solid black";
        }
    }
}
function fetchGenNames() {
    var genNames;
    genNames = ["CGPL", "GANDHAR", "KAWAS", "KSTPS1", "KSTPS3", "SASAN", "SIPAT", "SSP", "VSTPS1", "VSTPS2", "VSTPS3", "VSTPS4"];
    return genNames;
}

var indexOf = function(needle) {
    if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }
    return indexOf.call(this, needle);
};

function fetchGenNamesAjax() {
    console.log('Fetching the generators names...');
    $.ajax({
        type: 'GET',
        url: rootURL,
        dataType: "json", // data type of response
        success: function(data) {
            // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var list = data == null ? [] : (data.names instanceof Array ? data.names : [data.names]);
            console.log(JSON.stringify(list));
            var namesListArray = [];
            for(var i=0;i<list.length;i++){
                namesListArray.push(list[i].name);

            }
            var selList = document.getElementById("genList");
            decorateGenList(selList,namesListArray);
        }
    });
}

function decorateSlave() {
    var gen = document.getElementById("genList").options[document.getElementById("genList").selectedIndex].text;
    //alert(index);
    //Scroll to the generator detail section:
    $('html, body').animate({
        scrollTop: $('#genDetailSlave').offset().top + 'px'
    }, 'fast');
    console.log('Fetching the Generator data...');
    $.ajax({
        type: 'GET',
        url: rootURL+'/'+gen,
        dataType: "json", // data type of response
        success: function(data) {
            document.getElementById('disName').innerHTML = data.name;
            document.getElementById('disRamp').innerHTML = data.ramp;
            document.getElementById('disDC').innerHTML = data.dc;
            document.getElementById('disOnBar').innerHTML = data.onbar;
        }
    });
}
function decorateGenList(select,array) {
    select.options.length = 0;
    for(var i = 0; i < array.length; i++) {
        var option = new Option(array[i], i);
        select.options[select.options.length] = option;

        //Add a Class:
        option.className = option.className+" btn-sm btn-default";
    }
}

/**
 * Created by PSSE on 10/13/2015.
 */

//On loading of the html page do the following
$(function(){
    populateGenList();
});

function populateGenList(){
    fetchGenNamesAjax();
    //POPULATE THE LIST WITH THE NAMES
}

/*
 Add a generator to the database
 * */
function addGen(){
    if(!confirm("Add a new Generator???")){
        return false;
    }
    var str = document.getElementById("percentageParseInput").value;
    var parsedPercentages = parsePercentages(str.toUpperCase());
    //Check for parsing errors
    if(parsedPercentages[0] === false)
    {
        alert(parsedPercentages[1]);
        return false;
    }
    var cons = parsedPercentages[0];
    var conIDs = [];
    var percentages = parsedPercentages[1];
    console.log('fetching all Constituents');
    $.ajax({
        type: 'GET',
        url: consRootURL,
        dataType: "json", // data type of response
        success: function(data) {
            // JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
            var list = data == null ? [] : (data.names instanceof Array ? data.names : [data.names]);
            console.log(JSON.stringify(list));
            var namesListArray = [];
            for(var i=0;i<list.length;i++){
                namesListArray.push(list[i].name);
            }
            //Check if constituents specified are present in the database
            var alertStr = "The Constituents ";
            for(var i=0;i<cons.length;i++){
                var notPresentCons = false;
                var index = indexOf.call(namesListArray, cons[i]);
                if(index === -1)
                {
                    notPresentCons = true;
                    alertStr += cons[i]+", "
                }
                else{
                    conIDs.push(list[index].id)
                }
            }
            if(notPresentCons){
                alert(alertStr+"are not present in the constituent database...");
                return false;
            }
            //Now Constituent ids along with percentages are present in conIDs and percentages arrays
            //Now Proceed to adding the generator name to the database.
            addGenNameWithPercentages(conIDs,percentages);
        }
    });
}

/*
 Delete a generator from the database
 * */
function deleteGen(){
    if(!confirm("Delete the selected Generator???")){
        return false;
    }
    console.log('deleting a Generator');
    $.ajax({
        type: 'DELETE',
        url: rootURL + '/' + document.getElementById("genList").options[document.getElementById("genList").selectedIndex].text,
        success: function(data, textStatus, jqXHR){
            fetchGenNamesAjax();
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert('deleteName error: '+textStatus);
        }
    });
}

function addGenNameWithPercentages(conIDs,percentages) {
    console.log('creating a Generator');
    $.ajax({
        type: 'POST',
        url: rootURL,
        dataType: "json", // data type of response
        data: JSON.stringify({
            'name': document.getElementById("name").value.toUpperCase(),
            'ramp': document.getElementById("ramp").value,
            'dc': document.getElementById("dc").value,
            'onbar': document.getElementById("onbar").value
        }),
        success: function (data, textStatus, jqXHR) {
            fetchGenNamesAjax();
            addGeneratorShares(data,conIDs,percentages);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('addGenerator error: ' + textStatus);
        }
    });
}

function addGeneratorShares(data,conIDs,percentages){
    console.log("Creating the Percentage share columns for Generator Constituents");
    //Preparing the json object to insert in the constshares table of the database.
    var genIDsArray = [];
    var generatorID = data.name_id;
    for(var i=0;i<conIDs.length;i++){
        genIDsArray.push(generatorID);
    }
    var shareJSON = {"genIDs":genIDsArray, "conIDs":conIDs, "percentages":percentages};
    $.ajax({
        type: 'POST',
        url: rootURL+'/'+document.getElementById("name").value.toUpperCase(),
        dataType: "json", // data type of response
        data: JSON.stringify(shareJSON),
        success: function (data, textStatus, jqXHR) {
            document.getElementById("name").value = '';
            document.getElementById("ramp").value = '';
            document.getElementById("dc").value = '';
            document.getElementById("onbar").value = '';
            document.getElementById("percentageParseInput").value = '';
            //Select the added generator
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('addGeneratorShares error: ' + textStatus);
        }
    });
}
