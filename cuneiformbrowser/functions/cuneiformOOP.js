
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