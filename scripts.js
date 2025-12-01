
// -------------------  Items to Sort -------------------------
 // Each item has a name (which is the image ID and filename)
 // and set of XY coordinates
 // These are needed to add an image to the canvas
 function Item(readableName, fileName, collection, xPos, yPos) {
  this.readableName = readableName;
  this.fileName = fileName;
  this.collection = collection;
  this.xPos = xPos;
  this.yPos = yPos;
}

// When collection is chosen, load the bucket with item objects
// Use the item names from the JSON
// And access file by concatenating filepath in the format "collectionName/itemName.png"
// These objects will be read to load the correct images in the bucket UI on screen 3
var bucket = []; 

// The items that have been moved from the bucket onto the sorting mat
var tray = [];

// ---------------------- Canvas for Sorting Mat ---------------------
var canvas = document.getElementById("sorting-canvas"),
	c = canvas.getContext('2d'),
	mouseX = 0,
	mouseY = 0,
	width = 620, 
	height = 500,
	mousedown = false;
// Resize the canvas
canvas.width = width;
canvas.height = height;

// These are loaded when the sorting workspace loads, otherwise they will register as (0, 0)
var canvasViewportOffset;
var canvasYPos;
var canvasXPos;

function getCanvasCoordinates() {
	canvasViewportOffset = canvas.getBoundingClientRect();
	canvasYPos = Math.round(canvasViewportOffset.top);
	canvasXPos = Math.round(canvasViewportOffset.left);
	//console.log("Canvas X position:" + canvasXPos + " canvas Y position: " + canvasYPos);
}

window.onscroll = function() {
	// Keeping the canvas coordinates up-to-date ensures correct item placement (x, y) records on mat
	// in the event the user scrolls while sorting
	getCanvasCoordinates();
};

function drawTray(sortingMethod) {
  //console.log("Clearing the canvas and re-drawing a fresh tray");
  var background = new Image();
  var timestamp = new Date().getTime();
  background.setAttribute('crossOrigin', 'anonymous');
  background.src = 'images/trays/' + sortingMethod + '.png' + '?' + timestamp; // This is resized to 900x414
  background.crossOrigin = "anonymous";
  background.onload = function(){
  	c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(background, 0, 0);
  }
}

// -------------------  Screen Elements  -------------------------
var collectionPanel = document.getElementById("collection-selection");
var sortingMethodPanel = document.getElementById("sorting-method-selection");
var sortingMethods = document.getElementById("sorting-methods"); // List that parents dynamically populated options
var sortingWorkspace = document.getElementById("sorting-workspace");
var bucketItems = document.getElementById("bucket");
var bucketContainer = document.getElementById("bucket-container");
var errorMessage = document.getElementById("error-message");
var gallery = document.getElementById("gallery");
var credits = document.getElementById("credits");
var coloringArea = document.getElementById("colorable-svg");
var sortingInstructions = document.getElementById("sorting-instructions");
var colorPickerBar = document.getElementById("color-picker-bar-container");
var sortingCanvas = document.getElementById("sorting-canvas");

// -------------------  User Selections  -------------------------
var collection = "none";
var sortingMethod = "none";
var sortingMethodCustom = "none"; // This is for text entries, have separate variable instead of overriding sortingMethod
// so we can use the free sort sort methods to generate the correct tray graphic
var collectionOptions = document.getElementsByClassName("collection");
var sortingMethods; // This is populated after a collection is chosen
// Hex colors representing user selections for each compartments
// Each of these corresponds to an ID in the color tray SVG code
var colorLeft = "rgb(255, 255, 255)";
var colorMiddle = "rgb(255, 255, 255)";
var colorRight = "rgb(255, 255, 255)";
var colorsPainted = ["rgb(255, 255, 255)", "rgb(255, 255, 255)", "rgb(255, 255, 255)"];
var invisibleButtons = document.getElementsByClassName("invisible-button");
// Dimensions of painted rectangle borders (for color sorts) at full size
// Divide these by 2 for gallery canvases
var paintedRectangleWidth = 191;
var paintedRectangleHeight = 424;
var leftXPos = 9;
var middleXPos = 214;
var rightXPos = 420;
var allYPos = 68;
var rectangleStroke = 15;

