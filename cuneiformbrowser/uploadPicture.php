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
//$side = $_POST["side"];
$uploadOk=1;
$aValid = array('-', '_'); // this will be sued to replace spetial characters allowed in tablets' names.
							// like this: !ctype_alnum(str_replace($aValid, '', $sUser)

// Check if file is image
$imageType = exif_imagetype($_FILES['imageUploaded']['tmp_name']);
logmessage("has uploaded a file. Temporal name: ".$_FILES['imageUploaded']['tmp_name']);


$allowedTypes = array( 
        1,  // [] gif 
        2,  // [] jpg 
        3,  // [] png 
        6   // [] bmp 
    ); 
if (!in_array($imageType, $allowedTypes)) { 
	logMessage("uploaded a not supported image file format.");
	 //	echo $_FILES['imageUploaded'];
	 //	echo "Not an Image";
	 //	echo $imageType." ".$_FILES['imageUploaded']['tmp_name']." - ";
	 $uploadOk = 0;
} else {
	switch ($imageType) { 
		case 1 : 
		    $img = imageCreateFromGif($_FILES['imageUploaded']['tmp_name']); 
		    $fil