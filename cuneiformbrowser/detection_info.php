<?php

if(session_status() !== PHP_SESSION_ACTIVE) {
	session_start();
}
if($_SESSION['cuneidemo']["enabled"] != true) {
	echo "nope!";
	exit();
}
include_once ('config.php'); // Needed for the different Folders

$DS = DIRECTORY_SEPARATOR;

if(!isset($_GET['infoRequest'])) {
	if(!isset($_GET['cleanup'])) {
		echo "Bad request" . _MATLABCOM