// -------------------  Activity Workflow  -------------------------

function chooseCollection(name) {
	// 1. Set the collection
	collection = name; // The name of the collection (string)
	var collectionToLoad = collections[name]; // The collection object
	//console.log("Choosing collection: " + collection);
	// 2. Load the bucket with the items in that collection
	if (name == "sampler") {
		console.log("Chose the sampler!");
		collection = "sampler";
		collectionToLoad = sampler["data"];
		generateSampler();
	} else {
		//console.log("Chose a pure collection!");
		var numberItems = collections[name].readableNames.length;
		//console.log("This collection has " + numberItems + " items:");
		for(i = 0; i < numberItems; i++) {
			// 1. Instantiate a new item with no coordinates
			// Coordinates (relative to the canvas) will be added after the item is sorted
			// In the meantim, position in bucket will be controlled by CSS positioninng
			var itemToLoad = new Item(collectionToLoad.readableNames[i], collectionToLoad.fileNames[i], collection, null, null);
			// 2. Add it to the bucket
			bucket.push(itemToLoad);
		}
		for(i = 0; i < bucket.length; i++) {
			//console.log(" --- " + bucket[i].name);
		}
	}
	// 3. Hide the collection panel
	collectionPanel.style.display = "none";
	var numberSortingMethods = null;
	if(collection == "sampler") {
		numberSortingMethods = sampler["data"].sortingMethods.length;
	} else {
		numberSortingMethods = collections[collection].sortingMethods.length;
	}
	//console.log("This collection has " + numberSortingMethods + " sorting methods.")
	for(i = 0; i < numberSortingMethods; i++) {
		var sortingMethodName = collectionToLoad.sortingMethods[i];
		var option = document.createElement("LI");
		option.setAttribute("id", sortingMethodName);
		option.setAttribute("class", "sorting-method");
		option.innerHTML = "<img src='images/buttons/" + sortingMethodName + "_button.png' alt='" + sortingMethodName + " button'>";
		sortingMethods.appendChild(option);
	}		
	sortingMethodPanel.style.display = "block";
	sortingMethods = document.getElementsByClassName("sorting-method");
	for(i = 0; i < numberSortingMethods; i++) {
		sortingMethods[i].addEventListener("click", function() { 
		  var name = this.getAttribute("id");
		  chooseSortingMethod(name);
		});
	}
	// 4. Enable the Start Over button
	toggleButtonInteractability("start-over-button", "on");
}

function chooseSortingMethod(name) {
	// 1. Set that as the sorting method
	sortingMethod = name;
	//console.log("-> Chose the sorting method: " + sortingMethod);
	// 2. Hide the sorting method panel
	sortingMethodPanel.style.display = "none";
	// 3. Load the sorting screen; it should load the correct collection of items in the bucket
	loadSortingWorkspace();
}

function convertToTitleCase(word) {
	var titleCaseWord = "";
	var firstLetter = word.charAt(0).toUpperCase();
	var stringWithoutFirstLetter = word.slice(1)
	titleCaseWord = firstLetter + stringWithoutFirstLetter;
	return titleCaseWord;
}

