<?php
session_start();
 if($_SESSION['cuneidemo']["enabled"] != true)
 {
 	echo "nope!";
 	exit;
 }
include_once('config.php'); // Needed for the different Folders
include_once('logger.php');
$thumb = true;

if(isset($_POST['id']))
{
	$dictionaryJSON = file_get_contents($_SESSION['cuneidemo']['groupFolder']."dictionary.json");
	$dictionary = json_decode($dictionaryJSON,true);

		//foreach($_POST['data'] as $newEntry) // Newentry 