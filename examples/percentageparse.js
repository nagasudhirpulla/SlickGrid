/**
 * Created by PSSE on 10/21/2015.
 */
function parseIt(){
    var str = document.getElementById("percentageParseInput").value;
    var results = parsePercentages(str);
    alert(results[0]+"\n"+results[1]);
}

function parsePercentages(str){
    var alertStr = '';
    var parseStr = str.replace(/ /g,"");
    var colonIndices = [];
    for(var i=0;i<parseStr.length;i++)
    {
        if(parseStr[i]===":") colonIndices.push(i);
    }
    //Check for one colon
    if(!colonIndices.length == 1){
        alertStr +=  "Number of colons should only be one...";
        return [false, alertStr];
    }
    else{
        var leftStr = parseStr.substring(0,colonIndices[0]);
        var rightStr = parseStr.substring(colonIndices[0]+1,parseStr.length);
        var cons = leftStr.split(',');
        var percentages = rightStr.split(',');
        //Check for number of constituents equal to number of percentage values...
        if(cons.length != percentages.length){
            alertStr +=  "Number of constituents not equal to number of percentages...\n";
            return [false, alertStr];
        }
        //Find the indices of non numeric percentages
        var nanList = [];
        for(var i=0;i<percentages.length;i++){
            if(isNaN(percentages[i])){
                nanList.push(i);
            }
        }
        if(nanList.length != 0){
            alertStr += "The percentages of constituents at positions ";
            for(var i=0;i<nanList.length;i++){
                alertStr += (nanList[i]+1)+", ";
            }
            alertStr += "of the string input are not numeric...\n";
            return [false, alertStr];
        }
        //Finally converting string percentages to numbers
        var percentageSum = 0;
        for(var i=0;i<percentages.length;i++){
            percentages[i] = +percentages[i];
            percentageSum += percentages[i];
        }
        if(Math.abs(percentageSum-100)>=0.05)
        {
            alertStr += "The percentages of constituent share are not adding up to 100+-0.05"
            return [false, alertStr];
        }
        return [cons,percentages];
    }
}