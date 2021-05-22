$(window).load(startingSetup);

function startingSetup()
{
	
	document.getElementById("selection").addEventListener("change",updateImages);
}

function updateImages()
{
	
	var sign = document.getElementById("selection").value;
	document.getElementById