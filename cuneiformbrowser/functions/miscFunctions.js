$(window).load(startingSetup);

var xmlns = "http://www.w3.org/2000/svg";
var confusion;
var svgx = $("#svgMaster").offset().left;
var svgy = $("#svgMaster").offset().top;
var dictionary = Array(); // Label's dictionary!
var usedLabels = Array();
var dictOrdered = Array();
var fullDictionary;
var rectHeight = 14;
var searchTotal = 0;
var totals = 0;
var drawn = false;
numFound = 0;
found = [];

function startingSetup()
{
	dictionaryPrepare();
	document.getElementById("selection").addEventListener("change",updateData);
}

function updateData()
{
	var sign = document.getElementById("selection").value;
	var signNum = parseInt(sign);
	if(typeof(fullDictionary[sign]) == "undefined")
		document.getElementById("name").innerHTML = "?";
	else
		document.getElementById("name").innerHTML = fullDictionary[sign][0];
	document.getElementById("id").innerHTML = sign;
	
	var table = document.getElementById("readings");
	
	// Erase old rows
	while(table.rows.length > 1)
		table.deleteRow(-1);

	var row;
	
	if(typeof(fullDictionary[sign]) != "undefined")
	fullDictionary[sign].forEach(function(element, ind, array){
		if(ind%10 == 0)
			row = table.insertRow(-1);
		
		var cell = row.insertCell(-1);
		cell.innerHTML = element;
	});
	
	table.style.display = "inline-block";
	$.ajax({
		type : "GET",
		url : "matlabInfo.php?infoRequest=signInfo&sign="+sign,
	
		cache : false,
		error : function() {
			console.log("error fetching Info");
			return;
		},
		success : function(result) {
			
			var signInfo = JSON.parse(result);
			document.getElementById("totalExamples").innerHTML =  signInfo.totalExamples;
			document.getElementById("PR").innerHTML = "";
			if(signInfo.pr)
				{
					document.getElementById("PR").innerHTML = "<h3>P/R for all images</h3><img src=\""+signInfo.prFile+"\" width=\"40%\">";
				}
			document.getElementById("trained").innerHTML = signInfo.trainStatus;
			switch(signInfo.trainStatus)
			{
			case "trained":
				document.getElementById("trained").className = "tabCell yes";
				break;
			case "trainable":
			