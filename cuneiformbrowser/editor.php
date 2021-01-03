<?php if(session_status() !== PHP_SESSION_ACTIVE) {
	session_start();
}
	// Call session manager and check if a user is logged in
	//include('sessionManagement.php');
	// Config files
	include_once('config.php');
	// Set up the Editor and prepare the html functions. Here the $_SESSION['cuneidemo'] variabels are set.
	include_once('editorBuild.php');

?>
<html>
<head>
<link rel="stylesheet" type="text/css" href="styleEditor.css">
<meta http-equiv="content-type" content="text/html; charset=utf-8">
<title>Loading...</title>

<script src="lib/jquery.min.js"></script>
</head>
<body>
<div class="container">
<div id="overlay" onclick=""></div>
<div class="menu" style="cursor:default;">
<p id="tabletName"><b> Loading... </b></p>
<div id="totals" class="small">Boxes: 0/0</div>
<div class="signInfo">
<p style="text-align: center;">Sign's Information </p>
<div class="numberArea" id="number">00</div>
<div id="nameArea" class="numberArea nameArea"> AN
    </div>
<div id="confidenceArea" style="display:none;"> <div class="confidenceArea" id="signConfidence" >00</div></div>
</div>

<input type=range min=0 max=1 value=0 id="slider" step=".01" oninput="confidenceUpdate(this.value)" disabled="true" autocomplete="off" style="display: none;" >
<div id="sliderPosition" style="display: none;">0</div>
<hr>
Zoom
<select name="zoom" id="zoom" onchange='resizeEverything(this.value);' autocomplete="off">
  <option value="150">150%</option>
  <option value="100">100%</option>
  <option value="75">75%</option>
  <option value="50">50%</option>
  <option value="25">25%</option>
  <option value="10">10%</option>
</select>
<hr>
<form>
<div id="online">
	<div><div style="float:left;margin-left:2em;">Server Services</div> <div class="button helpButton" onclick='setPopUp("popServerServices");'>?</div></div><br />
	<div class="button" id="detect" onclick=' setPopUp("popDetect");' >Detect</div> <!-- onclick=' setPopUp("popDetect");' -->
	<div class="button" id="load" onclick="loadAnnotations();">Load Annotations</div>
	<!-- <div class="button" id="upload" >Upload Annotations</div> -->
	<div class="button disabled" id="saveServer" onclick="saveAnnotationsServer('noArchive');">Save Annotations</div>
	<!-- <div class="button" id="archiveServer" onclick="saveAnnotationsServer('archive');" style="display:none">Archive</div> -->
	<div class="button" id="sendCorrections" onclick="saveAnnotationsServer('noArchive', true);" style="display:none">Save as Annotation</div>
	<div class="button" id="saveCorrections" onclick="saveCorrections();" style="display:none">Continue Later</div>
	<div class="button" id="reTrain" onclick="prepareRetrain();" style="display:none">Re-train</div>
	<div class="button" id="backStart" >Back to Index</div>
	<div class="button" id="clear" style="display: none;" onclick="clearAnnotations();">Clear Annotations</div>
	<div class="button" id="reload" style="display: none;" onclick="reloadAnnotations();">Reload Annotations</div>
	<div class="button" id="lastResult" style="display: block;" onclick="loadResults('');">Load latest Result</div>
	<div class="button" id="lastResultOld" style="display: block;" onclick="oldDetectionsWindow.show();">Load old Results</div>
    <div class="button" id="acceptAll" style="display: none;" onclick="acceptAllCorrections();">Accept all Results</div>
	<div class="button" id="cleanUp" style="display: none;" onclick="cleanUp();">Clean-up Results</div>
	<div class="button" id="loadBackup" style="display: none;" onclick="restoreBackup()">Continue Feedback</div>

	<div id="backup" style="display: none;">
	<select name="backupSelect" id="backupSelect" onchange='reloadAnnotations(this.value);' autocomplete="off">
	  <option value="0">Newest Annotation</option>
	</select>
	</div>
	<hr>

</div>
<!-- <div><div style="float:left;margin-left:2em;">Local Functions</div> <div class="button helpButton" onclick='setPopUp("popLocalServices");'>?</div></div><br />
<div class="button" onclick="localImage('start')" style="display: none;" id="localImage">Load Image</div>
<div class="button" onclick="localAnnotation('start')" id="loadLocal">Load Locally</div>
<div class="button" id="clearOff" style="display: none;" onclick="clearAnnotations();">Clear Annotations</div>
<div class="button" id="saveLocal" onclick="downloadXML();">Save Locally</div>-->
</form></div>
<div class="infoPanel infoHelp" id="helpPanel" style="height:8.5em; cursor:default;">
<div id="infoEdit" style="display: none"> <br /> <b>Click</b> a Box to select<br />
<i><b>Click</b> and <b>Drag</b></i> to move
</div>
<div id="infoProtected">
<br /> <b>Click</b> a Box to select<br />
Press <b>ESC</b> to deselect<br />
Press <b>TAB</b> to change box
Press <b>ENTER</b> to see details
</div>
<div id="infoDefault" style="display: none">
<i><b>Click</b> and <b>Drag</b></i> to move<br />
 <b>Click</b> a Box to select:<br />
