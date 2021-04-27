
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