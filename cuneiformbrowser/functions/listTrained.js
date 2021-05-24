
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
		data : {modelRequest:imageClicked.id, name:imageClicked.alt},
		// processData: false,
		// contentType: "application/json",
		cache : false,
		error : function() {
			
		},
		success : function(result) {
			document.getElementById('content').innerHTML = result;
			document.getElementById('modelImages').style.display = "block";
			setTimeout(function(){setPosition($(clicked).position(),"modelImages");}, 0)
			
		}
	});
	
		

}

function openHOGList(image