Press <b>E</b> to resize the box<br />
Press <b>ENTER</b> to relabel<br />
Press <b>DEL</b> to erase<br />
Press <b>ESC</b> to deselect<br />
Press <b>TAB</b> to change box</div>

<div id="infoRelabel" style="display: none">
<br /> <b>Click</b> a Box to relabel<br />
Press <b>ESC</b> to deselect<br />
<b>Click</b> on image to deselect
</div>
<div id="infoTrain" style="display: none">
<br /> <b>Click</b> a Box to select<br />
Change confidence threshhold moving the slider<br />
Press <b>ENTER</b> to see details<br />
</div>
<div id="infoFeedback" style="display: none">
<br /> <b>Click</b> a Box to select<br />
Change confidence threshhold moving the slider<br />
Press <b>ENTER</b> to give feedback<br />
</div>
<div id="infoNewBoxes" style="display: none">
<div class="small" style="text-align: center;"><br />Start on upper-right corner!</div>
<b>Click</b> to draw new Box <br />
<b>ESC</b> to cancel drawing <br />
<b>Click</b> to end drawing<br />
<b style="color:red;">NOT</b> Click&Drag!!!
</div>
</div>
<div class="infoPanel" style="cursor:default;">
	Signs' Color Code
	<br />

	<div id="statusfeld" style="width:10em;margin-left:0.5em;">
		<div style="float:left; width:1em;margin-top:0.05em">
			<div class="smallbox" id="annotationColor"></div>
			<div class="smallbox" id="nonAnnotationColor"></div>
			<div class="smallbox" id="selectedColor"></div>
			<div class="smallbox" id="sameColor"></div>
		</div>
		<div  style="text-align:left;float:left; margin-left:0.5em;">
			Annotated<br />
			 Not Annotated<br />
			 Selected<br />
			 Same Value<br />
		</div>
	</div>
<!--  		<div id="statusfeld" style="text-align:left;"> -->
<!-- 		Annotated<div class="smallbox" id="annotationColor"></div><br /> -->
<!-- 		 Not Annotated<div class="smallbox" id="nonAnnotationColor"></div><br /> -->
<!-- 		 Selected<div class="smallbox" id="selectedColor"></div><br /> -->
<!-- 		 Same Value<div class="smallbox" id="sameColor"></div><br /> -->
<!-- 		</div> -->
	<div id="infoDetect" style="margin-left:0.5em; display: none;">
		<div style="float:left; width:1em;margin-top:0.05em">
		 <div class="smallbox" style="background-color: hsla(0,100%,50%,1)"></div>
		 <div class="smallbox" style="background-color: hsla(25,100%,50%,1)"></div>
		 <div class="smallbox" style="background-color: hsla(50,100%,50%,1)"></div>
		 <div class="smallbox" style="background-color: hsla(75,100%,50%,1)"></div>
		 <div class="smallbox" style="background-color: hsla(100,100%,50%,1)"></div>
		</div>
		<div  style="text-align:right;float:right; margin-left:0.5em; margin-right:1.5em; width:9em;">
		 0% confidence<br />
		 25% confidence<br />
		 50% confidence<br />
		 75% confidence<br />
		 100% confidence<br />
		</div>
	</div>

	<div id="infoCorrect" style="margin-left:0.5em; display:none;">
		<div style="float:left; width:1em;margin-top:0.05em">
			<div class="smallbox" id="blue" style="background-color:blue"></div>
			<div class="smallbox" id="blue" style="background-color:white"></div>
			<div class="smallbox" id="green" style="background-color:green"></div>
			<div class="smallbox" id="red" style="background-color:red"></div>
			<div class="smallbox" id="orange" style="background-color:orange"></div>
		</div>
		<div  style="text-align:left;float:left; margin-left:0.5em;">
			Not Reviewed<br />
			Reviewed as:<br />
			 Correct<br />
			 Not a Sign (Fp)<br />
			 Incorrect Sign<br />
		</div>
	</div>
</div>

