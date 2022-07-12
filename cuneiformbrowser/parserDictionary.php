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
	$multidictionary = json_decode(file_get_contents("matlab/data/cuneiform/multi.json"), true);
	$newDictionary = Array();

	foreach($multidictionary as $id => $readings) {

		$id = parseToSpecial($id);
		$newDictionary[$id[0]] = Array();
		if($id[0] != $id[1])
			$newDictionary[$id[1]] = Array();
		$individualSigns = explode("-", $readings);
		foreach($individualSigns as $sign)
		{
			if(isset($readingdictionary[$sign]))
			{
				array_push($newDictionary[$id[0]], $readingdictionary[$sign]);
				if($id[0] != $id[1])
					array_push($newDictionary[$id[1]], $readingdictionary[$sign]);
			}
			else
			{
				echo "Reading not known! $sign";
				exit();
			}
		}
	}
	file_put_contents("matlab/data/cuneiform/multiSignLogogrammsDictionary.json", json_encode($newDictionary));
}

function parseToSpecial($read)
{
	$parsed = [];
	$parsed[0] = strtolower(trim($read));
	echo $parsed[0];
	// $read = str_replace(