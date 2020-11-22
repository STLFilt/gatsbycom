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
<div id="confidenceArea" style="display:none;"> <div cl