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
		echo "Bad request" . _MATLABCOM_ . $_SESSION['cuneidemo']['imageName'];
		exit();
	}
}
switch ($_GET['infoRequest']) {
	case "available_versions" :
		$xmlImages = simplexml_load_file($_SESSION['cuneidemo']['imagesList']);
		$imageID = intval($_SESSION['cuneidemo']['imageID']);
		$name = $xmlImages->image[$imageID]->file;

		$base_directory = './'.$_SESSION['cuneidemo']["performance"].'fullResults'.$DS;   // '../../'

		$all_folders 