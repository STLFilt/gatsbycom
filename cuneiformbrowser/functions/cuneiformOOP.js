
/*TODO
 * need following info to separate php from JS
 *
 * "<title>Edition ".$_SESSION["imageName"]."</title>"; <- in matlabInfo
 *
 * $imagefile = _IMAGESPATH_.($xmlImages->image[$_SESSION["imageID"]]->file);
	$imagesize =  getimagesize($imagefile.".jpg");
	$width = $imagesize[0];
	$height = $imagesize[1];

 *  "<svg width=\"$width\" height=\"$height\"  class=\"content\">
		   <g id=\"svgMaster\">
		 <image xlink:href=\"$imagefile.jpg\" draggable=\"true\" x=\"0\" y=\"0\" height=\"$height\" width=\"$width\" id=\"image\" title=\"$_SESSION[imageID]\">
		 </svg>" ;

		 	$imagefile = _IMAGESPATH_.($xmlImages->image[$_SESSION["imageID"]]->file);
	$imagesize =  getimagesize($imagefile.".jpg");
	$width = $imagesize[0];
	$height = $imagesize[1];
	echo "<image xlink:href=\"$imagefile.jpg\" draggable=\"true\" x=\"0\" y=\"0\" height=\"$height\" width=\"$width\" id=\"thumb\" title=\"$_SESSION[imageID]\">
	</svg>" ;

		echo "<script> var autoload = $GLOBALS[annotation];
					var statusAnnotations = \"$GLOBALS[statusAnnotations]\";
					var annotationsVersions = $GLOBALS[versions];
					var urlThumbHOG = \""._RESULTS_.$_SESSION["user"]."HOG.jpg\";
					var urlThumb = \""._RESULTS_.$_SESSION["user"]."thumbs.jpg\"; </script>";

 *  */

var xmlns = "http://www.w3.org/2000/svg";
var x = $("#image").offset().left;
var y = $("#image").offset().top;
var svgElement = document.getElementById("image");
svgElement.ondragstart = function() { return false; }; // to not conflict with the rectangles' dragging
svgElement.addEventListener("click", imageClicked);
svgElement.addEventListener("mouseover", imageOver);
var boxes = [ null ];
var lines = [0];
var zoom = 1;
var zoomInverse = 1;
var activeRectangle;
var mainInfo;
var verbose = false;
var streamChange = false;
var dictionary = Array(); // Label's dictionary!
var windowObjectReference = null;
var nextLabel = null;
var usedLabels = Array();
var selectedSignClass = "";

var meta;

var detectionInfo = {};
detectionInfo.detectedSigns = new Set();
detectionInfo.ID = 0;
detectionInfo.searchedSigns = [];
detectionInfo.algorithms = [];

var generalInfo = {};
generalInfo.imageID = "";
generalInfo.collectionID = "";
generalInfo.groupID = "";
generalInfo.detectionID = "";
generalInfo.feedbackID = "";

var imageHeight = 100;
var imageWidth = 100;


// FLAGS
var clickFlag = false;
var editFlag = false;
var selectFlag = false;
var annotationsLoaded = false;
var editName = false;
var noEdit = false;
var train = false;
var colorize = true;
var resizeMode = false;
var saveAllowed = true; // To now allow saving in some cases TODO
var backupAvailable = false;
var verboseBuffer = "";
var dictUpdateOpen = false;
var draw_line = false;
var mode = 'boxes';

// Config, probably will be loaded by php
var selectedColor = "red";
var sameValue = "blue";
var defaultColor = "green";
var noValue = "maroon";
var tabletName = "VATsoemthingsomething";
var folderName = "KileS";
var archived = false;
var resultsDirectory = "";
var opacityValue = 0.5;

// Constants, to make things readable...
var _ENTER_ = 13;
var _DEL_ = 46;
var _ESC_ = 27;
var _TAB_ = 9;
var _A_ = 65;
var _H_ = 72;
var _E_ = 69;
var _L_ = 76;
var _N_ = 78;
var _ADD_ = 107;
var _EQL_ = 187;
var _DOT_ = 190;
//Not sure... var _ADD2_ = 171; 
var _HASH_ = 163;
var _MULT_ = 106;
var _COMMA_ = 188;

var trackChanges = new changesTracker();
var changesLog = new changeLog();

var dictOrdered = Array();
var aDictUnicode = Array();

var oldDetectionsWindow = {};

$(document).on("keydown", reactKeyboard);

$(window).load(startingSetup);



// Starting setup: adjust image zoom, load important infos.
function startingSetup() {
	// These functions need to be initialized
	setPopUp();
	defaultMode();

	// set the colors of the help panel
	document.getElementById("annotationColor").style.backgroundColor = defaultColor;
	document.getElementById("nonAnnotationColor").style.backgroundColor = noValue;
	document.getElementById("sameColor").style.backgroundColor = sameValue;
	document.getElementById("selectedColor").style.backgroundColor = selectedColor;

	document.getElementById("dictionaryHeader").addEventListener("mousedown", onMouseDownDictionary);
    document.getElementById("dictionary").addEventListener("click", highlightSignFromDictionary);
	detectionInfo = new detection();

	if(offline)
		startUpOffline();  // if we are in offline modus, jsut ignore everything!
	else
	{
	// HEERE LOAD INFO
	var waitForIt = true;
	$.ajax({
		type : "GET",
		url : "matlabInfo.php?infoRequest=startUp",
		dataType : "json",
		async : false,
		cache : false,
		error : function() {
			console.log("error calling for startup Info!");
			return;
		},
		success : function(result) {
			tabletName = result['imageName'];
			imageName = result['imageName'];
			imageFile = result['imageFile'];
			statusAnnotations = result['statusAnnotations'];
			autoload = JSON.parse(result['autoload']);
			imageWidth = result['imageWidth'];
			imageHeight = result['imageHeight'];
			urlThumb = result['resultThumb'];
			urlThumbHOG = result['urlThumbHOG'];
			annotationsVersions = result['version'];
			imageID = result['imageID'];
			waitForIt = false;
			groupID = result['groupNr'];
			collectionID = result['collectionNr'];
			groupName = result['groupName'];
			collectionName = result['collectionName'];
			userName = result['user'];
			page = result['page'];
		//	if(result['metaData']== "none")
		//		metaData = false;
		//	else
		//		metaData = true;
			
			// get view description of tablet segment
			var view_desc = '';
			if (imageFile.search('Obv') >= 0)
				view_desc = 'Obv';
			else if (imageFile.search('Rev') >= 0)
			  	view_desc = 'Rev';

			meta = new metaData();

			var collectionSAAPath = collectionName.toLowerCase().split(" ").join("");

			document.title = "Editor("+userName+"): " + tabletName+' Collection: '+collectionName+' Group: '+groupName;
			if( tabletName[0] == 'P')
				document.getElementById('tabletName').innerHTML = '<b><a target="_blank" href="https://cdli.ucla.edu/'+tabletName+
					'">'+tabletName+view_desc+'</a></b><br><a target="_blank" href="http://oracc.museum.upenn.edu/saao/'+collectionSAAPath+"/"+tabletName+'">SAA link</a>';
			else
				document.getElementById('tabletName').innerHTML = '<b>'+tabletName+'</b>';

			document.getElementById('containerSVG').setAttribute("width",imageWidth);
			document.getElementById('containerSVG').setAttribute("height",imageHeight);
			svgElement.setAttribute("width",imageWidth);
			svgElement.setAttribute("height",imageHeight);
			svgElement.setAttribute('xlink:href',imageFile+".jpg");
			document.getElementById('thumb').setAttribute("width",imageWidth);
			document.getElementById('thumb').setAttribute("height",imageHeight);
			document.getElementById('thumb').setAttribute("height",imageHeight);
			document.getElementById('thumb').setAttribute('xlink:href',imageFile+".jpg");

			document.getElementById('backStart').addEventListener('click',function(){window.location='start.php?group='+groupID+'&collection='+collectionID+'&selection=true&page='+page;});

			var sel = document.getElementById("backupSelect");

			if (statusAnnotations != "done") {
				for ( var i = 1; i < annotationsVersions; i++) {
					var opt1 = document.createElement("option");
					opt1.value = i + 1;
					opt1.text = "Version " + i;
					sel.add(opt1, sel.options[1]);
				}
			} else
				sel.style.display = "none";
			// Adjust zoom to let image fit on screen
			if (imageWidth < window.outerWidth) {
				zoom = 100;
			} else if (imageWidth * 0.75 < window.outerWidth) {
				zoom = 75;
			} else if (imageWidth * 0.5 < window.outerWidth) {
				zoom = 50;
			} else
				zoom = 25;

			document.getElementById("zoom").value = zoom;
			resizeEverything(zoom);

			dictionaryPrepare();

			if (statusAnnotations == "done") {
				archived = true;
				noEditMode();
			}

			if (statusAnnotations == "none")
				document.getElementById("load").className += " disabled";

			// experimetnal
			if (typeof (autoload) != "undefined")
				if (autoload)
					{
					loadAnnotations();
					}
			timer = window.setTimeout(ping, 720000);

			$.ajax({
				type : "GET",
				url : "matlabInfo.php?infoRequest=currentInfo",
				dataType : "json",
				async : false,
				cache : false,
				error : function() {
					console.log("error calling for Info!");
					return;
				},
				success : function(result) {
					mainInfo = result;
					//tabletName = mainInfo['imageName'];
					backupAvailable = mainInfo['backup'] && mainInfo['backupID']==imageID;
					// Check which algorithms are available
					if(!mainInfo['algorithms']['multi'])
						{
						document.getElementById('multi').disabled = true;
						document.getElementById('multi').checked = false;
						}
					// Check if detections' options are available:
					if(mainInfo['detectionOptions'] != null)
						{
						for ( var i = 0; i < mainInfo['detectionOptions'].length; i++)
						{
							var sel = document.getElementById('imageOptions');
							var opt1 = document.createElement("option");
							opt1.value = mainInfo['detectionOptions'][i];
							opt1.text = mainInfo['detectionOptions'][i];
							sel.add(opt1, sel.options[1]);
						}
					}
					else
						document.getElementById('options').style.display = 'none';

					if(mainInfo['continueProcess'])
						{
						// Show the new dialog
						document.getElementById('matlabOutput').value = "Picking up stream...\n";
						setPopUp('matlabStream');

						// Now call the streaming function in one sec!
						setTimeout('streamMatlab()', 1000);
						}
					if(mainInfo['loadBackup'])
						{
						//loadBackupDetection();
						 restoreBackup();
						}
					else
					if(backupAvailable)
						{
						document.getElementById("loadBackup").style='inline-block';

						}
				}
			});

			$("#overlay").remove();
			oldDetectionsWindow = new interfaceWindow(30, 10, "oldDetections");
			oldDetectionsWindow.addButtons(oldDetections);
			oldDetectionsWindow.addContent();

			// GET Rid of some variables:
			delete groupName;
			delete collectionName;
			delete userName;
		}
	});
	// HERE WAIT FOR IT

	// Here set it!
    



	// Set all button handles!




	}

    dragDictionary(document.getElementById("testDIV"));


}

