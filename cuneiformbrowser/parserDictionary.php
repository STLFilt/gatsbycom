<html>
<!DOCTYPE meta PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
</head>
<body>
<?php
$dictionary = json_decode(file_get_contents("matlab/data/cuneiform/dictionary.json"), true);

// reverse dictionary

$readingdictionary = Array();

foreach($dictionar