<div class="nonMax" id="nonMaxBox" style="cursor:default;">
Non-Maximum Suppression<br />
<input type=range min=0 max=1 value=0.5 id="nonmax" step=".01" oninput="maximumSuppression(this.value)"  autocomplete="off" style="display: block;" >
<div id="sliderNonMax" style="display: block;">0.5</div>
</div>
<div>
	<div class="statusBar">
		<div class="statusFlag mode" id="mode" onClick="switchModes();"><b>Box</b> Mode</div>
		<div class="statusBuffer" id="buffer1"></div>
		<div class="statusBuffer" id="buffer2"></div>
		<div class="button statusButton" onClick="annotate();" style="float:left; margin-left:1em;" id="statusAnnotate">New Boxes</div>
		<!-- <div class="button statusButton" id="statusEdit" onClick="relabel()" style="float:left; margin-left: 3px;">Relabel</div> -->
		<div class="button statusButton" id="statusCorrect" onClick="correctMode()" style="float:left; margin-left: 3px; display:none;">Corrections</div>
		<div class="button statusButton" id="statusDefault" onClick="defaultMode()" style="float:left; margin-left: 3px;">Edit Boxes</div>
		<div class="button statusButton" id="statusProtected" onClick="noEditMode()" style="float:left; margin-left: 3px;">Protected</div>

		<a href="logout.php"><div class="logout" title="logout"></div></a>
		<div class="smallbox" id="ping" style="background-color:green; float:right; transform: translateY(-50%); position:relative; top:50%;right:0.5em;"></div>
		<div class="button statusButton" onclick='setPopUp("popUpHelp");' style="float:right; margin-right:1em;">Help</div>
		<!--  <div class="button statusButton" onclick='setPopUp("popShortcut");' style="float:right; margin-right:3px;">Shortcuts</div> -->
		<div class="statusFlag" id="statusSave">Saved</div>

	</div>
		<svg id='containerSVG' width=0 height=0  class="content">
		   <g id="svgMaster">
			 <image xlink:href="dummy.jpg" draggable="true" x=0 y=0 height=0 width=0 id="image"></image>
			 <g id="boxes_group"></g>
			 <g id="lines_group" style="display:none;"></g>
			</g>
		 </svg>
</div>

</div>
<div id="tooltip" class="tooltip"></div>
<div id="popUpHelp" class="hoverInfo" style="text-align:center;">
<div id="popuptext" class="popText">
<h3 style="text-align:center;">General Help</h3>
To close any window, click "ok"/"cancel" or press ESC <br />
<br />
<div id="generalHelp">
When in editing mode, there are 4 main submodes you can select the editor to be:<br /><br />
<div class="center"><div class="button statusButton">New Boxes</div><div class="button statusButton">Relabel</div><div class="button statusButton">Edit Boxes</div><div class="button statusButton">Protected</div></div>
<br/>
<div class="center"><div class="button statusButton statusSelected">Protected</div></div>
A protected mode: you can select bounding boxes but aren't allowed to edit, delete or resize them.<br />
Clicking on a bounding box will select it, showing you the ones with the same label.<br />
When selected, you can take a closer look at the bounding box by pressing <b>ENTER</b>.<br />
This is the default mode for image with <i>archived</i> annotations. <br />
Pressing ESC or clicking anywhere on the picture will deselect the box, TAB will select the next box.
<br />
<div class="center"><div class="button statusButton statusSelected">Edit Boxes</div></div>
This is the default mode for images with non-archived annotations.<br />
In this mode, you can edit any aspect of the bounding boxes.<br />
Clicking on a bounding box will select it, showing you the boxes with the same label in blue.<br />
When selected, you can change the labeling, position and size of the box.<br /> You can also delete them while selected (press <b>DEL</b>)<br />
Pressing ESC or clicking anywhere on the picture will deselect the box, TAB will select the next box.
<br />

<div class="center"><div class="button statusButton statusSelected">New Boxes</div></div>
Enables you to add new bounding boxes to the image.<br /> Click where you want the boxe's upper left corner to be and then click
again for the bottom right corner. Cancel the drawing clicking ESC.<br />
When done, a pop up window will prompt you for the sign's ID. <br />

<br />
<div class="center"><div class="button statusButton statusSelected">Hot Keys</div></div>
* (Numeric Pad): Show labels (Box mode only, function: showLabels() )<br />
+ : Show meta-data <br />
L : Change edit mode (Line/Box) <br />
</div>
<div id="trainHelp" style="display:none;">

After performing a detection (or loading a saved detection) you will be in <i>training mode</i>.<br />
One important difference with the editing mode is the small slider underneath the "Sign
s information Box": detected signs have a normed <i>confidence</i> (how sure a detection is) and moving the slider you can set the threshold for the results to be shown.
Only the detections with a higher confidence than the threshold will be shown.<br/>
Only two main options are available during training:<br/>
<div class="center"><div class="button statusButton">Corrections</div><div class="button statusBut