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

	  