var imagesLoaded = 0;
function loadSortingWorkspace() {
	//console.log("Loading the sorting workspace");
	//console.log("The canvas is at: ( " + canvasXPos + ", " + canvasYPos + ")");
	// 1. Activate the workspace
	sortingWorkspace.style.display = "block";
	// 2. Load the bucket with items (based on chosen sorting method)
	imagesLoaded = 0;
	for(i = 0; i < bucket.length; i++) {
		var item = document.createElement("DIV");
		var itemImage = new Image();
		if(collection == "sampler") {
			itemImage.src = "images/sampler/" + bucket[i].collection + "/" + bucket[i].fileName + ".png";
			item.innerHTML = "<img src='images/sampler/" + bucket[i].collection + "/" + bucket[i].fileName + ".png' alt='" + bucket[i].readableName + "' title='" + bucket[i].readableName + "''>";
		} else {
			itemImage.src = "images/" + bucket[i].collection + "/" + bucket[i].fileName + ".png";
			item.innerHTML = "<img src='images/" + bucket[i].collection + "/" + bucket[i].fileName + ".png' alt='" + bucket[i].readableName + "' title='" + bucket[i].readableName + "''>";
		}
		item.setAttribute("id", bucket[i].fileName);
		item.setAttribute("class", "item");
		itemImage.onload = function() {
			imagesLoaded++;
			if(imagesLoaded == 12) {
				resizeSortingWorkspace();
			}
		}
		bucketItems.appendChild(item); // Add the new div to the DOM
	}
	// 3. Load the canvas with the appropriate base image (based on chosen sorting method)
	getCanvasCoordinates();
	drawTray(sortingMethod);
	clearTray();
	// 4. Print sorting statement
	// or generate sort statement input if using a free sort
	if(sortingMethod == "free-sort_1" || sortingMethod == "free-sort_2") {
		document.getElementById("sort-type-header").innerHTML = "My Sort";
	} else {
		document.getElementById("sort-type-header").innerHTML = "Sort your objects by " + sortingMethod;
	}
	// 5. Load the credits
	credits.style.display = "block";
	//credits.innerHTML = "<p>test</p>";
	if(collection == "sampler") {
		credits.innerHTML = "<p><em>Images are not actual size and may not be to scale.</em></p><p>" + sampler["data"].credits + "</p>";
	} 
	else if (collection == "butterflies" || collection == "beetles") {
		credits.innerHTML = "<img src='images/the-butterfly-company-logo.png' alt='The Butterfly Company logo'><p><em>Images are not actual size and may not be to scale.</em></p><p>" + collections[collection].credits + "</p>";
	} else {
		credits.innerHTML = "<p><em>Images are not actual size and may not be to scale.</em></p><p>" + collections[collection].credits + "</p>";
	}
	// 6. If sorting by color, load the coloring interface, instructions, and screen reader label for the canvas
	sortingInstructions.style.display = "block";
	if(sortingMethod == "color") {
		coloringArea.style.display = "block";
		sortingInstructions.innerHTML = "Select a color from the bar below, then click on a compartment to color it. Repeat for all three compartments and sort your objects.";
		colorPickerBar.style.display = "block";
		//Reset borders to white
		resetColorBorders();
		// Activate the invisible buttons for coloring
		toggleInvisibleButtons(true);
		// Label the canvas for screen readers
		sortingCanvas.setAttribute("aria-label", "Color sorting tray with three compartments of equal sizes");
		sortingCanvas.setAttribute("role", "img");
	}
	// 7. Otherwise, just load screen reader label and instructions 
	else if(sortingMethod == "free-sort_1") {
		sortingInstructions.innerHTML = "Review your collection of objects and sort them into two groups.";
		sortingCanvas.setAttribute("aria-label", "Free sorting tray with two compartments of equal sizes");
	}
	else if(sortingMethod == "free-sort_2") {
		sortingInstructions.innerHTML = "Review your collection of objects and sort them into multiple groups.";
		sortingCanvas.setAttribute("aria-label", "Free sorting tray with two smaller compartments and two larger compartments");
	}
	else if(sortingMethod == "size") {
		sortingInstructions.innerHTML = "Sort your objects by placing them in the compartment that matches their size.";
		sortingCanvas.setAttribute("aria-label", "Size sorting tray with four compartments of various sizes");
	}
	// 9. For feathers, use four narrow columns
	if(collection == "feathers") {
		bucketItems.style.gridTemplateColumns = "90px 90px 90px 90px";
		bucketContainer.style.left = "20px";
	} 
	else if (collection == "butterflies" || collection == "sampler" || collection == "beetles") {
		// Most options have wide images and use a two column layout
		bucketItems.style.gridTemplateColumns = "255px 255px";
		bucketContainer.style.left = "0px";
	}
	else {
		// Use three wider columns for shells
		bucketItems.style.gridTemplateColumns = "150px 150px 150px";
		bucketContainer.style.left = "20px";
	}
}

