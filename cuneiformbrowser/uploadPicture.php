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
		    $file_ext = ".gif";
		break; 
		case 2 : 
		    $img = imageCreateFromJpeg($_FILES['imageUploaded']['tmp_name']);
		    $file_ext = ".jpg";
		break; 
		case 3 : 
		    $img = imageCreateFromPng($_FILES['imageUploaded']['tmp_name']);
		    $file_ext = ".png";
		break; 
		case 6 : 
		    $img = imageCreateFromBmp($_FILES['imageUploaded']['tmp_name']);
		    $file_ext = ".bmp";
		break; 
	}    
}

// Check if Name is valid
if(!ctype_alnum(str_replace($aValid, '',$newName)))
{
    logMessage("uploaded an image with invalid name.");
	echo "incorrect name";
	$uploadOk = 0;
}
//$newFileName = $_SESSION['cuneidemo']['imagesPath'] .$newName  . $file_ext; // does not work, because editor expects jpg extensions :/
$newFileName = $_SESSION['cuneidemo']['imagesPath'] .$newName  . ".jpg";
$newThumb =  $_SESSION['cuneidemo']['collectionFolder'] .'thumbs'.DIRECTORY_SEPARATOR. $newName  . "-thumb" . ".