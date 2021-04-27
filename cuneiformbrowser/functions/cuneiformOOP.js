
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