function startUpOffline()
{
	// set dummy links
	// hide everything that is not ok
	// TODO in the mode change, check for offline!
	document.title = "Offline Editor";
	document.getElementById('tabletName').innerHTML = '<b>Offline Editor</b>';
	document.getElementById("online").style.display = "none";
	//document.getElementById("localImage").style.display = "block";
	//document.getElementById("loadLocal").style.display = "none";
	$("#overlay").remove();
	document.getElementById("ping").style.backgroundColor = "red";
}


function loadAnnotations(version) {
	if(statusAnnotations === "none")
		return;

	if (annotationsLoaded)
		{
			console.log('Annotations already loaded');
			return;
		}


	var location = "fetch.php?version=";

	if (arguments.length == 0) {
		location = location + "0";
	} else {
		location = location + version;
	}
	$.ajax({
		type : "GET",
		url : location,
		dataType : "json",
		success : function(result) {
			xmlProcess(result["xml"]);
			confidenceUpdate(0);
			processCSVLines(result["csv"]);
			annotationsLoaded = !annotationsLoaded;
			toggleLoadButtons();
			$("#statusSave").toggleClass("statusAttention");
			trackChanges.edited = true;
			trackChanges.saved();
			if(boxes.length == 1 && mode !== "lines")
				{
					switchModes();
				}
		},
		error : function(xhr, status, errorThrown) {
			console.log("Error: " + errorThrown);
			console.log("Status: " + status);
			console.dir(xhr);
		},
		async : true,
		cache : false
	});
	return;
}

function loadResults(id) {
	if (annotationsLoaded)
		return;
	document.getElementById('closeStream').style.display = "none";
	verboseBuffer = "";

	if(id != "")
		//var location = "loadresultsID.php?detectionID="+id;
		var location = "loadresultsCNN.php?network_version="+id;
	else
		//var location = "loadresultsID.php";
		var location = "loadresultsCNN.php";
	$.ajax({
		type : "GET",
		url : location,
		dataType : "json",
		success : function(result) {
			jsonProcess(result);
			//loadModels();
			setTraining();
			if (colorize)
				colorizeConfidence();
            confidenceUpdate(0.3);
		},
		error : function(xhr, status, errorThrown) {
			console.log("Error: " + errorThrown);
			console.log("Status: " + status);
			console.dir(xhr);
		},
		async : true,
		cache : false
	});
}

function loadModels() {

	var location = "matlabInfo.php?infoRequest=nearestModels";
	$.ajax({
		type : "GET",
		url : location,
		dataType : "json",
		success : function(result) {
			modelsProcess(result);
		},
		error : function(xhr, status, errorThrown) {
			console.log("Error: " + errorThrown);
			console.log("Status: " + status);
			console.dir(xhr);
		},
		async : true,
		cache : false
	});
}

function resizeEverything(zoomFactor) {
	zoomInverse = 100 / zoomFactor;
	zoomVal = zoomFactor / 100;

	document.getElementById("svgMaster").setAttribute("transform",
			"scale(" + zoomVal + ")");
	var containerSVG = document.getElementById('containerSVG')
	containerSVG.setAttribute("width", imageWidth * zoomVal);
	containerSVG.setAttribute("height", imageHeight * zoomVal);
	window.scrollTo(0, 0); // TODO scroll to same position using scrolltop and
							// scrollleft (jquery) and the zoomfactor
}

function boundingBox(x, y, id) {
	this.id = id;
	this.xmin = x;
	this.ymin = y;
	this.xmax = x + 1;
	this.ymax = y + 1;
	this.symbol = "000";
	this.confidence = 1;
	this.thumbHeight = 0;
	this.thumbXStart = 0;
	this.thumbWidth = 0;
	this.readableSymbol = "N/A";
	this.show = 1;
	this.status = "intact";
}

function line(x, y, id){
	this.id = id;
	this.segments = Array();
	this.group = document.createElementNS(xmlns, "g");

	this.group.setAttribute("id", "line_"+id);
	document.getElementById("lines_group").appendChild(this.group);

	this.group.addEventListener("click", function(){this.select();}.bind(this));
	this.segments.push(new line_segment(x,y, this.group));

}

line.prototype.addSegment = function(){
	var segment = this.segments[this.segments.length -1];
	segment.svg.setAttribute("x2", segment._x2);
	segment.svg.setAttribute("y2", segment._y2);
	segment.svg.setAttribute("stroke", "green");
	segment.svg.removeAttribute("stroke-dasharray");
	this.segments.push(new line_segment(segment._x2,segment._y2, this.group));
}

line.prototype.clearLast = function(){
	var segment = this.segments.pop();
	segment.removeLast();
	// if no more segments, remove line altogether.
	if(this.segments.length == 0)
		{
			lines.pop();
			this.group.remove();
		}
}

line.prototype.erase = function(){

	lines.splice(lines.indexOf(this), 1);
	this.group.remove();
	trackChanges.changed();
}

line.prototype.select = function(){

	if(draw_line)
		return;

	if(lines[0] != 0)
		lines[lines[0]].deselect();

	lines[0] = lines.indexOf(this);

	for(var i = 0; i < this.segments.length; i++)
		{
			this.segments[i].svg.setAttribute("stroke-dasharray", "5,5");
		}
}

line.prototype.deselect = function(){

	lines[0] = 0;

	for(var i = 0; i < this.segments.length; i++)
	{
		this.segments[i].svg.removeAttribute("stroke-dasharray");
	}
}

line.prototype.getCSV = function(){

	var temp = Array();
	var segment = this.segments[0];
	var csv = this.id + "," + segment._x1 + "," + segment._y1 + "\n" + this.id + "," + segment._x2 + "," + segment._y2;
	temp.push(csv);

	for(var i = 1; i < this.segments.length; i++)
		{
			var segment = this.segments[i];
			var csv = this.id + "," + segment._x2 + "," + segment._y2;
			temp.push(csv);
		}

	return temp.join('\n');
}

function line_segment(x, y, parent) {
		this._x1 = Math.round(x);
		this._y1 = Math.round(y);

		this._x2 = x+1;
		this._y2 = y+1;

		this._visible = true;

		// create SVG element

		var elem = document.createElementNS(xmlns, "line");

		elem.setAttribute("x1", this._x1);
		elem.setAttribute("y1", this._y1);
		elem.setAttribute("x2", this._x2-1);
		elem.setAttribute("y2", this._y2-1);
		elem.setAttribute("stroke-width", 3);
		elem.setAttribute("stroke", "magenta");
		elem.setAttribute("stroke-dasharray", "5,5");
		elem.setAttribute("vector-effect", "non-scaling-stroke");
		parent.appendChild(elem);
		this.svg = elem;

}

line_segment.prototype.removeLast = function(){
	this.svg.remove();

}
Object.defineProperty(line.prototype, "x", {
	set: function(value){
		this.segments[this.segments.length-1]._x2 = value;
		this.segments[this.segments.length-1].svg.setAttribute("x2", value-1);

	}

});
Object.defineProperty(line.prototype, "y", {
	set: function(value){
		this.segments[this.segments.length-1]._y2 = value;

		this.segments[this.segments.length-1].svg.setAttribute("y2", value-1);
	}

});

function loadLines(data){

	return;

}
/*Object.defineProperty(line_segment.prototype, "y", {
	set: function(value){
		this._y2 = value;

		this.svg.setAttribute("y2", this._y2);
	}

});*/

boundingBox.prototype.xmlBox = function(xmlBox, train) {
	this.id = $(xmlBox).find('name').text();
	this.xmin = parseFloat($(xmlBox).find('xmin').text());
	this.ymin = parseFloat($(xmlBox).find('ymin').text());
	this.xmax = parseFloat($(xmlBox).find('xmax').text());
	this.ymax = parseFloat($(xmlBox).find('ymax').text());
	this.symbol = $(xmlBox).find('symbol').text();
	this.symbol = $(xmlBox).find('symbol').text();
	//TODO
	// conservation status
	var status = $(xmlBox).find('conservation').text();
	if(status)
	{
		this.status = status;
	}
	this.readableSymbol = $(xmlBox).find('hrsymbol').text();
	if(this.readableSymbol == "" || this.readableSymbol.toLowerCase() == "na") // no saved human readable label, get default one
		{
			var newName = parseInput(this.symbol);
			if (newName != null)
				{
					this.readableSymbol = newName.newName;
					this.unicodeName = unicodize(this.readableSymbol);
				}

		}
	else
		this.unicodeName = unicodize(this.readableSymbol);

	if (train) {
		this.confidence = $(xmlBox).find('confidence').text();
	}
};

boundingBox.prototype.jsonBox = function(element) {
	if(element.hasOwnProperty('name'))
		this.id = element.name;
	else
		this.id = element.id;

	this.xmin = element.xmin;
	this.ymin = element.ymin;
	this.xmax = element.xmax;
	this.ymax = element.ymax;
	this.symbol = ("000" + (element.symbol)).slice(-3);

	if (typeof element.readableSymbol != 'undefined')
		{
		this.readableSymbol = element.readableSymbol;
		this.unicodeName = unicodize(this.readableSymbol);
		}
	else
		{
		this.readableSymbol= "N/A";
		this.unicodeName  = "N/A";
		}
	if (typeof element.confidence != 'undefined') {
		this.confidence = element.confidence;
		this.basic = element.basic;
		this.ngram = element.ngram;
		this.ngramlr = element.ngramlr;
		this.ngramrl = element.ngramrl;
		if(typeof element.reviewed == 'undefined')  // A normal bounding box, not a saved detection
			{
			this.reviewed = false; // Was this reviewed?
			this.fp = false; // false positive?
			this.correction = this.id; // actual sign -> 000 if not a sign at all!

			var newName = parseInput(this.symbol);
			if (newName != null)
				{
					this.readableSymbol = newName.newName;
					this.unicodeName = unicodize(this.readableSymbol);
				}
			}
		else
			{	// a saved detection
			this.reviewed = element.reviewed; // Was this reviewed?
			this.fp = element.fp; // false positive?
			this.correction = element.correction; // actual sign -> 000 if not a sign at all!
			}

	}
};

boundingBox.prototype.jsonThumbs = function(detection, model) {
	//array("height"=>$ymax, "XStart"=>$xpos, "width"=>$width, "xHOG"=> $xHOG);
//	this.thumbHeight = element.height;
//	this.thumbXStart = element.XStart;
//	this.thumbWidth = element.width;
//	this.thumbHOG = element.xHOG;

	this.thumbName = "thumb_" + detection + "_model" + model + ".jpg";
	this.HOGName = "thumb_" + detection + "_model" + model + "_HOG.jpg";
};

