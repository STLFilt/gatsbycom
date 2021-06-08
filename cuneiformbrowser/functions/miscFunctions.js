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
				document.getElementById("trained").className = "tabCell almost";
				break;
			case "untrained":
				document.getElementById("trained").className = "tabCell no";
				break;
			}
			
			updateImages(sign);
			confusion = [];
			confusion[sign] = JSON.parse(signInfo.CMdata);
			
			if(confusion[sign] != null)
				document.getElementById("totalCorrect").innerHTML  = confusion[sign][sign];
			
			if(!drawn)
				drawConfusion(sign);
			
			updateConfusion(sign);
		}
	});
	
	

}

function updateImages(sign)
{
	
	//var sign = document.getElementById("selection").value;
	/*document.getElementById("imagesName").innerHTML = sign;
	
	$.ajax({
		type : "GET",
		url : "listExamples.php?sign="+sign,
	
		cache : false,
		error : function() {
			console.log("error fetching the gallery");
			return;
		},
		success : function(result) {
			document.getElementById("images").innerHTML =  result;
		}
	});*/
	
	//clicked = imageClicked;
	$.ajax({
	type : "GET",
	url : "listModelImages.php",
	data : {modelRequest:sign, name:sign},
	// processData: false,
	// contentType: "application/json",
	cache : false,
	error : function() {
		
	},
	success : function(result) {
		document.getElementById('examples').innerHTML = result;
		
	}
});
}

function dictionaryPrepare()
{
	$.ajax({
		type : "GET",
		url : "matlabInfo.php?infoRequest=dictionary",
		dataType : "json",
		async : false,
		cache : false,
		processData: false,
		error : function() {
			console.log("error calling for startup Info!");
			return;
		},
		success : function(result) {
			
			fullDictionary = result;
			
			var names = Object.keys(fullDictionary);
			
			for(var i = 0; i< names.length; i++)
				{

					
					fullDictionary[names[i]].forEach(function(element, ind, array)
							{
								array[ind] = unicodize(element);
							});
				}
			
		}
	});
}

function unicodize(str)
{
	var number = Array('0','1','2','3','4','5','6','7','8','9');
	
	for(var i = 0; i<10;i++)
		{ 
			str = str.replace(number[i],"*"+number[i]);
		}
	for(var i = 0; i<10;i++)
	{ 
		var rep = "832" +number[i];
		str = str.replace("*"+number[i],String.fromCharCode(rep));
	}
	
	str = str.replace(/sz/g,String.fromCharCode(353));