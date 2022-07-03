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
	loa