boundingBox.prototype.svgBox = function() {
	var x = Math.round(this.xmin);
	var y = Math.round(this.ymin);
	var width = Math.round(this.xmax) - x;
	var height = Math.round(this.ymax) - y;
	var elem = document.createElementNS(xmlns, "rect");

	elem.setAttribute("id", this.id);
	elem.setAttribute("x", x);
	elem.setAttribute("y", y);
	elem.setAttribute("width", width);
	elem.setAttribute("height", height);
	elem.setAttribute("name", this.symbol);
	if (this.symbol != "000")
		elem.setAttribute("stroke", defaultColor);
	else
		elem.setAttribute("stroke", noValue);
	elem.setAttribute("stroke-width", 1);
	elem.setAttribute("fill", "none");
	elem.setAttribute("vector-effect", "non-scaling-stroke");
    elem.classList.add(this.status);
	document.getElementById("boxes_group").appendChild(elem);
	this.svg = elem;
};
boundingBox.prototype.setMax = function(width, height) {
	this.xmax = +this.xmin + +width;
	this.ymax = +this.ymin + +height;
};

boundingBox.prototype.boxToXML = function(newXML) {
	var sign = newXML.createElement("object");
	var newNode = newXML.createElement("name");

	newNode.appendChild(newXML.createTextNode(this.id));
	sign.appendChild(newNode);

	// Symbol <symbol>511</symbol>

	newNode = newXML.createElement("symbol");
	newNode.appendChild(newXML.createTextNode(this.symbol));
	sign.appendChild(newNode);

	// bndbox
	newNode = newXML.createElement("bndbox");
	var x = newXML.createElement("xmin");
	var y = newXML.createElement("ymin");

	x.appendChild(newXML.createTextNode(this.xmin));
	y.appendChild(newXML.createTextNode(this.ymin));

	newNode.appendChild(x);
	newNode.appendChild(y);

	x = newXML.createElement("xmax");
	y = newXML.createElement("ymax");

	x.appendChild(newXML.createTextNode(this.xmax));
	y.appendChild(newXML.createTextNode(this.ymax));

	newNode.appendChild(x);
	newNode.appendChild(y);

	sign.appendChild(newNode);

	// center
	newNode = newXML.createElement("center");
	x = newXML.createElement("xc");
	y = newXML.createElement("yc");

	x.appendChild(newXML.createTextNode((parseFloat(this.xmin) + parseFloat(this.xmax)) / 2));
	y.appendChild(newXML.createTextNode((parseFloat(this.ymin) + parseFloat(this.ymax)) / 2));

	newNode.appendChild(x);
	newNode.appendChild(y);

	sign.appendChild(newNode);

	// coordpos
	newNode = newXML.createElement("coordpos");
	var rowNode = newXML.createElement("row");
	var colNode = newXML.createElement("col");

	rowNode.appendChild(newXML.createTextNode("1"));
	colNode.appendChild(newXML.createTextNode("1"));

	newNode.appendChild(rowNode);
	newNode.appendChild(colNode);

	sign.appendChild(newNode);

	// Human readable symbol

	if(this.readableSymbol != "N/A")
	{
		newNode = newXML.createElement("hrsymbol");
		newNode.appendChild(newXML.createTextNode(this.readableSymbol));
		sign.appendChild(newNode);
	}

	// Conservation status
	newNode = newXML.createElement("conservation");
	newNode.appendChild(newXML.createTextNode(this.status));
	sign.appendChild(newNode);

	return sign;

};

boundingBox.prototype.boxToXMLCorrection = function(newXML) {
	var sign = newXML.createElement("object");
	var newNode = newXML.createElement("name");

	newNode.appendChild(newXML.createTextNode(this.id));
	sign.appendChild(newNode);

	// Symbol <symbol>511</symbol>

	newNode = newXML.createElement("symbol");
if(this.fp) {
	newNode.appendChild(newXML.createTextNode(this.correction));
} else {
	newNode.appendChild(newXML.createTextNode(this.symbol));
}
	sign.appendChild(newNode);

	// bndbox
	newNode = newXML.createElement("bndbox");
	var x = newXML.createElement("xmin");
	var y = newXML.createElement("ymin");

	x.appendChild(newXML.createTextNode(this.xmin));
	y.appendChild(newXML.createTextNode(this.ymin));

	newNode.appendChild(x);
	newNode.appendChild(y);

	x = newXML.createElement("xmax");
	y = newXML.createElement("ymax");

	x.appendChild(newXML.createTextNode(this.xmax));
	y.appendChild(newXML.createTextNode(this.ymax));

	newNode.appendChild(x);
	newNode.appendChild(y);

	sign.appendChild(newNode);

	// center
	newNode = newXML.createElement("center");
	x = newXML.createElement("xc");
	y = newXML.createElement("yc");

	x.appendChild(newXML.createTextNode((parseFloat(this.xmin) + parseFloat(this.xmax)) / 2));
	y.appendChild(newXML.createTextNode((parseFloat(this.ymin) + parseFloat(this.ymax)) / 2));

	newNode.appendChild(x);
	newNode.appendChild(y);

	sign.appendChild(newNode);

	// coordpos
	newNode = newXML.createElement("coordpos");
	var rowNode = newXML.createElement("row");
	var colNode = newXML.createElement("col");

	rowNode.appendChild(newXML.createTextNode("1"));
	colNode.appendChild(newXML.createTextNode("1"));

	newNode.appendChild(rowNode);
	newNode.appendChild(colNode);

	sign.appendChild(newNode);

	// Human readable symbol

	if(this.fp)
	{
		newNode = newXML.createElement("hrsymbol");
		newNode.appendChild(newXML.createTextNode(this.corRead));
		sign.appendChild(newNode);
	} else {
		newNode = newXML.createElement("hrsymbol");
		newNode.appendChild(newXML.createTextNode(this.readableSymbol));
		sign.appendChild(newNode);
	}

	// Conservation status
	newNode = newXML.createElement("conservation");
	newNode.appendChild(newXML.createTextNode(this.status));
	sign.appendChild(newNode);

	return sign;

};

boundingBox.prototype.boxCorrections = function() {
	boxArray = {};
	boxArray['symbol'] = this.symbol;
	boxArray['xmin'] = Math.round(this.xmin);
	boxArray['ymin'] = Math.round(this.ymin);
	boxArray['xmax'] = Math.round(this.xmax);
	boxArray['ymax'] = Math.round(this.ymax);
	boxArray['fp'] = this.fp;
	boxArray['correction'] = this.correction;
	boxArray['reviewed'] = this.reviewed;
	return boxArray;
};

function generateXML(bCorrection) {
	var newXML = document.implementation.createDocument(null, null, null);

	var rootNode = newXML.createElement("annotation");
	var folderNode = newXML.createElement("folder");
	var filenameNode = newXML.createElement("filename");
	var sizeImageNode = newXML.createElement("size");
	var widthNode = newXML.createElement("width");
	var heightNode = newXML.createElement("height");

	// Node size: just the size of the image
	widthNode.appendChild(newXML.createTextNode(imageWidth));
	heightNode.appendChild(newXML.createTextNode(imageHeight));
	sizeImageNode.appendChild(widthNode);
	sizeImageNode.appendChild(heightNode);

	// Node folderNode
	folderNode.appendChild(newXML.createTextNode(folderName));

	// Node tabletNameNode
	filenameNode.appendChild(newXML.createTextNode(tabletName));

	// now start appending things to the root node
	rootNode.appendChild(folderNode);
	rootNode.appendChild(filenameNode);
	rootNode.appendChild(sizeImageNode);

	// compact the boxes' array (the ids are just re-arranged to avoid problems due to erased boxes.
	// Now loop over all the boundingboxes and append them!
	var compactIndex = 1;
	boxes.forEach(function(element, index, array) {
		if (element != null) {
			element.id = compactIndex;
			if(bCorrection) {
				if (element.reviewed && parseInt(element.correction)) {
					rootNode.appendChild(element.boxToXMLCorrection(newXML));
					compactIndex += 1;
				}
			} else {
				rootNode.appendChild(element.boxToXML(newXML));
				compactIndex += 1;
			}
		}
	});

	// append the rootNode to the document

	newXML.appendChild(rootNode);

	// test
	return newXML;

}

function downloadXML() {
	var newXML = generateXML();
	var buffer;
	var XMLS = new XMLSerializer();

	// now, generate downalod link! Using the "download" in case it works.

	var downloadData = new Blob([ XMLS.serializeToString(newXML) ], {
		type : 'text/plain'
	});

	if (buffer !== null) {
		window.URL.revokeObjectURL(buffer);
	}

	buffer = window.URL.createObjectURL(downloadData);
	var date = new Date();
	var link = document.getElementById('downloadlink');
	link.download = tabletName + "_" + date.getFullYear() + "_"
			+ date.getMonth() + "_" + date.getDate() + ".txt";
	link.href = buffer;
	link.onclick = function() {
		setPopUp();
	};
	link.style.display = 'block';

	setPopUp("popSaveLocally");

}

function localAnnotation(doAction) {
	if (doAction == "start") {
		document.getElementById("loadAnnotation").style.display = 'block';
		document.getElementById("fileField").reset();
		return;
	}
	if (doAction == "cancel") {
		document.getElementById("loadAnnotation").style.display = 'none';
		$("#error").text("");
		return;
	}

	var control = document.getElementById("annotationFile");
	var reader = new FileReader();

	reader.readAsText(control.files[0]);
	reader.onload = function(event) {
		var data = event.target.result;
		var parser = new DOMParser();
		var xmlData = parser.parseFromString(data, "application/xml");
		if (xmlData.firstElementChild.nodeName == "parsererror") {
			$("#error").text("Invalid File");
			return;
		}
		document.getElementById("loadAnnotation").style.display = 'none';
		xmlProcess(xmlData);
		trackChanges.changed();
	};
	reader.onerror = function(event) {
		console
				.error("File could not be read! Code "
						+ event.target.error.code);
	};

}

function jsonProcess(jsonResult) {
	// detectionInfo.ID = jsonResult["detectionID"];
	detectionInfo.ID = jsonResult["network_version"];
	detectionInfo.detectedSigns = new Set();
	for ( var i = 0; i < jsonResult['data'].length; i++) {
		var box = new boundingBox();
		box.jsonBox(jsonResult['data'][i]);
		box.svgBox();
		boxes.push(box);
		detectionInfo.detectedSigns.add(box.symbol);
	}

	detectionInfo.searchedSigns = jsonResult["searched"];
	detectionInfo.algorithms = jsonResult["algorithms"];
	detectionInfo.fullInfo = jsonResult["detectionInfo"];
	detectionInfo.all = jsonResult["all"];
	detectionInfo.lines = jsonResult["lines"];
//	updateSignList("detection");

	$("rect").on("mousedown", rectangleMouseDown);
	$("rect").on("mouseover", rectangleOver);
	$("rect").on("mouseover", rectangleOver);
	$("rect").attr("pointer-events", "all");
	document.getElementById("slider").disabled = false;

}

