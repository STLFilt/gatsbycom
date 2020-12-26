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
		<!-- <div class="button statusButton" id="statusEdit" onClick="relabel()" sty