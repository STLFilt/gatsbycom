
$(window).load(startingSetup);
var xmlns = "http://www.w3.org/2000/svg";
var confusion;
var svgx = $("#svgMaster").offset().left;
var svgy = $("#svgMaster").offset().top;
var dictionary = Array(); // Label's dictionary!
var usedLabels = Array();
var dictOrdered = Array();
var rectHeight = 14;
function startingSetup()
{
	
	dictionaryPrepare();
	
	$.ajax({
		type : "GET",
		url : "matlabInfo.php?infoRequest=confusion",
		dataType : "json",
		async : true,
		cache : false,
		error : function() {
			console.log("error calling for Info!");
			return;
		},
		success : function(result) {
			confusion = result;
			drawConfusion();
		}
	});
	
}

function drawConfusion()
{
	
	var searched = Object.keys(confusion).sort();
	var numSearched = searched.length;
	var found = Object.keys(confusion[searched[0]]).sort();
	if(found[0] == "")
		found = found.splice(1); // there seems to be a "" around
	
	var numFound = found.length;
	var totals = Array.apply(null, Array(searched.length)).map(Number.prototype.valueOf,0);
	var total = 0;
	//for (var i=0; i<searched.length; i++)
	//	totals[searched[i]] = 0;
	
	document.getElementById("svgMaster").setAttribute("width", (numFound+5)*rectHeight+5);
	document.getElementById("svgMaster").setAttribute("height", (numSearched+5)*rectHeight+5);

	newRectangle(0,0,(numFound+5)*rectHeight+5,(numSearched+5)*rectHeight+5,"confusion","none","black");
	
	for (var i=0; i<searched.length; i++)
		for(var j=0; j<found.length; j++)
			{
				totals[i] += confusion[searched[i]][found[j]];
			}
	
	var offset = 1;
	for(var i=1; i<numFound; i++) // found[0] = 000! -> not a sign
		{
		var search = found[i];
		var name