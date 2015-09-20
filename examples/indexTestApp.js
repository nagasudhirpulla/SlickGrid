databaseOpen(function(){
	databaseRevsCount();
});


function createnew1()
{
	dataObj = {str:document.getElementById("textinput").value};
	databaseRevsAdd(count+1,dataObj,function(){
			count = count + 1;
                alert("Revision "+count+"created with the saved revision data of Revision "+(count-1)+"...");
            });
}
function loadrev()
{
	loadRevision(+document.getElementById("textinput").value, function(dataObj){
		console.log(dataObj.revData);
	});
}

function createnew(){
	loadRevision(count+1,function(){

	});
}
