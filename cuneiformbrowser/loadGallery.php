<?php
if(session_status() !== PHP_SESSION_ACTIVE) {
	session_start();
}
if($_SESSION['cuneidemo']["enabled"] != true)
{
	echo "nope!";
	exit;
}
include_once('config.php'); // Needed for the different Folders

if(isset($_GET['page']))
{
	$_SESSION['cuneidemo']['page'] = $_GET['page'];
	loadIndex($_GET['page']);
}
else
{
	$_SESSION['cuneidemo']['page'] = 0;
	loadIndex(0);
}

function loadIndex($page)
{
	/* This should load an index of all the tablets
	 * 	- Thumbnail of the images (pre-generated?)
	* 	- Does it have annotations?
	* 	- Name input
	*/

	$xmlImages = simplexml_load_file($_SESSION['cuneidemo']['imagesList']);
	$totalPages = ceil($xmlImages->total / _PAGESIZE_);
	$counter = $page*_PAGESIZE_;
	$endLoop = (($page+1)*_PAGESIZE_ > $xmlImages->total)? $xmlImages