
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
		url : "matlabInfo.php?infoR