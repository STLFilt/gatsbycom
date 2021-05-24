
$(window).load(document.getElementById("dictionary").addEventListener('dblclick',react));

var clicked;
function react(event)
{
	console.log(event.target.getAttribute("colID"));
	
}

function openImagesList(imageClicked)
{	
	
	clicked = imageClicked;
		$.ajax({
		type : "GET",
		url : "listModelImages.php",
		data : {modelRequest:imageClicked.id, name:image