function resizeSortingWorkspace() {
	// Adjust the height of the workspace to fit the height of the bucket
	var bucketHeight = document.getElementById("bucket").offsetHeight;
	var workspaceHeight = bucketHeight + 200;
	sortingWorkspace.style.height = workspaceHeight + "px";
}

function toggleInvisibleButtons(isShowing) {
	// These invisible buttons allow the user to click anywhere inside the box
	// to paint its borders when sorting by color
	for(i = 0; i < invisibleButtons.length; i++) {
		if(isShowing) {
			invisibleButtons[i].style.display = "block";
		} else {
			invisibleButtons[i].style.display = "none";
		}
	}
}

function resetColorBorders() {
	// Resetting the color borders for color sorts resets them to white
	console.log("Resetting the mat colors...");
	document.getElementById("left").style.stroke = "rgb(255, 255, 255)";
	document.getElementById("middle").style.stroke = "rgb(255, 255, 255)";
	document.getElementById("right").style.stroke = "rgb(255, 255, 255)";
	for(i = 0; i < colorsPainted.length; i++) {
		colorsPainted[i] = "rgb(255, 255, 255)";
	}
}

function openGallery() {
	// 1. Show the gallery screen and hide the sorting workspace
	gallery.style.display = "block";
	sortingWorkspace.style.display = "none";
	// 2. Set up the gallery canvases
	setUpGalleryCanvases();
	// 3. Hide the photo credits
	credits.style.display = "none";
	// For color sorts only...
	if(sortingMethod == "color") {;
		// 4. Hide the coloring area
		coloringArea.style.display = "none";
		colorPickerBar.style.display = "none";
		// 5. Disable the invisible buttons
		toggleInvisibleButtons(false);
	}
}

function startOver() {
	console.log("Starting over...");
	// 1. Reset the UI back to the first screen (collection selection)
	toggleButtonInteractability("start-over-button", "off");
	collectionPanel.style.display = "block";
	sortingMethodPanel.style.display = "none";
	sortingWorkspace.style.display = "none";
	gallery.style.display = "none";
	// 2. Reset the user's choices from the last iteration
	collection = "";
	sortingMethod = "";
	resetColorBorders();
	// 3. Clear the sorting method options UI that populated for the last iteration
	var sortingMethodsToClear = document.getElementById("sorting-methods").querySelectorAll('LI');
	for(var i = 0; i < sortingMethodsToClear.length; i++){
		sortingMethodsToClear[i].remove();
	}
	// 4. Clear the bucket and tray data
	bucket = [];
	tray = [];
	fauxSortsSelected = [];
	// 5. Clear the bucket items UI that populated for the last iteration
	var onscreenItemsToClear = document.getElementById("bucket").querySelectorAll('DIV');
	for(var i = 0; i < onscreenItemsToClear.length; i++){
		onscreenItemsToClear[i].remove();
	}
	// 6. The sortingMethods reference disappears at some point (possibly, from hiding its UI)
	// and grabbing it again is needed in order to load a new set of sort methods for the next iteration
	sortingMethods = document.getElementById("sorting-methods"); 
	// 7. Remove the credits
	credits.style.display = "none";
	// 8. Hide the coloring area
	coloringArea.style.display = "none";
	sortingInstructions.style.display = "none";
	colorPickerBar.style.display = "none";
	// 9. Clear the error message
	errorMessage.innerHTML = "&nbsp;"; // Empty space to block out vertical space for error messaging
}

function clearTray() {
  // Remove all items from the tray (visually and in the tray data structure)
  // Disable Done and Reset buttons
  var numberItems = tray.length;
  for(i = 0; i < numberItems; i++) {
    document.getElementById(tray[i].fileName).style.transform = "translate(0,0)";
  }
  for(i = 0; i < numberItems; i++) {
  	console.log("Removing: " + tray[i]);
    tray.pop();
  }
  toggleButtonInteractability("done-button", "off");
  toggleButtonInteractability("reset-button", "off");
  // console.log("Length of tray: " + tray.length);
  for(i=0; i < tray.length; i++) {
  	console.log(tray[i]);
  }
}

