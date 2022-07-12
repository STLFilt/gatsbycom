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

foreach($dictionary as $id => $readings) {
	foreach($readings as $read) {
		$read = parseToSpecial($read);

		$readingdictionary[$read[0]] = (string) $id;
		if($read[0] != $read[1])
			$readingdictionary[$read[1]] = (string) $id;
	}
}

file_put_contents("matlab/data/cuneiform/parserDictionary.json", json_encode($readingdictionary));

// now for multi-logogramms
if(isset($_GET["multi"]))
{
	$multidictionary = json_decode(file_get_contents("matlab/data/cuneiform/multi.j