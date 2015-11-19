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

//TODOS remove underlines on href of footer