// -------------------  Buttons  ------------------------- //

// Set up the download button
var downloadButton = document.getElementById("download-button");
downloadButton.addEventListener('click', function(ev) {
  buildAndSaveImage();
}, false);

 // Set up the reset button
var resetButton = document.getElementById("reset-button");
resetButton.addEventListener('click', function(ev) {
  if(tray.length > 1) {
  	  clearTray();
  } else {
  	  console.log("Show error message");
  	  document.getElementById("error-message").innerHTML = "<p>Add at least two items</p>";
  }
  clearTray();
  resetColorBorders();
}, false);

// Set up the done button
var doneButton = document.getElementById("done-button");
doneButton.addEventListener('click', function(ev) {
  if(tray.length > 1) {
  	openGallery();
  } else {
  	  console.log("Show error message");
  	  document.getElementById("error-message").innerHTML = "<p>Add at least two items</p>";
  }
}, false);

// Set up all collections buttons
for(i = 0; i < collectionOptions.length; i++) {
	collectionOptions[i].addEventListener("click", function() { 
	  var name = this.getAttribute("id");
	  chooseCollection(name);
	});
}

// Set up the start over button
var startOverButton = document.getElementById("start-over-button");
startOverButton.addEventListener("click", function() { 
  startOver();
});

// Set up the make another sort button
var makeAnotherSortButton = document.getElementById("make-another-sort-button");
makeAnotherSortButton.addEventListener("click", function() { 
  startOver();
});

// -------------------  Image Saving ------------------------- //
function drawText(text) {
    // Print the sort title (e.g. "My Color Sort") onto the downloaded image
    c.font = "24px Arial";
    c.fillText(text, 20, 40);
}

function buildAndSaveImage() {
	if(tray.length > 1) {
	 	console.log("Saving image...");
	 	var canvas = document.getElementById("sorting-canvas");
	 	// 1. If sorting by color, paint the rectangles with the user's color selections
	 	if(sortingMethod == "color") {
	 		console.log("Loading color rectangles");
			var ctx = canvas.getContext("2d");
			drawPaintedRectangles(ctx, colorsPainted, leftXPos, middleXPos, rightXPos, allYPos, rectangleStroke, paintedRectangleWidth, paintedRectangleHeight);
	 	}
	    // 2. Load each item's image to the canvas
	    for (i = 0; i < tray.length; i++) {
	        loadItem(i, canvas, tray);
	    }
	    // 3. Write out the sort statement
	    var message = "";
	    if(sortingMethod == "free-sort_1" || sortingMethod == "free-sort_2") {
	    	message = "My Free Sort";
	    } else {
	    	var sortingMethodWord = convertToTitleCase(sortingMethod);
			message = "My " + sortingMethodWord  + " Sort";
	    }
		drawText(message);
	} 
}

function drawPaintedRectangles(canvasCtx, colors, xPosLeft, xPosMiddle, xPosRight, yPos, stroke, width, height) {
	//console.log("Drawing painted rectanlges");
	// Left
	canvasCtx.beginPath();
	canvasCtx.strokeStyle = colors[0];
	canvasCtx.lineWidth = stroke;
	canvasCtx.strokeRect(xPosLeft, yPos, width, height);
	canvasCtx.closePath();
	// Middle
	canvasCtx.beginPath();
	canvasCtx.strokeStyle = colors[1];
	canvasCtx.lineWidth = stroke;
	canvasCtx.strokeRect(xPosMiddle, yPos, width, height);
	canvasCtx.closePath();
	// Right
	canvasCtx.beginPath();
	canvasCtx.strokeStyle = colors[2];
	canvasCtx.lineWidth = stroke;
	canvasCtx.strokeRect(xPosRight, yPos, width, height);
	canvasCtx.closePath();
}

