<?php
include_once('config.php');

function logMessage($message)
{
            $user = $_SESSION['cuneidemo']['user'];
            $logfile = _LOGPATH_.$user.".log";
		    $log = fopen($logfile, 'a');
		    $time = @date('[d/M/Y:H:i:s]');
		    fwrite($log, "$time ($user) $mes