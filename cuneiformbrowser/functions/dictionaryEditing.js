

$(window).load(document.getElementById("dictionary").addEventListener('dblclick',react));

var pop = false;
var visible = "";
var dictionary = Array();
var dictOrdered = Array();
var usedLabels = Array();
var nextLabel = null;
var _ENTER_ = 13;
var _ESC_ = 27;
offset = 0;
dictionaryPrepare();
$(document).on("keydown", reactKeyboard);

function react(event)
{
	if(pop)
		return;
	// event.target is the object itself!!!
	var tar = event.target;
	//console.log(event.target.getAttribute("colID"));
	var col = event.target.getAttribute("colID");
	var row = event.target.getAttribute("rowID");
	
	if(tar.name == "image" || tar.cellIndex == 1)
		{
			openImagesList(tar.parentNode.parentNode.id, tar.alt);
			return;
		}
	if(col >=0)
		{
			nextLabel = event.target.parentNode.id;
			openEditor(event.target.parentNode.id);
		}
}

function test(id)
{
	
	
	console.log("test");
}

function openEditor(id)
{
	if(!id.match(/[0-9]+$/))
		{
			return;
		}
	document.getElementById("number").innerHTML = '<b>'+id+'</b>';
	if(typeof(dictionary[id] ) != "undefined")
	{
		document.getElementById("name").value = dictionary[id].name;
		var text = "";
		for(var i = 0; i<dictionary[id].reading.length; i++)
			{
				text += dictionary[id].reading[i] + " ";
			}
		document.getElementById("read").value = text;
	} else
		{
			dictionary[id] = {};
	
			document.getElementById("name").value = "?";
			document.getElementById("read").value = "";
		}
	document.getElementById('editName').style.display = "block";
	pop = true;
	visible = "editName";
	var target = document.getElementById(id);
	setPosition(target.getBoundingClientRect(),'editName');
}
function openImagesList(id, alt)
{	
	nextLabel = id;
		$.ajax({
		type : "GET",
		url : "listModelImages.php",
		data : {modelRequest:id, name:alt},
		// processData: false,
		// contentType: "application/json",
		cache : false,
		error : function() {
			
		},
		success : function(result) {
			document.getElementById('content').innerHTML = result;
			setPosition(document.getElementById(id).getBoundingClientRect(),'editName');
		}
	});
	
	document.getElementById('modelImages').style.display = "block";
	pop =true;
	visible = "modelImages";
}

function dictionaryPrepare()
{
	$.ajax({
		type : "GET",
		url : "matlabInfo.php?infoRequest=dictionary",
		dataType : "json",
		cache : false,
		processData: false,
		error : function() {
			console.log("error calling for startup Info!");
			return;
		},
		success : function(result) {
			
			// now flip this thing!!!
			dictionary = {};
			
			for(var id in result)
				{
				if(result.hasOwnProperty(id)){
					var newId = ("000" + (id)).slice(-3);
					dictOrdered[newId] = result[id][0];

					dictionary[id] = {"name":result[id][0], "reading":result[id]};
//					for(var i = 0; i< result[id].length;i++)
//						 {
//							dictionary[id][reading][i] = result[id][i];
////							var newId = ("000" + (id)).slice(-3);
////							dictionary[result[id][i].toLowerCase()] = newId;  // store the dictionary!
//						 }}
					usedLabels[parseInt(id)] = 1; // index all used labels
				}
			
			for(var i = 1; i<= usedLabels.length; i++)
				{
					if(typeof usedLabels[i] == "undefined")
						{
						nextLabel = ("000" + i).slice(-3);
						break;
						}
				}
			if( nextLabel == null) // No empty spaces in the array
				{
					nextLabel = ("000"+usedLabels.length).slice(-3);
				}
		}
	}});
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
		str = str.replace("*"+number[i],"&#832"+number[i]);
	}
	
	str = str.replace(/sz/g,"š");
	str = str.replace(/SZ/g,"&#352");
	str = str.replace(/t,/g,"&#7789");
	str = str.replace(/T,/g,"&#7788");
	str = str.replace(/s,/g,"&#7779");
	str = str.replace(/S,/g,"&#7778");
	str = str.replace(/h/g,"&#7723");
	str = str.replace(/H/g,"&#7722");
	str = str.replace(/s'/g,"ś");
	str = str.replace(/S'/g,"Ś");
	str = str.replace(/'/g,"ʾ");
	
	return str;
}

function update()
{
	var currentRow = document.getElementById(nextLabel);
	var values = currentRow.cells.length;
	var newName = document.getElementById("name").value;
	if(!newName.trim().match(/[0-9a-zA-Z,':]+$/))
		{
			document.getElementById("error").innerHTML = "Non alpha-numeric input!";
			document.getElementById("error").style.display = block;
			return;
		}
	if(dictionary[nextLabel].name != newName)
		{
			currentRow.cells[2].innerHTML = unicodize(newName);
			currentRow.cells[3].innerHTML = unicodize(document.getElementById("name").value);
			dictionary[nextLabel].name = newName;
			dictionary[nextLabel].reading = Array();
			dictionary[nextLabel].reading[0] = document.getElementById("name").value;
		}
	var newReadings = document.getElementById("read").value;

	newReadings = newReadings.split(" ");
	var dictset = new Set();
	dictset.add(newName.toLowerCase());
	for(var i=0; i<newReadings.length; i++)
		{
			if(newReadings[i] != "")
				{
					if(!newReadings[i].trim().match(/[0-9a-zA-Z,':]+$/) && !/[^\u0000-\u00ff]/.test(newReadings[i].trim()))
					{
						document.getElementById("error").innerHTML = "Non alpha-numeric input!";
						document.getElementById("error").style.display = block;
						return;
					}
					
					dictset.add(newReadings[i].toLowerCase());
}
}
	//dictionary[nextLabel].reading = Array();
	offset = 0;
	dictionary[nextLabel].reading = Array();
	dictset.forEach(function(value1, value2, set){
		
		dictionary[nextLabel].reading[offset] = value1;	offset +=1}); // to avoid duplicates
	
	
    currentRow.cells[2].innerHTML.innerHTML = "";

// trim the table