function modelsProcess(results) {

//	// Nearest models stored in the corresponding boxes
//	// resulst[0] are the dimensions for the thumbnails!
//
//	for ( var i = 2; i < results.length; i++) {
//		boxes[i-1].jsonThumbs(results[i]);
//
//	}
//	// Now adjust the Thumbnails!
//	//	array("height"=>$height, "xThumb"=>$xThumb, "xHOG"=>$xHOG, "maxWidth"=>$maxWidth);
//	// "hogThumb":"matlab\/resultsWeb\/tester_13_Jul_2015_12_47_23HOG.jpg"
//	document.getElementById('model').setAttribute('xlink:href',	results[1]['modelThumb']);
//	document.getElementById('hog').setAttribute('xlink:href',	results[1]['hogThumb']);
//	$("#svgModel").attr('width',results[0].maxwidth);
//	$("#svgModel").attr('height' , results[0].height);
//	$("#svgHOG").attr('width' , results[0].maxWidth);
//	$("#svgHOG").attr('height' , results[0].height);
//	$("#model").attr('width' , results[0].xThumb);
//	$("#hog").attr('width' , results[0].xHOG);
//	$("#model").attr('height' , results[0].height);
//	$("#hog").attr('height' , results[0].height);
//	//$("#model").attr('xlink:href', urlThumb);
//	//$("#hog").attr('xlink:href', urlThumbHOG);


	// Nearest models stored in the corresponding boxes
	// resulst[0] are the dimensions for the thumbnails!
	if(results == null)
		return;

	for ( var i = 1; i < results.model.length+1; i++) {
		boxes[i].jsonThumbs(results.detection[i-1],results.model[i-1]);

	}
	// Now adjust the Thumbnails!
	//	array("height"=>$height, "xThumb"=>$xThumb, "xHOG"=>$xHOG, "maxWidth"=>$maxWidth);
	// "hogThumb":"matlab\/resultsWeb\/tester_13_Jul_2015_12_47_23HOG.jpg"
	var modelname = results.directory+"thumb_"+results.detection[1]+"_model"+results.model[1]+".jpg";
	var hogname = results.directory+"thumb_"+results.detection[1]+"_model"+results.model[1]+"_HOG.jpg";

	resultsDirectory = results.directory;

	document.getElementById('model').setAttribute('xlink:href',	modelname);
	document.getElementById('hog').setAttribute('xlink:href',	hogname);
	$("#svgModel").attr('width',results.width);
	$("#svgModel").attr('height' , results.height);
	$("#svgHOG").attr('width' , results.width);
	$("#svgHOG").attr('height' , results.height);
	$("#model").attr('width' , results.width);
	$("#hog").attr('width' , results.width);
	$("#model").attr('height' , results.height);
	$("#hog").attr('height' , results.height);
	//$("#model").attr('xlink:href', urlThumb);
	//$("#hog").attr('xlink:href', urlThumbHOG);


}
// ///////////////////////////////////
// EVENTS HANDLING
// ///////////////////////////////////

function imageClicked(event) {
	// This Function takes care of teh creation of new svg rectangles.
	// It catches the "click" events on teh svg-image and calls the rectangle
	// creation function
	// TODO: nicer tracking of objects than that ugly array
	var svgRectangle;
	unselectSignClass();
	if (!editFlag) // if not in edit mode, ignore the click or deselect the box
	{
		if (selectFlag || lines[0] != 0) {
			unSelect();
			selectFlag = false;
			setPopUp();
		}
		return;
	}

	if (!clickFlag) // if false, no box is being drawn, so create a new one
	{
		clickFlag = !clickFlag;
		document.body.style.cursor = 'nwse-resize';
		document.getElementById("load").className += "disabled";

		// Important: need to distinguish WHAT was clicekd or have 2 functions
		// for that
		// get position jsut substracting absolute position ofmouse from
		// object's corner
		var xSvg = (event.pageX - x) * zoomInverse;
		var ySvg = (event.pageY - y) * zoomInverse;

		if(!draw_line)
		{
			var bB = new boundingBox(xSvg, ySvg, boxes.length);
			bB.svgBox();
			boxes.push(bB);
			activeRectangle = boxes.length - 1;

			// set onMove
			svgRectangle = document.getElementById(activeRectangle);
			svgRectangle.setAttribute("stroke", "orange");
			svgRectangle.addEventListener("click", imageClicked);

			svgElement.addEventListener("mousemove", resizeRectangle);
		}else
		{
			var new_id = (lines.length <= 1) ? 0 : lines[lines.length-1].id+1;
			var segment = new line(xSvg, ySvg, new_id);
			lines.push(segment);
			svgElement.addEventListener("mousemove", moveLine);//.bind(segment);
		}
		if (visible)
			setPopUp();
	} else // if the flag is true, a box is active and being changed. Fix the
			// and store the new box
	{
		if (!draw_line) // if false, no box is being drawn, so create a new one
		{
			svgElement.removeEventListener("mousemove", resizeRectangle);

			svgRectangle = document.getElementById(activeRectangle);
			svgRectangle.removeEventListener("click", imageClicked);
			document.body.style.cursor = 'auto';
			// store the data in the object too

			boxes[activeRectangle].setMax(svgRectangle.getAttribute("width"),
					svgRectangle.getAttribute("height"));

			// check if box is too small or corrupted!
			if( (svgRectangle.getAttribute("width") < 11) || (svgRectangle.getAttribute("height") < 11))
				{
					boxes.pop();
					document.getElementById("boxes_group").removeChild(svgRectangle);
					clickFlag = !clickFlag;
					return;
				}
			if (reactKeyboard.selected == false) {
				editSignPopup(svgRectangle, boxes[activeRectangle]);
			}

			if (boxes[activeRectangle].symbol == 0) {
				svgRectangle.setAttribute("stroke", noValue);
			} else {
				svgRectangle.setAttribute("stroke", defaultColor);
			}
			clickFlag = !clickFlag;

			if (reactKeyboard.selected == true) {
				reactKeyboard.selected == false;
				unSelect();
				setStatic();
				$("rect").on("mousedown", rectangleMouseDown);
			}
			if (resizeMode)
				if(typeof(boxes[activeRectangle]) !="undefined")
					changesLog.resizeBox(activeRectangle, boxes[activeRectangle].xmax,
						boxes[activeRectangle].ymax);
			else
				if(typeof(boxes[activeRectangle]) !="undefined")
					{
					changesLog.newBox(activeRectangle, boxes[activeRectangle].symbol,
						boxes[activeRectangle].xmin, boxes[activeRectangle].xmax,
						boxes[activeRectangle].ymin, boxes[activeRectangle].ymax);
					}

		}else
		{
			lines[lines.length-1].addSegment();
		}
		trackChanges.changed();
	}
}

function moveLine(event){
	segment = lines[lines.length-1];
	var xSvg = (event.pageX - x) * zoomInverse;
	var ySvg = (event.pageY - y) * zoomInverse;
	segment.x = xSvg;
	segment.y = ySvg;
	}

function resizeRectangle(event) {
	event.preventDefault();

	var svgRectangle = document.getElementById(activeRectangle);
	var width = (event.pageX - x) * zoomInverse - boxes[activeRectangle].xmin;
	var height = (event.pageY - y) * zoomInverse - boxes[activeRectangle].ymin;

	svgRectangle.setAttribute("width", width, 1);
	svgRectangle.setAttribute("height", height, 1);
}

function rectangleClicked(event) {

	if (editFlag) {
		imageClicked(event);
		return;
	}
//	temp2 = event;
//	temp3 = $(event.target).attr("id");
//	temp4 = activeRectangle;

	if (!selectFlag || (activeRectangle != $(event.target).attr("id"))) {

		selectRectangle($(event.target).attr("id"));
		return;
	}
	if (activeRectangle == $(event.target).attr("id")) {
		unSelect();
		setPopUp();
		selectFlag = !selectFlag;
	}

}

function selectRectangle(id) {
	if (!selectFlag) {
		selectFlag = !selectFlag;
	} else if (activeRectangle != id) {
		unSelect();
		selectFlag = true;
	}
	if (resizeMode) {
		document.getElementById("infoDefault").style.display = "none";
		document.getElementById("infoEdit").style.display = "block";
	}
	//var a = boxes[id].symbol;
	$("#number").text(boxes[id].symbol);
	activeRectangle = id;
	rectangleClicked.symbol = boxes[id].symbol;

	if (editName) {
		editSignPopup(document.getElementById(activeRectangle),
				boxes[activeRectangle]);
	}

	if (!train) {
		selectSignClass(rectangleClicked.symbol);
		document.getElementById(id).setAttribute("stroke", selectedColor);
		document.getElementById(id).setAttribute("stroke-width", 3);
	} else{
		document.getElementById(id).setAttribute("stroke", "magenta");
		document.getElementById(id).setAttribute("stroke-width", 3);
	}
	var frame = document.getElementById('dictionary');

	if(frame.classList.contains("dictionaryOpen"))  {
        id = "row" + ("000"+rectangleClicked.symbol).slice(-3);
        if(document.getElementById(id) != null)
            document.getElementById(id).scrollIntoView();
    }
	// setThumbnail(event);

}

function selectSignClass(signClassId) {

	var aAllRectangles;
	aAllRectangles = document.querySelectorAll(`[name='${signClassId}']`);
	aAllRectangles.forEach(function(node) {
		node.setAttribute("stroke", sameValue);	
	});
	selectedSignClass = signClassId;
}

function unselectSignClass() {

	var sUseColor;

	if(selectedSignClass !== "")
	{
		aAllRectangles = document.querySelectorAll(`[name='${selectedSignClass}']`);
		if(train) {
			if(editName) {
				colorizeCorrections();		
			} else {
			
				unSelectWithScore(aAllRectangles);
			}
		} else {
			aAllRectangles.forEach(function(node) {
				if (boxes[node.getAttribute("id")].symbol != "000")
					var color = defaultColor;
				else
					var color = noValue;
				node.setAttribute("stroke", color);	
				node.setAttribute("stroke-width", 1);
			});
		}	
		
	}

	// small check in case we are in detection mode with a selected rectangle
    if(mode == "boxes") {
    	aAllRectangles = document.querySelectorAll("[stroke='magenta']");
	    unSelectWithScore(aAllRectangles);
    }
}

function unSelectWithScore(aAllRectangles) {
	aAllRectangles.forEach(function(node) {
		var hue = Math.round(boxes[node.getAttribute("id")].confidence * 100);
		node.setAttribute("stroke", "hsla(" + hue + ",100%,50%,1)");	
		node.setAttribute("stroke-width", 1);
	});
}

