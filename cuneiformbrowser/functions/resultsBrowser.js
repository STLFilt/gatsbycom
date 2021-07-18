
$(window).load(startingSetup);
var xmlns = "http://www.w3.org/2000/svg";
var confusion;
var svgx = $("#svgMaster").offset().left;
var svgy = $("#svgMaster").offset().top;
var dictionary = Array(); // Label's dictionary!
var usedLabels = Array();
var dictOrdered = Array();
var rectHeight = 14;
function startingSetup()
{
	
	dictionaryPrepare();
	
	$.ajax({
		type : "GET",
		url : "matlabInfo.php?infoRequest=confusion",
		dataType : "json",
		async : true,
		cache : false,
		error : function() {
			console.log("error calling for Info!");
			return;
		},
		success : function(result) {
			confusion = result;
			drawConfusion();
		}
	});
	
}

function drawConfusion()
{
	
	var searched = Object.keys(confusion).sort();
	var numSearched = searched.length;
	var found = Object.keys(confusion[searched[0]]).sort();
	if(found[0] == "")
		found = found.splice(1); // there seems to be a "" around
	
	var numFound = found.length;
	var totals = Array.apply(null, Array(searched.length)).map(Number.prototype.valueOf,0);
	var total = 0;
	//for (var i=0; i<searched.length; i++)
	//	totals[searched[i]] = 0;
	
	document.getElementById("svgMaster").setAttribute("width", (numFound+5)*rectHeight+5);
	document.getElementById("svgMaster").setAttribute("height", (numSearched+5)*rectHeight+5);

	newRectangle(0,0,(numFound+5)*rectHeight+5,(numSearched+5)*rectHeight+5,"confusion","none","black");
	
	for (var i=0; i<searched.length; i++)
		for(var j=0; j<found.length; j++)
			{
				totals[i] += confusion[searched[i]][found[j]];
			}
	
	var offset = 1;
	for(var i=1; i<numFound; i++) // found[0] = 000! -> not a sign
		{
		var search = found[i];
		var nameSearched = found[i];
		var index = searched.indexOf(search);
	    if(typeof(dictOrdered[found[i]])!= "undefined")
	    	{
	    		nameSearched = unicodize(dictOrdered[found[i]]);
	    		search = nameSearched + " ("+found[i]+")";
	    	}
	    if(typeof(confusion[search]) != "undefined")
	    	newText(7,10+i*rectHeight+rectHeight-3,nameSearched,12,false);
	    
	    newText(53+i*rectHeight,12+rectHeight*(numSearched+1),nameSearched,13,true);
	    
	    if(index != -1)
	    	{
	    		newText(7,10+offset*rectHeight+rectHeight-3,nameSearched,12,false);
	    		newText(50+rectHeight*numFound,10+offset*rectHeight+rectHeight-3,totals[index],12,false);
	    		total += totals[index]; 
	    		newRectangle(5,10+offset*rectHeight,rectHeight*3,rectHeight,"","none","black");
	    		for(var j=0; j<numFound; j++)
				{
					var color = "none";
					var name = "None searched";
					var find = found[j];
					
					if(index != -1)
						{
						    var percent =  Math.round(confusion[found[i]][found[j]]/totals[index] * 10000)/100; 
						    percent = isNaN(percent)?0:percent;
						    if(typeof(dictOrdered[found[j]])!= "undefined")
						    	find = unicodize(dictOrdered[found[j]]) + " ("+found[j]+")";
						    if(find == "000")
						    	find = "not a sign";
						    name = "Searched: "+search+" Detected: "+find+" ("+percent+"% of "+totals[index]+" )";
						    var hue = Math.round(250 - 250*percent/100);
						    color = "hsla(" + hue + ",100%,50%,1)";
						}
					if(i==j)
						var stroke = "white";
					else
						var stroke = "black";
					newRectangle(47+j*rectHeight,10+offset*rectHeight,rectHeight,rectHeight,name,color,stroke);
				}
	    		
	    		offset += 1;
	    	}
	    
		
	    
		}
	$("rect").on("mouseover", toolTip);
	newText(50+rectHeight*numFound,22+rectHeight*numFound+20,total.toString(),13,false);
}

function newRectangle(x,y,w,h,id,fill, stroke){
	
	
	var elem = document.createElementNS(xmlns, "rect");
	
	elem.setAttribute("name", id);
	elem.setAttribute("x", x);
	elem.setAttribute("y", y);
	elem.setAttribute("width", w);
	elem.setAttribute("height", h);
	elem.setAttribute("stroke", stroke);
	
	elem.setAttribute("stroke-width", 0.5);
	elem.setAttribute("fill", fill);
	elem.setAttribute("vector-effect", "non-scaling-stroke");
	document.getElementById("svgMaster").appendChild(elem);
	
}

function newText(x,y,text,size, vertical)
{
	var elem = document.createElementNS(xmlns, "text");
	
	elem.setAttribute("name", "label");
	elem.setAttribute("x", x);
	elem.setAttribute("y", y);
	elem.setAttribute("font-size", size);
	elem.textContent = text;
	if(vertical)
