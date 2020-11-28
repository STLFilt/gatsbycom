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
