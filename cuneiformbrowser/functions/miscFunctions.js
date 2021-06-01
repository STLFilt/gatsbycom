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
		document.getElementById("name").inn