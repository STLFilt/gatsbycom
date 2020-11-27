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
  <option value="100">100%</opti