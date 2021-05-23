
/**
 * Small GUI framework
 * Yeah, I know, there is google CLosure and JQuery and whatnot
 * Just playing around a bit
 **/

// The basic window object

function interfaceWindow(x, y, name)
{
	// position
	this.unitPos = "%";
	this.xpos = x + this.unitPos;
	this.ypos = y + this.unitPos;
	
	this.display = "block";		
	this.cssClass = "signEdit";
	
	this.name = name;

	var div = document.createElement("div");
	var underDiv = document.createElement("form");
	var buttonDiv = document.createElement("div");
	
	div.appendChild(underDiv);
	div.appendChild(buttonDiv);
	
	this.window = div;
	this.content = underDiv;
	this.buttons = buttonDiv;
	
	div.id = this.name;
	
	div.className = this.cssClass;
	
	
	
	div.style.left = this.xpos;
	div.style.top = this.ypos;
	
	div.style.display = this.display;
	div.style["font-family"] =  "arial,sans-serif";
	div.style["z-index"] = 3;
	
	// now put it in there!
	
	document.body.appendChild(div);
	div.style.display = "none";
}

interfaceWindow.prototype.addContent = function()
{
	// call matlabInfo for list of content
	// Yup, this should be separated!
	// generate bullet-point thingie
	
	
	
	// need a handler that should: look up for the selected one, 
	// close this and call the server
	
	this.content.innerHTML = "";
}

interfaceWindow.prototype.addButtons = function(okHandler)
{
	var ok = document.createElement("div");
	var cancel = document.createElement("div");
	
	// Format
	ok.classList.add("button", "statusButton");
	cancel.classList.add("button", "statusButton", "popupButton");
	
	// Text
	ok.innerHTML = "Ok";
	cancel.innerHTML = "Cancel";
	// Event handling -> bind it to object!!!
	
	cancel.addEventListener("click", function(){
		this.hide();
		}.bind(this));
	ok.addEventListener("click", okHandler.bind(this));
	
	this.buttons.appendChild(ok);
	this.buttons.appendChild(cancel);

}

interfaceWindow.prototype.show = function()
{
	this.content.innerHTML = "";	