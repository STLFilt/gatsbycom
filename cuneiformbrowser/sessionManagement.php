<?php

if(session_status() !== PHP_SESSION_ACTIVE) {
	session_start();
}
	include_once('config.php');
	include_once('logger.php');
	$message ="";
    $askedFlag = false;


	if(!isset($_SESSION["cuneidemo"]))
	{
	    if(!isset($_POST["user"]))
	    {
	        form();
	    }

	    $user = $_POST["user"];
	    $pass = $_POST["pass"];
	    $xmlUsers = simplexml_load_file(_USERSLIST_);

	    foreach($xmlUsers->user as $userInfo)
	    {
	        $userName = $userInfo->name;
	        if($userName == $user)
	        {
	            $userPassword = $userInfo->password;
	            $askedflag = true;
	            break;
	        }
	    }

		if(($user == $userName && $pass == $userPassword))
		{
			$_SESS