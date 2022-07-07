 <?php if(session_status() !== PHP_SESSION_ACTIVE) {
	session_start();
}
 if($_SESSION['cuneidemo']["enabled"] != true)
 {
 	exit;
 }
 include_once('config.php');
 include_once('logger.php');


 	$logJSON = file_get_contents('php://input');

 //	if(isJSON($l