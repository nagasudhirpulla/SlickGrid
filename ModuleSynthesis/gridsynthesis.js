//On page load...
var grid;
var data;
var genRamp;
var genDecCap;
var genOnBar;
var constituentNames;
var columns;
var options;

$(function() {
    initialiseGrid(grid, data, genRamp, genDecCap, genOnBar, constituentNames, columns, options);
});
function initialiseGrid(grid, data, genRamp, genDecCap, genOnBar, constituentNames, columns, options){
    console.log("Initialising the grid");
    //Set the whole grid to default values, rsd urs not included
    for (var i = 0; i < 96; i++) {
        //Setting the data values of the grid here...
        //i is iterator for the row i or block i+1...
        var d = (data[i] = {});
        d["SNo"] = i + 1;
        d["rampNum"] = genRamp;
        d["DC"] = genDecCap;
        d["onBar"] = genOnBar;
        d["offBar"] = genDecCap - genOnBar;
        for (var j = 0; j < constituentNames.length; j++) {
            p[j] = 0;
            //j is iterator the column j ...
            //Setting the data value for the cell i,j(row,column) or block i+1,j
            d[j] = 'FULL';
            //Accommodating markRev
            m[j] = 0;
            d['RSD' + j] = 0;
            d['URS' + j] = 'Yes';
        }
        d["avail"] = 0;
        if (i > 0) {
            d["rampedVal"] = 0;
        } else
        {
            d["rampedVal"] = "NA";
        }
    }
    //Building the grid and configuring the grid
    grid = new Slick.Grid("#myGrid", data, columns, options);
    grid.setSelectionModel(new Slick.CellSelectionModel());
    grid.registerPlugin(new Slick.AutoTooltips());
    grid.onCellChanged;
    // set keyboard focus on the grid
    grid.getCanvasNode().focus();
    //enabling the excel style functionality by the plugin
    grid.registerPlugin(new Slick.CellExternalCopyManager(pluginOptions));
    //Things to do on adding a new Row - TODO - not needed coz we dont add new rows other than 96
    grid.onAddNewRow.subscribe(function(e, args) {
        var item = args.item;
        var column = args.column;
        grid.invalidateRow(data.length);
        data.push(item);
        grid.updateRowCount();
        grid.render();
    });
    grid.onHeaderClick.subscribe(headerClick);

}