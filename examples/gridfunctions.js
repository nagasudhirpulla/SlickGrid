/**
 * Created by PSSE on 10/24/2015.
 */
function validateGrid() {
    //ToDo validate grid dynamically using on cellchange listener
    for (var i = 0; i < 96; i++) {
        //Validating the data values of the grid here...
        //i is iterator for the row i ...
        var d = (data[i]);
        var cellval;
        //validating constituent columns
        for (var j = 0; j < constituentNames.length; j++) {
            //j is iterator the column j ...
            //Validating the data value for the cell i,j(row,column)
            cellval = d[j];
            //check if it is a number
            if (typeof cellval == "number") {
                //No Validation required
            } else {
                var isValid = cellval.match(/^[+]?\d+(\.\d+)?$/i);
                if (!isValid) {
                    alert('Invalid values at Block ' + (i + 1) + 'of the Constituent ' + constituentNames[j] + '. Invalid values not allowed');
                    return false;
                } else {
                    //if valid then capitalize all letters.Design  decision
                    d[j] = cellval.toUpperCase();
                }
            }
        }
    }
    return true;
}
