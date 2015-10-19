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
function fetchGenNames() {
    var genNames;
    genNames = ["CGPL", "GANDHAR", "KAWAS", "KSTPS1", "KSTPS3", "SASAN", "SIPAT", "SSP", "VSTPS1", "VSTPS2", "VSTPS3", "VSTPS4"];
    return genNames;
}

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
    var index = document.getElementById("genList").value;
    //alert(index);
    //Scroll to the generator detail section:
    $('html, body').animate({
        scrollTop: $('#genDetailSlave').offset().top + 'px'
    }, 'fast');
}
function decorateGenList(select,array) {
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