// Load an item onto the canvas
var loadedItems = 0; // Count magnets loaded to trigger download once the last is done
function loadItem(i, inputCanvas, inputTray) {
    //console.log("Get ready to add a " + tray[i].name + " to the canvas at (" + tray[i].xPos + " , " + tray[i].yPos + ")");
    var item = new Image();
    var timestamp = new Date().getTime();
    item.setAttribute('crossOrigin', 'anonymous');
    if(collection == "sampler" && inputTray == tray) {
    	item.src = 'images/sampler/' + inputTray[i].collection + '/' + inputTray[i].fileName + '.png' + '?' + timestamp; 
    } else {
    	item.src = 'images/' + inputTray[i].collection + '/' + inputTray[i].fileName + '.png' + '?' + timestamp; 
    }
    item.crossOrigin = "anonymous";
    var xPos = inputTray[i].xPos;
    var yPos = inputTray[i].yPos;
    item.onload = function () {
        if(inputCanvas.width == 310) {
        	// Gallery canvases
        	var cInput = inputCanvas.getContext('2d');  
        	cInput.drawImage(item, 0, 0, item.width, item.height, Math.round(xPos/2), Math.round(yPos/2), Math.round(item.width/2), Math.round(item.height/2));
        } else {
        	// Main 620x500 canvas - downloaded image, not on the browser at all
        	c.drawImage(item, 0, 0, item.width, item.height, xPos, yPos, item.width, item.height);
        	loadedItems++;
	        // If this is the last magnet to be added, call download and reset the count for next time
	        if (loadedItems == tray.length) {
	            loadedItems = 0;
	            downloadPNG();
	        }
        }
    }
}

// Do the download and reset the canvas
function downloadPNG() {
  var ctx = canvas.getContext("2d");
  canvas.toBlob(function (blob) {
      var DOMURL = self.URL || self.webkitURL || self;
      var newImg = new Image(),
      url = DOMURL.createObjectURL(blob);
      newImg.onload = function () {
          // no longer need to read the blob so it's revoked
          c .drawImage(newImg, 0, 0, canvas.width, canvas.height);
          DOMURL.revokeObjectURL(png);
          var png = canvas.toDataURL("image/png");
          var newData = png.replace(/^data:image\/png/, "data:application/octet-stream");
          // Create a new download link, click it, and destroy it
          var a = document.createElement("a");
          a.setAttribute("download", "mysort.png")
          a.setAttribute("href", newData)
          document.body.appendChild(a);
          a.click();
          a.remove();
      };
      newImg.src = url;
      // Reset the canvas
      if(sortingMethod != "Color") {
      	drawTray(sortingMethod);
      } else {
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "white";
      }
  });
}

function toggleButtonInteractability(name, state) {
	// Buttons are dimmed when non-interactable, brighten to 100% alpha when interactable
	var button = document.getElementById(name);
	if(state == "off") {
		button.style.opacity = "0.5";
	} else {
		button.style.opacity = "1";
	}
}

// -------------------  Text Size Adjustment for Mobile ------------------------- //

isMobile = false;
if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
   isMobile = true;
}
if(isMobile) {
  // Increase the text size
  var h1s = document.getElementsByTagName("h1");
  var pHeader = document.getElementById("overall-directions");
  h1s[0].style.fontSize = "54px";
  pHeader.style.fontSize = "28px";
  pHeader.style.margin = "24px 0";
  // Increase the width for the instructions
  pHeader.style.width = "98%";
} 

isIPad = false;
if( /iPad/i.test(navigator.userAgent) ) {
   isIPad = true;
}
if(isIPad) {
  // Increase the text size
  var h1s = document.getElementsByTagName("h1");
  var pHeader = document.getElementById("overall-directions");
  var options = document.getElementsByClassName("options");
  h1s[0].style.fontSize = "48px";
  pHeader.style.fontSize = "24px";
  pHeader.style.margin = "16px 0";
  // Increase the width for the instructions
  pHeader.style.width = "90%";
  // Bump options content to the left to make up for iPad native padding
  for(i = 0; i < options.length; i++) {
	options[i].style.marginLeft = "-70px";
  }
} 