function rectangleMouseDown(event) {

	if (editFlag) {
		imageClicked(event);
		return;
	}

	if (event.target.id == "image") // if the image was clicked, bubble up,
									// maybe a rectangle was clicked!
		return;

	rectangleMouseDown.moved = 0;
	rectangleMouseDown.up = 0;
	rectangleMouseDown.click = true;
	rectangleMouseDown.color = $(event.target).attr("stroke");
	$(event.target).attr("stroke", selectedColor);
	$("rect").attr("pointer-events", "none");
	// $(event.target).attr("pointer-events","all");
	// $(event.target).on("mouseup", rectangleMouseUp);
	// timerStarter = window.setTimeout(function() {
	//
	rectangleMouseDown.current = $(event.target).attr("id");
	rectangleMouseDown.event = event;
	//
	var xSvg = (event.pageX - x) * zoomInverse;
	var ySvg = (event.pageY - y) * zoomInverse;
	//
	rectangleMouseDown.xOffset = boxes[rectangleMouseDown.current].xmin - xSvg;
	rectangleMouseDown.yOffset = boxes[rectangleMouseDown.current].ymin - ySvg;
	//
	$("image").on("mouseup", rectangleMouseUp);
	$("image").on("mousemove", rectangleMouseMove);
	document.body.style.cursor = 'move';
	//
	// }, 5000);
}

function rectangleMouseMove(event) {
	if(noEdit)
		return;
	rectangleMouseDown.click = false;
	var xSvg = (event.pageX - x) * zoomInverse;
	var ySvg = (event.pageY - y) * zoomInverse;
	var svgRectangle = document.getElementById(rectangleMouseDown.current);
	rectangleMouseDown.moved++;
	boxes[rectangleMouseDown.current].xmin = xSvg + rectangleMouseDown.xOffset;
	boxes[rectangleMouseDown.current].ymin = ySvg + rectangleMouseDown.yOffset;
	boxes[rectangleMouseDown.current].setMax(
			svgRectangle.getAttribute("width"), svgRectangle
					.getAttribute("height"));
	svgRectangle.setAttribute("x", xSvg + rectangleMouseDown.xOffset);
	svgRectangle.setAttribute("y", ySvg + rectangleMouseDown.yOffset);
}

function rectangleMouseUp(event) {

	// if(event.handled !== true) //
	// http://sholsinger.com/2011/08/prevent-jquery-live-handlers-from-firing-multiple-times
	// thanks!
	// {
	document.body.style.cursor = 'auto'
	if (rectangleMouseDown.click) {
		// window.clearTimeout(timerStarter);
		// timerStarter = null;

		event.stopPropagation();
		$("image").off("mousemove", rectangleMouseMove);
		$("image").off("mouseup", rectangleMouseUp);
		$("rect").attr("pointer-events", "all");
		// $(event.target).off("mouseup", rectangleMouseUp);
		// $("rect").on("mousedown", rectangleMouseDown);
		rectangleClicked(rectangleMouseDown.event);

		event.handled = true;
		rectangleMouseDown.click = null;
		return;
	}

	event.stopPropagation();
	$("image").off("mousemove", rectangleMouseMove);
	$("image").off("mouseup", rectangleMouseUp);
	// $(event.target).off("mouseup", rectangleMouseUp);
	$(rectangleMouseDown.current).on("mousedown", rectangleMouseDown);
	$("rect").attr("pointer-events", "all");
	// window.clearTimeout(timerStarter);
	trackChanges.changed();
	changesLog.moveBox(rectangleMouseDown.current,
			boxes[rectangleMouseDown.current].xmin,
			boxes[rectangleMouseDown.current].ymin);
	// timerStarter = null;
	rectangleMouseDown.click = null;
	$("#"+rectangleMouseDown.current).attr("stroke", rectangleMouseDown.color);
	event.handled = true;

	// unSelect();
	// }
}

function imageOver(event) {
	$("#tooltip").css("display", "none");
}

function rectangleOver(event) {
	if (!clickFlag && editFlag) {
		resizeRectangle(event);
		return;
	}

	if (!selectFlag) {

		var id = $(event.target).attr("id");
//		var test = false;
	//	var tempName = dictOrdered[boxes[a].symbol];
//		if (typeof tempName == "undefined")
	//		tempName = "N/A";

//		for(var i =0; i< dictOrdered.length; i++) TODO
//			{
	//			if(typeof tempName != "undefined" )
		//			{
	//				$("#nameArea").text(tempName);
			//		test = true;
				//	}
			//	else
					//{
				//	tempName = "N/A"
					//}
//			}
//		if(!test)
//			$("#nameArea").text("N/A");

		document.getElementById("nameArea").innerHTML = boxes[id].unicodeName;

		$("#number").text(boxes[id].symbol);
		document.getElementById("tooltip").innerHTML = boxes[id].symbol+"<br />("+boxes[id].unicodeName+")";
		$("#tooltip").css("display", "block");
		$("#tooltip").css("top", boxes[id].ymax * zoom / 100 + y);
		$("#tooltip").css("left",
				(+boxes[id].xmin / 2 + boxes[id].xmax / 2) * zoom / 100 + x);

		// setThumbnail(event);
	}

	if (train) {
		var conf = boxes[$(event.target).attr("id")].confidence;
		conf = Math.floor(conf * 100);
		$("#signConfidence").text(conf + "\%");
	}

}
function xmlProcess(xmlData) {
	// This function goes through the whole annotation and-or results
	// and creates the results
	// it is assumed that the file is xml

	// extract all of the signs
	if(xmlData === "")
		return;

	var $signs = $(xmlData).find('object');

	$signs.each(function() {
		var box = new boundingBox();
		box.xmlBox($(this));
		if( (box.xmax-box.xmin > 10) && (box.ymax-box.ymin > 10))  // ignore too small or corrupted boxes!
		{
			box.svgBox();
			boxes.push(box);
		}
	});

	// $("rect").on("click",rectangleClicked);
	$("rect").on("mousedown", rectangleMouseDown);
	$("rect").on("mouseover", rectangleOver);
	$("rect").attr("pointer-events", "all");

}

function processCSVLines(csvData){

	if( csvData === "")
		return;

	var csv_lines = csvData.split('\n');

	var data = csv_lines[0].split(',');
	var current_line = data[0];
	var line_obj = new line(parseFloat(data[1]), parseFloat(data[2]), 0);
	lines.push(line_obj);

	for(var i = 1, n = csv_lines.length; i < n; i++)
		{
			data = csv_lines[i].split(',');

			if(data[0] !== current_line)
				{
					current_line = data[0];
					line_obj.clearLast(); // line always adds a last, movable segment, it has to be erased
					line_obj = new line(parseFloat(data[1]), parseFloat(data[2]), lines.length-1);
					lines.push(line_obj);
				}
			else
				{
					line_obj.x = parseFloat(data[1]);
					line_obj.y = parseFloat(data[2]);
					line_obj.addSegment();
				}
		}

	line_obj.clearLast(); // line always adds a last, movable segment, it has to be erased

}
function reactKeyboard(event) {
	this.popUp;
	this.popUpName;
	// If popUp:

	if (visible) {
		if (event.which == _ESC_) // ESC: close Popup.
		{
			oldDetectionsWindow.hide();
			setPopUp();
			return;
		}
		if (event.which == _ENTER_) // ENTER: store data
		{
			if (noEdit) {
				event.preventDefault();
				return;
			}
			event.preventDefault();
			if(dictUpdateOpen) // update dictionary
			{
				dictionaryUpdate();
			}else				// save annotation
				storeSignInfo();

			return;
		}
		return;
	}

	// check for shurtcuts
	if(event.ctrlKey && event.shiftKey)
	{
		switch (event.which) {
		case _A_:
			annotate();
			return;
		case _E_:
			defaultMode();
			return;
		}
	}
    if(event.ctrlKey && event.shiftKey && event.which == _COMMA_) {
        switchAlpha();
    }

	if (this.popUp == true) {
		document.getElementById(this.popUpName).style.display = 'none';
		this.popUp = false;
		return;
	}

	// h -> help
	if (event.which == _H_) {
		document.getElementById("popUp").style.display = 'block';
		this.popUp = true;
		this.popUpName = "popUp";
		return;
	}

	if (event.which == _H_) {
		document.getElementById("popUp").style.display = 'block';
		this.popUp = true;
		this.popUpName = "popUp";
		return;
	}

	// If a rectangle is selected
	if (selectFlag) {
		if (!editName) {
			switch (event.which) {
			case _DEL_: // DEL
				if (noEdit) {
					return;
				}
				var rectangle = document.getElementById(activeRectangle);
				rectangle.parentNode.removeChild(rectangle);
				boxes[activeRectangle] = null;
				changesLog.deleteBox(activeRectangle);
				activeRectangle = null;
				trackChanges.changed();

				break;
			case _ESC_: // ESC
				break;
			case _E_: // e (edit)
				if (noEdit) {
					return;
				}
				document.getElementById(activeRectangle).setAttribute("stroke",
						"orange");
				document.getElementById(activeRectangle).addEventListener(
						"click", imageClicked);
				svgElement.addEventListener("mousemove", resizeRectangle);
				setResize();
				document.body.style.cursor = 'nwse-resize';
				reactKeyboard.selected = true;
				clickFlag = !clickFlag;
				return;
			case _ENTER_: // ENTER ****************************************
				if (!noEdit) {
					event.preventDefault();
					editSignPopup(document.getElementById(activeRectangle),
							boxes[activeRectangle]);
				}
				else
					if(noEdit)
					{
						event.preventDefault();
						document.getElementById("numberEdit").readonly = true;
						document.getElementById("okButtonSave").style.display = 'none';
						editSignPopup(document.getElementById(activeRectangle),
								boxes[activeRectangle]);
					}
				return;
			case _TAB_: // TAB
						// **************************************************
				event.preventDefault();
				var index = parseInt(activeRectangle) + 1;
				while ((index <= boxes.length) && boxes[index] == null) {
					index++;
				}
				if (index <= boxes.length && boxes[index] != null) {
					unSelect();
					selectFlag = !selectFlag;
					selectRectangle(index);
				}
				return;
			default:
				return;
			}
			unSelect();
			selectFlag = !selectFlag;
		}

	}

	// If a rectangle is being drawn
	if (clickFlag) {
		if (event.which == _ESC_) {
			if(draw_line)
				{
					clickFlag = !clickFlag;
					svgElement.removeEventListener("mousemove", moveLine);
					lines[lines.length-1].clearLast();
					if(lines[lines.length-1].segments.length == 0)
						lines.pop();
				}else
				{
					clearCurrentRectangle();
				}
		}
	}

	// if a LINE is selected
	if(lines[0] != 0)
	{
		switch (event.which) {
		case _DEL_: // DEL
			if (noEdit) {
				return;
			}
			lines[lines[0]].erase();
			lines[0] = 0;
			break;
		case _ESC_: // ESC
			unSelect();
			break;
		}

	}
	// General short-cuts
	switch (event.which) {
	case _N_: // N - New Bounding Box Mode.
		// changeMode();
		break;
	}

	// Meta-Data
	if(!clickFlag && !selectFlag)
		{
			if(event.which == _ADD_)   //|| event.which == _ADD2_
 				{
				setPopUp("metaData");
				}
			if(event.which == _HASH_)
				{
					if(detectionInfo.detectedSigns.size > 0)
						document.getElementById("searchedOptions").style.display = "block";
					else
						document.getElementById("searchedOptions").style.display = "none";
					setPopUp("searchedTools");
				}
			if(event.which == _MULT_ || event.which == _DOT_) 
                (event.ctrlKey) ? showLabels(true): showLabels(false);
		}

	if(event.which == _L_){
		// LINE MODE!
		switchModes();

	}
}

