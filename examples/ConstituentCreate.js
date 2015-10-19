var rootURL = "http://localhost/api/names";

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

function fetchConsNames() {
    var consNames;
    consNames = ["CSEB","DD","DNH","GUVNL","JNK-NR","MPSEB","MSEB"];
    return consNames;
}

function fetchConsNamesAjax(){
    console.log('Fetching the Constituents names...');
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
            var selList = document.getElementById("consList");
            decorateConsList(selList,namesListArray);
        }
    });
}

function decorateConsList(select,array) {
    for(var i = 0; i < array.length; i++) {
        var option = new Option(array[i], i);
        select.options[select.options.length] = option;

        //Add a Class:
        option.className = option.className+" btn-sm btn-default";
    }
}

//On loading of the html page do the following
$(function(){
    populateConsList();
});

function populateConsList(){
    /*var ConsNamesArray = fetchConsNames();
    var list = document.getElementById("consList");
    //POPULATE THE LIST WITH THE NAMES
    decorateConsList(list,ConsNamesArray);*/
    fetchConsNamesAjax();
}