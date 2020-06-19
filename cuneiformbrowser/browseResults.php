<?php
if(session_status() !== PHP_SESSION_ACTIVE) {
	session_start();
}
if($_SESSION['cuneidemo']["enabled"] != true)
{
	echo "nope!";
	exit;
}
include_once('config.php');

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Results browser</title>
<link rel="stylesheet" type="text/css" href="styleEditor.css">
<script src="lib/jquery.min.js"></script>
</head>
<body>
<h2></h2>
<div id="confusion" style="float:left; margin-right:2em">
<svg id="svgMaster"></svg>
<div id="tooltip" ></div>
</div>

<div id=Annotations style="float:left">
<?php
$mainInfo = json_decode(file_get_contents($_SESSION['cuneidemo']["performance"]."mainIndex.json"),true);
$trainingData =