function switchAlpha() {
	boxes.forEach(function(element, index, array) {
		if (element != null) {
			var opacity = element.svg.getAttribute("stroke-opacity");
            opacity = (opacity == opacityValue) ? 1 : opacityValue;
			element.svg.setAttribute("stroke-opacity", opacity);
		}
	});
}
function switchModes()
{
	if(train)
		return;

	unSelect();
	if(mode == "boxes")  // change to line
		{
			clickFlag = false;
			document.getElementById("mode").innerHTML = "<b>Line</b> Mode";
			document.getElementById("statusDefault").innerHTML = "Edit Lines";
			document.getElementById("statusAnnotate").innerHTML = "New Lines";
			document.getElementById("boxes_group").style.display = "none";
			document.getElementById("lines_group").style.display = "";
			mode = "lines";
			if(editFlag)
				draw_line = true;
		}
	else
		{
			document.getElementById("boxes_group").style.display = "";
			document.getElementById("lines_group").style.display = "none";
			document.getElementById("mode").innerHTML = "<b>Box</b> Mode";
			document.getElementById("statusDefault").innerHTML = "Edit Boxes";
			document.getElementById("statusAnnotate").innerHTML = "New Boxes";
			if(draw_line)
			{
				draw_line = false;
				if(clickFlag)
				{ // stop drawing if doing so
					clickFlag = false;
					svgElement.removeEventListener("mousemove", moveLine);
					lines[lines.length-1].clearLast();
				}

			}
			else
			{
				clickFlag = false;
				draw_line = false;
				//document.getElementById("mode").innerHTML = "<b>Line</b> Mode";
			}
			mode = "boxes";
		}
    updateTotalBoxes();
	}
function unSelect() {
	if(lines[0] != 0)
		lines[lines[0]].deselect();

	var $sameSymbol = $("[name='" + rectangleClicked.symbol + "']");
	setPopUp();
	if((typeof activeRectangle != 'undefined') && activeRectangle != null)
		document.getElementById(activeRectangle).setAttribute("stroke-width", 1);

	if (resizeMode) {
		document.getElementById("infoEdit").style.display = "none";
		document.getElementById("infoDefault").style.display = "block";
	}
    unselectSignClass();

	selectFlag = false;
	activeRectangle = null;
}

function confidenceUpdate(threshold) {
	var visible = 0;

	boxes.forEach(function(element, index, array) {
		if (element != null) {
			if (element.confidence < threshold) {
				document.getElementById(element.id).setAttribute("display",
						"none");
				element.show = 0;
			} else {
				document.getElementById(element.id).setAttribute("display",
						"true");
				element.show = 1;
				visible++;
			}
		}
	});
	var totalBoxes = boxes.length-1;
	document.getElementById("totals").innerHTML = "Boxes: "+visible+" / "+totalBoxes;
	// update slider value
    document.getElementById("slider").value=threshold;
    // update text below slider
	$("#sliderPosition").text(threshold);
	if(train)
		maximumSuppression(parseFloat(document.getElementById("nonmax").value));  //slider
}

function colorizeConfidence() {
	boxes.forEach(function(element, index, array) {
		if (element != null) {
			var hue = Math.round(element.confidence * 100);
			document.getElementById(element.id).setAttribute("stroke",
					"hsla(" + hue + ",100%,50%,1)");
		}
	});
}

function colorizeNGram(direction) {

	switch(direction)
	{
	case "lr":
		boxes.forEach(function(element, index, array) {
			if (element != null) {
				var hue = Math.round(element.ngram * 100);
				document.getElementById(element.id).setAttribute("stroke",
						"hsla(" + hue + ",100%,50%,1)");
			}
		});
		break;
	case "rl":
		boxes.forEach(function(element, index, array) {
			if (element != null) {
				var hue = Math.round(element.prior * 100);
				document.getElementById(element.id).setAttribute("stroke",
						"hsla(" + hue + ",100%,50%,1)");
			}
		});
		break;
	default:
		boxes.forEach(function(element, index, array) {
			if (element != null) {
				var hue = Math.round(Math.max(element.ngram, element.prior) * 100);
				document.getElementById(element.id).setAttribute("stroke",
						"hsla(" + hue + ",100%,50%,1)");
			}
		});
	}
}

function colorizeCorrections() {

	boxes.forEach(function(element, index, array) {
		if (element != null) {
			if (element.reviewed) {
				if (!element.fp)
					document.getElementById(element.id).setAttribute("stroke",
							"lawngreen"); // Reviewed and not FP -> ok!
				else if (element.correction != "000")
					document.getElementById(element.id).setAttribute("stroke",
							"yellow"); // Reviewed, FP but still a sign
				else
					document.getElementById(element.id).setAttribute("stroke",
							"red"); // Not even a sign!
			} else
				document.getElementById(element.id).setAttribute("stroke",
						"blue");
		}
	});
}

function toggleLoadButtons() {
	if (annotationsLoaded) {
		document.getElementById("load").style.display = 'none';
		document.getElementById("lastResult").style.display = 'none';
	    document.getElementById("lastResultOld").style.display = "none";
		// document.getElementById("upload").style.display = 'none';
		document.getElementById("detect").style.display = 'none';
		document.getElementById("reload").style.display = 'block';
		document.getElementById("clear").style.display = 'block';
	//	document.getElementById("saveLocal").style.display = 'block';
		if (!train)
			document.getElementById("backup").style.display = 'block';
		$('.helpAnnotate').css("display", "block");
		$('.editpossible').css("display", "block");
		$('.helpTraining').css("display", "none");
		$('.helpStart').css("display", "none");
		if(offline)
			return;
		if(statusAnnotations == "done")
			$('.editpossible').css("display", "none");

	} else {
		document.getElementById("load").style.display = 'block';
		document.getElementById("lastResult").style.display = 'block';
	    document.getElementById("lastResultOld").style.display = "none";
		// document.getElementById("upload").style.display = 'block';
		document.getElementById("detect").style.display = 'block';
		document.getElementById("reload").style.display = 'none';
		document.getElementById("clear").style.display = 'none';
		document.getElementById("slider").style.display = "none";
		document.getElementById("confidenceArea").style.display = "none";
		document.getElementById("sliderPosition").style.display = "none";
		document.getElementById("backup").style.display = 'none';
	//	document.getElementById("saveLocal").style.display = 'none';
		$('.helpAnnotate').css("display", "none");
		$('.editpossible').css("display", "none");
		$('.helpTraining').css("display", "none");
		$('.helpStart').css("display", "block");
	}
}

function saveAnnotationsServer(saveMode, bCorrection=false) {


	if (saveMode=='archive')
		{
		// check for unnamed boxes!
		boxes.forEach(function(element, index, array) {
			if(element !=null && element.symbol == "000")
				window.alert("There are unlabeled boxes, archiving not possible!");
			});

		if(!trackChanges.prompt("Are you sure you want to archive this annotation?\nOnce archived, an annotation con not be edited and is free to be used for training!"))
			return;
		else
			{
			document.getElementById("backupSelect").style.display ='none';
			//document.getElementById("archiveServer").style.display ='none';
			statusAnnotations = 'done';
			noEditMode();
			}
		}
	else
		{
		if($('#saveServer').hasClass("disabled") && !$("#statusCorrect").hasClass("statusSelected"))
		{
			console.log('Saving not allowed');
			return;
		}
		}


	var newXML = generateXML(bCorrection);
	var XMLS = new XMLSerializer();
	var uploadData = {};

	if(boxes.length >1)
	{
		uploadData.xml = XMLS.serializeToString(newXML);
	}
	else
		uploadData.xml = "";

	uploadData.saveMode = saveMode;

	if(lines.length > 1)
		{
		var csv = Array();
		lines.forEach(function(element, index, array){

			if(element instanceof line)
				csv.push(element.getCSV());
		});
		uploadData.lines = csv.join('\n');
		}
	else
		uploadData.lines = "";

	//JSON.stringify(uploadData);
	$.ajax({
/*		type : "GET",
		url : "uploadannotation.php?annotationStatus=" + saveMode,
		dataType : "json",
		async : true,
		cache : false,
		error : function() {
			alert("No data found.");
		},
		success : function(array) {
			$.ajax({*/
				type : "POST",
				url : "uploadannotation.php",
				data : uploadData,
				//processData : false,
				//contentType : "application/json", // was xml
				cache : false,
				error : function() {
					alert("No data found.");
				},
				success : function() {
					trackChanges.saved();
					if (annotationsVersions > 0) {
						var sel = document.getElementById("backupSelect");
						var opt1 = document.createElement("option");
						opt1.value = annotationsVersions + 1;
						opt1.text = "Version " + annotationsVersions;
						sel.add(opt1, sel.options[1]);
					}
					annotationsVersions = annotationsVersions + 1;
					statusAnnotations = "partial";
					var JSONdata = changesLog.flushLog();
					$.ajax({
						type : "POST",
						url : "logChanges.php",
						data : JSONdata,
						processData : false,
						contentType : "application/json",
						cache : false,
						error : function(jqXHR, textStatus, errorThrown) {
							alert(errorThrown);
						},
						success : function() {

						}
					});

				}
			});
		/*}
	});*/
}

function possibleAutoAnnote()
{
	if(statusAnnotations == "none")
		setPopUp('generateAnno');
	else
		sendCorrections(false);
}
function sendCorrections(newAnno) {
	// Check if all corrected and select the correct ones
	var threshold = document.getElementById("slider").value; // TODO
	var positives = [];
	var falsePositives = []; //
	var notAllReviewed = false;
	var goOn = true;
	var signsList = []; // to tell php which signs are to be saved
	var totalDetections = 0;
	var threshDetections = 0;

	boxes.forEach(function(element, index, array) {
		if (element != null)
			{
				totalDetections += 1;
				if( element.confidence >= threshold)
					// element
																		// exists and is
																		// bigger than
																		// threshhold
				{
					totalDetections += 1;
					if (!element.reviewed)
						notAllReviewed = true;
					else if (element.fp)
						{
						threshDetections += 1;
						falsePositives.push(element.boxCorrections());
						if(signsList.indexOf(element.symbol) == -1)   // check if the name was already stored
							signsList.push(element.symbol);
						}
					else
						{
						positives.push(element.boxCorrections());
						threshDetections += 1;
						}
				}
			}
		});

	// If not, prompt
	if (notAllReviewed)
		goOn = window
				.confirm("You haven't reviewed all the detections.\nAre you sure you want to send the corrections?\nCurrent detection data will be lost!!\n(Think about saving the corrections and finishing your feedback later!)");

	// if it's a go: Sort the
	var data = {};
	data = {
			'detectionID': detectionInfo.ID,
			'fpList': signsList,
			'positives' : positives,
			'fp' : falsePositives,
			'threshold': threshold,
			'totalDetections': totalDetections,
			'threshDetections': threshDetections,
			'fullFeedback': JSON.stringify(boxes) ,
			'newAnnotation': newAnno
			};
	JSON.stringify(data);
	if (goOn)
		$.ajax({
			type : "POST",
			url : "storeCorrections.php",
			data : data,
			cache : false,
			error : function() {
				console.log("Error sending corrections!");
				window.alert("An error ocurred");
				return;
			},
			success : function(result) {
				document.getElementById("saveCorrections").style.display = "none";
				document.getElementById("sendCorrections").style.display = "none";
				document.getElementById("reTrain").style.display = "block";
				if(statusAnnotations == 'none')
					{
					statusAnnotations = 'partial';
					window.alert("An annotation for this image has been generated from the positive feedback");
					}
			}
		});
}

