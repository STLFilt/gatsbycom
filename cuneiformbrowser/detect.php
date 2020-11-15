
 <?php 
if(session_status() !== PHP_SESSION_ACTIVE) {
	session_start();
}
if($_SESSION['cuneidemo']["enabled"] != true)
{
	exit;
}
include_once('config.php');
include_once('logger.php');

logMessage("Detection on image started");

// First, check if the user already started a detection

if(file_exists(_RESULTS_."/serverLOG_".$_SESSION['cuneidemo']['user'].".txt"))
{
	$response = json_encode(array('error' => 'running'));
	echo $response;
	exit();
}

// find the image
$xmlImages = simplexml_load_file($_SESSION['cuneidemo']['imagesList']);
$imageID = intval($_SESSION['cuneidemo']['imageID']);
$name = $xmlImages->image[$imageID]->file;
$imageName = $name.'.jpg';

// ... and paths
$pathBase = getcwd().DIRECTORY_SEPARATOR;