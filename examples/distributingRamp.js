function Catagorise() {
	//Revisions of all the cells in a particular row
	//var rowRevs = [1, 1, 1, 3, 4, 5, 4, 3];
	var rowRevs = document.getElementById('RevsIn').value.split(",");
	//An object created to catagorise the row cells according to the revision number in descending order
	var rowRevsCatagorised = segregateColumns(rowRevs);
	//An array initialised which has to contain the rev number present in the row in descending order
	var rowRevsDupExcluded = getRevNumsinDescOrder(rowRevsCatagorised);
	document.getElementById('console').innerHTML = '';
	document.getElementById('console').appendChild(document.createTextNode('Revision_Numbers_Data=' + JSON.stringify(rowRevsCatagorised, null, '\t') + '------' + rowRevsDupExcluded));
	//Now we have the  revision numbers ordered and categorised
	maxRampOfRow = document.getElementById('maxRamp').value;
	var rowPrevRevVals = document.getElementById('prevRevRow').value.split(",");
	var rowRevVals = document.getElementById('revRow').value.split(",");
	//sacrificing from bigger revvision till smallest revision
	for (var i = 0; i < rowRevsDupExcluded.length; i++) {

	}
}

function segregateColumns(rowRevs) {
	var rowRevsCatagorised = {};
	for (var i = 0; i < rowRevs.length; i++) {
		if (!rowRevsCatagorised.hasOwnProperty(rowRevs[i]))
			rowRevsCatagorised[rowRevs[i]] = {
				'cols': new Array()
			};
		rowRevsCatagorised[rowRevs[i]].cols.push(i);
	}
	return rowRevsCatagorised;
}

function getRevNumsinDescOrder(rowRevsCatagorised) {
	var rowRevsDupExcluded = [];
	for (var property in rowRevsCatagorised) {
		if (rowRevsCatagorised.hasOwnProperty(property)) {
			rowRevsDupExcluded.push(property.toString());
		}
	}
	return rowRevsDupExcluded.sort(function(a, b) {
		return b - a
	});
}
