 <?php session_start();
 if($_SESSION['cuneidemo']["enabled"] != true)
 {
 	exit;
 }
 include_once('config.php');
 include_once('logger.php');
 // 1 Check if image
 // 2 Check if exists
 // 3 Store
 // 4 add xml
 // 5 pass to editor
 // same for Annotations? Or use AJAX instead? Yep, Ajax

$newName = $_POST["catalog"];
//$sid