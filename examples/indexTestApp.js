databaseOpen(function(){
	databaseRevsCount();
});


function createnew()
{
	dataObj = {str:document.getElementById("textinput").value};
	addNewRevision(function(revdata){
			console.log("Revision "+count+" created...");
			console.log(revdata);//logically revData = dataObj
            },dataObj);
}
function loadrev()
{
	loadRevision(+document.getElementById("textinput").value, function(record){
		console.log(record.revData);
	},+document.getElementById("textinput").value);
}

function updaterev(){
	var modifyFunction = function(oldRec){
		oldRec.revData = Date.now();
		return oldRec;
	};
	var onCompleteFunction = function(updatedRec){
		console.log(updatedRec);
	};
	updateRev(+document.getElementById("textinput").value,modifyFunction,onCompleteFunction);
}

function deleterev(){
	deleteRev(+document.getElementById("textinput").value);
}