function clearAnnotations() {
	var rectangle;

	if (!trackChanges.prompt("Are you sure you want to clear the annotations?"))
		return;

	annotationsLoaded = false;

/*	boxes.forEach(function(element, index, array) {
		if (element != null) {
			rectangle = document.getElementById(element.id);
			rectangle.parentNode.removeChild(rectangle);
		}
	});*/

	// get all the obects in teh svg
	var SVG = document.getElementById("boxes_group").children;

	// loop over all the rectangles and erase them!
	// We have to start at the _end_ or the indexing will be lost!
	for(var i = SVG.length-1; i>=0; i--)
		{
			SVG[i].parentNode.removeChild(SVG[i]);
		}

	var SVG = document.getElementById("lines_group").children;

	// loop over all the lines and erase them!
	// We have to start at the _end_ or the indexing will be lost!
	for(var i = SVG.length-1; i>=0; i--)
		{
			SVG[i].parentNode.removeChild(SVG[i]);
		}

	boxes = [ null ];
	lines = [ 0 ];
	toggleLoadButtons();
	document.getElementById("statusfeld").style.display = "block";
	document.getElementById("infoDetect").style.display = "none";
	if (train) {
		train = false;
		$("#clear").text("Clear Annotations");
		$("#mode").text("Box Mode");
		document.getElementById("infoDetect").style.display = "none";
		document.getElementById("backup").style.display = "none";
		document.getElementById("infoTrain").style.display = "none";
		document.getElementById("statusAnnotate").style.display = 'block';
		//document.getElementById("statusEdit").style.display = 'block';
		document.getElementById("statusDefault").style.display = 'block';
		document.getElementById("statusCorrect").style.display = 'none';
		document.getElementById("buffer1").style.display = 'none';
		document.getElementById("buffer2").style.display = 'none';
		document.getElementById("sendCorrections").style.display = "none";
		document.getElementById("reTrain").style.display = "none";
		document.getElementById("trainCheckboxes").style.display = "none";
		document.getElementById("HOGandModel").style.display = "none";

	}
	changesLog.clearLog();
	trackChanges.clear();
	//document.getElementById("loadLocal").style.display = 'block';
	if(offline)
		{
			defaultMode();
		}
	if (statusAnnotations == "done") {
		noEditMode();
	}
	else
		defaultMode();

	activeRectangle = null;
	document.getElementById("totals").innerHTML = "Boxes: 0";
}

function reloadAnnotations(version) {
	clearAnnotations();
	loadAnnotations(version);
	updateTotalBoxes();
}

function editSignPopup(svgRectangle, boundingBox) {
	xSVG = boundingBox.xmax * zoom / 100 + 50;
	ySVG = boundingBox.ymax * zoom / 100 + 50;
	document.getElementById("signEdit").style.left = xSVG;
	document.getElementById("signEdit").style.top = ySVG;
	document.getElementById("numberEdit").value = boundingBox.symbol;
	if(boundingBox.readableSymbol != "N/A")
	{
		document.getElementById("editHumanReadable").innerHTML = boundingBox.unicodeName + " ("+boundingBox.symbol+")";
	}else
		document.getElementById("editHumanReadable").innerHTML = "No dictionary entry";

	document.getElementById("editWarning").style.display = "none";

	if (train) {
		// document.getElementById("model").src = "images/models/e2-thumb.jpg";
		if(!noEdit)
			document.getElementById("trainCheckboxes").style.display = "block";
		else
			document.getElementById("trainCheckboxes").style.display = "none";

	//	document.getElementById('model').setAttribute('xlink:href',	resultsDirectory + boundingBox.thumbName);
	//	document.getElementById('hog').setAttribute('xlink:href',	resultsDirectory + boundingBox.HOGName);

//		var svgmodel = document.getElementById("svgModel");
//		svgmodel.setAttribute("width", boundingBox.thumbWidth);
//
//		svgmodel.setAttribute("height", boundingBox.thumbHeight);
//
//		var model = document.getElementById("model");
//		model.setAttribute("x", -boundingBox.thumbXStart);
//		var svgHOG = document.getElementById("svgHOG");
//		svgHOG.setAttribute("width", boundingBox.thumbWidth);
//
//		svgHOG.setAttribute("height", boundingBox.thumbHeight);
//
//		var HOG = document.getElementById("hog");
//		HOG.setAttribute("x", -boundingBox.thumbHOG);
		document.getElementById("wrongSign").checked = false;
		document.getElementById("noSign").checked = false;
		document.getElementById("numberEdit").readOnly = true; // the number
																// field will
																// only be
																// editable
																// after
																// clicking on
																// the richt
																// checkbox (to
																// avoid
																// mistakes)
		var roundScore = Math.round(boundingBox.confidence*100)/100;
		document.getElementById("showConfidence").innerHTML = roundScore;
	}
	var svgthumb = document.getElementById("svgThumb");
	var scaling = 100/svgRectangle.getAttribute("height");
	svgthumb.setAttribute("width", svgRectangle.getAttribute("width") * scaling);
	svgthumb.setAttribute("height", svgRectangle.getAttribute("height") * scaling);
	svgthumb.setAttribute("viewBox", [boundingBox.xmin, boundingBox.ymin, svgRectangle.getAttribute("width"), svgRectangle.getAttribute("height")])
	// svgthumb.setAttribute("transform", "scale(" + scaling + ")");

	// Select the correct radio button
	document.querySelector(`#SignConservationState input[value="${boundingBox.status}"]`).checked = true;

	setPopUp("signEdit");
	document.getElementById("numberEdit").focus();
	document.getElementById("numberEdit").select();

	// Place the big nasty thumbnail correctly.
	//var thumb = document.getElementById("thumb");
	//thumb.setAttribute("x", -boundingBox.xmin);
	//thumb.setAttribute("y", -boundingBox.ymin);


}

function storeSignInfo() {
	var editElement = document.getElementById("numberEdit");
	var newName = editElement.value;
	var warning = document.getElementById("editWarning");
	var rectangle = document.getElementById(activeRectangle);

	// Re-doing this for text-based annotations!
	// TODO
	// Check for alphanumeric, skip if 000!
	// this checks if newName is in dictionary and returns:
	// newName.newName = input; // original name "N/A" if original input numeric AND no entry in dictionary NAME if exists in DIctionary
	// newName.label   = "000"; // new numeric label
	// newName.numeric = false; // was the original numeric?
	// newName.newEntry = false; // did the original need a new Entry in the dictionary?

	newName = parseInput(newName);

	if (!train) { // Normal annotating mode
		if (newName != null) { // correct input!

			if(newName.newEntry)
				return;  // this is a new entry, so wait for more input!

			// First, new numeric label
			// Numeric value will only change if different from actual value and non-zero
			if (newName.label != boxes[activeRectangle].symbol && newName.label != 0) {
			//	newNameID = ("000" + (newNameID)).slice(newNameID.length); done by parser
				boxes[activeRectangle].symbol = newName.label;

				rectangle.setAttribute("name", newName.label);
				rectangle.setAttribute("stroke", defaultColor);
				changesLog.newLabel(activeRectangle, newName.label);
				trackChanges.changed();
			}
			if(newName.newName != boxes[activeRectangle].readableSymbol) // different HR name (could just be a synonim!)
			{
				boxes[activeRectangle].readableSymbol = newName.newName;
				boxes[activeRectangle].unicodeName = unicodize(newName.newName);
				trackChanges.changed();
			}

			if(newName.label == nextLabel)
				{
					var temp = parseInt(nextLabel);
					if(temp != usedLabels.length)
					{
						usedLabels[temp] = 1;
						for (var i = temp; i<usedLabels.length; i++)
							{
								if( typeof usedLabels[i] == "undefined")
									{
										nextLabel = ("000"+i).slice(-3);
										break;
									}
							}
					}else
						{
							nextLabel = ("000"+(temp+1)).slice(-3);
							usedLabels[temp] = 1;
						}

				}
			warning.style.display = "none";
			// Now check the conservation state
			if(boxes[activeRectangle].status != getConservationState()) {
				boxes[activeRectangle].status = getConservationState();
				trackChanges.changed();
			}
            rectangle.classList.remove("intact");
            rectangle.classList.remove("broken");
            rectangle.classList.remove("partial");
            rectangle.classList.add(getConservationState());
			setPopUp();
			unSelect();
			return;
		} else {
			editElement.value = "";
			warning.innerHTML = "Not a valid label!";
			warning.style.display = "block";

			return;
		}
	} else { // Trainign mode, saving corrections
		if (document.getElementById("noSign").checked) // Not a sign!
		{
			boxes[activeRectangle].fp = true;
			boxes[activeRectangle].reviewed = true;
			boxes[activeRectangle].correction = "000";
			boxes[activeRectangle].corRead = "";
			rectangle.setAttribute("name", "000");
			rectangle.setAttribute("stroke", "red");
		}
		if (document.getElementById("wrongSign").checked) {
			if (newName != null && !newName.newEntry) // Only if this not a new entry
			{
				if (newName.label != boxes[activeRectangle].symbol) { //accept the changes _only_ if a new number typed!
					boxes[activeRectangle].fp = true;
					boxes[activeRectangle].reviewed = true;
					boxes[activeRectangle].corRead = unicodize(newName.newName);
					rectangle.setAttribute("stroke", "yellow");
					boxes[activeRectangle].correction = newName.label;
                    boxes[activeRectangle].wrongLabel = boxes[activeRectangle].symbol;
                    boxes[activeRectangle].symbol = newName.label;
                    boxes[activeRectangle].unicodeName = boxes[activeRectangle].corRead;
                    rectangle.setAttribute("name", newName.label);  
                    boxes[activeRectangle].readableSymbol = newName.newName;
				} else {
					editElement.value = boxes[activeRectangle].symbol;
					warning.innerHTML = "Please type a correction.";
					warning.style.display = "block";
					return;

				}
			} else {
				if(!newName.newEntry) // if newEntry, no error mesage
				{
					editElement.value = boxes[activeRectangle].symbol;
					warning.innerHTML = "Not a valid Label!";
					warning.style.display = "block";
				}
				return;
			}
		}
		if (!boxes[activeRectangle].fp) // no corrections made > correct sign!
		{
			boxes[activeRectangle].reviewed = true;
			rectangle.setAttribute("stroke", "lawngreen");
		}
		boxes[activeRectangle].status = getConservationState();
rectangle.classList.remove("intact");
            rectangle.classList.remove("broken");
            rectangle.classList.remove("partial");
            rectangle.classList.add(getConservationState());
		setPopUp();
		unSelect();
		// now move the svg Box to the back!
		var parent = document.getElementById("boxes_group");
		// remove the rectangle first
		parent.removeChild(rectangle);
		// insert it at the beginning
		parent.insertBefore(rectangle, parent.children[1]);

		return;
	}
	editElement.value = "";

}

