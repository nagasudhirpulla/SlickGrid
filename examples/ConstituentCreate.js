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
    var ConsNamesArray = fetchConsNames();
    var list = document.getElementById("consList");
    //POPULATE THE LIST WITH THE NAMES
    decorateConsList(list,ConsNamesArray);
}