
$(window).load(startingSetup);
var verbose = false;
var verboseBuffer = "";
var streamChange = false;
var collectionPages = 0;

var _ESC_ = 27;
var groupsInfo;

function startingSetup()
{
	$(document).on("keydown", reactKeyboard);
	getGroups();
	if(groupID == null)
		document.getElementById("options").style.display ="none";
	if(sel)
		{
		loadGallery(currentPage);
		generatePages();
		ping();
		return;
		}
	if(document.body.contains(document.getElementById('continueButton')))
		{
			$("#continueButton").addClass('statusSelected');
			document.getElementById('continue').style.display = 'block';
		}
	if(document.body.contains(document.getElementById('continueTrainingButton')))
	{
		$("#continueTrainingButton").addClass('statusSelected');
		document.getElementById('continueTraining').style.display = 'block';
	}
	if(document.body.contains(document.getElementById('continueDetectionButton')))
	{
		$("#continueDetectionButton").addClass('statusSelected');
		document.getElementById('continueDetection').style.display = 'block';
	}
	
	
	ping();
	
	
}
function startTraining()
{
    verboseBuffer ="";
	var error = false;
	var errorField = document.getElementById("errorField");
	errorField.innerHTML="";
	
	var userData = document.getElementById('targetNumbers').value;
	var parsedData = userData.split(",");
	var pad = "000";
	
	// read the sign's list
	if(parsedData[0] != "all")
	{
		for(var i =0; i < parsedData.length; i++)
			{
				// Go over the indicated signs: pad them AND check if those are numbers!!
				// For some signs: check if the models are available!
				if(parsedData[i].length>3 || !$.isNumeric(parsedData[i]) )
					{
					error = true;
					var msg = "Invalid number";
					break;
					}
				
				parsedData[i] = (pad+(parsedData[i])).slice(-pad.length);			
			
			}
	
		if(error)
		{
			errorField.innerHTML = msg;
			return;
		}
	}
	else
		parsedData[0] = parsedData[0];
	