function getConservationState() {
	return document.querySelector('input[name="conservation"]:checked').value;
}

function acceptAllCorrections() {
    
    for(var i = 1; i < boxes.length; i++) {
            if(boxes[i].show == 1) {
			    boxes[i].reviewed = true;
			    boxes[i].svg.setAttribute("stroke", "lawngreen");
            }
    }
}
function toggleTrainCheckBoxes(checkBox) {
	if (checkBox.id == "wrongSign") {
		if (checkBox.checked) // it was checked -> enable textfield!
		{
			document.getElementById("numberEdit").readOnly = false;
			document.getElementById("numberEdit").focus();
		} else
			document.getElementById("numberEdit").readOnly = true;

		if (document.getElementById("noSign").checked)
			document.getElementById("noSign").checked = false;

	} else // it"s the other cb!
	{
		if (checkBox.checked) {
			document.getElementById("numberEdit").readOnly = true; // not even
																	// a sign,
																	// no need
																	// to write
																	// anything
			document.getElementById("wrongSign").checked = false;
		}

	}
}

function setPopUp(name) {
	this.visible;
	this.active;

	if (typeof name != 'undefined') {
		// check if one is already assigned!
		if (this.active != null)
			setPopUp();

		this.active = name;
		this.visible = true;
		document.getElementById(name).style.display = "block";
	} else {
		if (typeof active != 'undefined')
			if (active != null) {
				this.visible = false;
				document.getElementById(active).style.display = "none";
				this.active = null;
				if (editName)
					unSelect();
			}

	}
	if (typeof visible == 'undefined')
		visible = false;
}

function clearCurrentRectangle() {
	if (clickFlag) // if true, a box is being drawn
	{
		var svgRectangle = document.getElementById(activeRectangle);
		svgElement.removeEventListener("mousemove", resizeRectangle);
		svgRectangle.removeEventListener("click", imageClicked);
		svgRectangle.parentNode.removeChild(svgRectangle);
		if (!(reactKeyboard.selected)) // an existing rectangle wasn't being
										// drawn!!
		{

			boxes[activeRectangle] = null;

		} else {
			boxes[activeRectangle].svgBox();
		}
		clickFlag = !clickFlag;
	}
	// IMPORTANT: do not revert to incorrect mode!!!
	if (resizeMode)
		setMove();
	activeRectangle = null;
}

function changesTracker() {
	edited = false;
	mayArchivate = false;

}

changesTracker.prototype.changed = function() {
	if (this.mayArchivate) {
		document.getElementById("saveServer").style.display = "block";
		//document.getElementById("archiveServer").style.display = "none";
		this.mayArchivate = false;
	}
	if (!this.edited) {
		$("#statusSave").text("Not Saved");
		this.edited = true;
		$("#statusSave").toggleClass("statusAttention");
		$("#saveServer").removeClass("disabled");
	}
	if(!train) {
		updateTotalBoxes();
	}
};
changesTracker.prototype.clear = function() {
	$("#statusSave").text("Saved");
	$("#statusSave").removeClass("statusAttention");
	document.getElementById("saveServer").style.display = "block";
	//document.getElementById("archiveServer").style.display = "none";
	this.edited = false;
	this.mayArchivate = false;
	$("#saveServer").addClass("disabled");
};

changesTracker.prototype.saved = function() {
	if (this.edited) {
		$("#statusSave").text("Saved");
		$("#statusSave").toggleClass("statusAttention");
		//document.getElementById("saveServer").style.display = "none";
		//if(statusAnnotations != "done")
			//document.getElementById("archiveServer").style.display = "block";
		this.edited = false;
		this.mayArchivate = true;
		$("#saveServer").addClass("disabled");
	}

};

changesTracker.prototype.prompt = function(message) {
	if (this.edited || this.mayArchivate)
		return window.confirm(message);
	else
		return true;

};

function clearMode() {
	$('#statusAnnotate').removeClass('statusSelected');
	$('#statusEdit').removeClass('statusSelected');
	$('#statusDefault').removeClass('statusSelected');
	$('#statusProtected').removeClass('statusSelected');
	$('#statusCorrect').removeClass('statusSelected');
	if(clickFlag && draw_line)
	{ // stop drawing if doing so
		clickFlag = !clickFlag;
		svgElement.removeEventListener("mousemove", moveLine);
		lines[lines.length-1].clearLast();
	}

	setPopUp();
	clearCurrentRectangle();
	unSelect();
	editName = false;
	editFlag = false;
	clickFlag = false;
	selectFlag = false;
	noEdit = false;
	reactKeyboard.selected = false;
	resizeMode = false;
	draw_line = false;
	document.getElementById("infoNewBoxes").style.display = "none";
	document.getElementById("infoRelabel").style.display = "none";
	document.getElementById("infoDefault").style.display = "none";
	document.getElementById("infoProtected").style.display = "none";
	document.getElementById("infoEdit").style.display = "none";
	document.getElementById("numberEdit").readonly = false;
	document.getElementById("okButtonSave").style.display = 'inline-block';
	document.getElementById("sendCorrections").style.display = "none";
	document.getElementById("saveCorrections").style.display = "none";
	document.getElementById("loadBackup").style.display = "none";
	document.getElementById("cleanUp").style.display = "none";
    document.getElementById("acceptAll").style.display = "none";
	document.getElementById("generalHelp").style.display = "block";
	document.getElementById("trainHelp").style.display = "none";
	//document.getElementById("totals").style.display = "none";
	document.getElementById("image").style.cursor = "auto";
	document.getElementById("nonMaxBox").style.display = "none";
	document.getElementById("lastResult").style.display = "block";
	document.getElementById("lastResultOld").style.display = "block";
	updateTotalBoxes();
//	if(annotationsLoaded)
		//document.getElementById("saveLocal").style.display = "block";
//	else
		//document.getElementById("saveLocal").style.display = "none";
}

function setTraining()
{
	annotationsLoaded = !annotationsLoaded;
	train = true;
	$("#clear").text("Quit Training"); // TODO better own button.
	document.getElementById("confidenceArea").style.display = "block";
	document.getElementById("slider").style.display = "block";
	document.getElementById("sliderPosition").style.display = "block";
	document.getElementById("statusfeld").style.display = "none";
	document.getElementById("infoDetect").style.display = "block";
	document.getElementById("backup").style.display = "none";
	$("#mode").text("Train Mode");
	$('.helpAnnotate').css("display", "none");
	$('.editpossible').css("display", "none");
	$('.helpTraining').css("display", "block");
	$('.helpStart').css("display", "none");
	trainMode();
	trackChanges.saved();

}
function trainMode() {
	train = true;
	// relabel();
	noEditMode();
	toggleLoadButtons();
	document.getElementById("backup").style.display = 'none';
	document.getElementById("infoTrain").style.display = "block";
	document.getElementById("statusAnnotate").style.display = 'none';
	//document.getElementById("statusEdit").style.display = 'none';
	document.getElementById("statusDefault").style.display = 'none';
	document.getElementById("statusCorrect").style.display = 'block';
	document.getElementById("buffer1").style.display = 'block';
	document.getElementById("buffer2").style.display = 'block';
	document.getElementById("saveServer").style.display = 'none';
	//document.getElementById("loadLocal").style.display = 'none';
	document.getElementById("generalHelp").style.display = "none";
	document.getElementById("trainHelp").style.display = "block";
	//document.getElementById("saveLocal").style.display = "none";
	document.getElementById("HOGandModel").style.display = "block";
	//document.getElementById("totals").style.display = "block";
	document.getElementById("cleanUp").style.display = "block";
	document.getElementById("nonMaxBox").style.display = "block";
	$('.helpAnnotate').css("display", "none");
	$('.editpossible').css("display", "none");
	$('.helpTraining').css("display", "block");
	confidenceUpdate(0.3); // This will initialize the confidence tracker.
	document.getElementById("slider").value=0.3;
}
function annotate() {
	clearMode();
	$('#statusAnnotate').addClass('statusSelected');
	annotationsLoaded = true;
	toggleLoadButtons();
	document.getElementById("image").style.cursor = "crosshair"
	setResize();
	if (!train)
		{
		document.getElementById("infoNewBoxes").style.display = "block";
	//	document.getElementById("saveLocal").style.display = "block";
		}
}

function correctMode() {
	clearMode();
	$('#statusCorrect').addClass('statusSelected');
	editName = true;
	setStatic();
	document.getElementById("infoDetect").style.display = "none";
	document.getElementById("infoCorrect").style.display = "block";
	document.getElementById("reTrain").style.display = "none";
	document.getElementById("saveServer").style.display = "none";
	document.getElementById("reload").style.display = "none";
	document.getElementById("sendCorrections").style.display = "block";
	document.getElementById("saveCorrections").style.display = "block";
	document.getElementById("generalHelp").style.display = "none";
	document.getElementById("lastResult").style.display = "none";
	document.getElementById("lastResultOld").style.display = "none";
	document.getElementById("trainHelp").style.display = "block";
	document.getElementById("infoTrain").style.display = "none";
	document.getElementById("infoFeedback").style.display = "block";
    document.getElementById("acceptAll").style.display = "block";
	// @TD
	document.getElementById("cleanUp").style.display = "block";
	document.getElementById("nonMaxBox").style.display = "block";
	$('.helpAnnotate').css("display", "none");
	$('.helpTraining').css("display", "block");
	$('.editpossible').css("display", "none");
	colorizeCorrections();
}
function relabel() {
	clearMode();
	$('#statusEdit').addClass('statusSelected');
	editName = true;
	setStatic();
	toggleLoadButtons();
	if (!train)
		document.getElementById("infoRelabel").style.display = "block";
	if(!annotationsLoaded && backupAvailable)
		document.getElementById("loadBackup").style.display = "block";
}

function defaultMode() {
	clearMode();
	resizeMode = true;
	$('#statusDefault').addClass('statusSelected');
	setMove();
	if (!train)
		document.getElementById("infoDefault").style.display = "block";
	if(!annotationsLoaded && backupAvailable)
		document.getElementById("loadBackup").style.display = "block";
}

function noEditMode() {
	clearMode();
	$('#statusProtected').addClass('statusSelected');