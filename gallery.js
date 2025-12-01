var galleryCanvasesToLoad = document.getElementsByClassName("gallery-canvas");
var loadedCanvases = []; // User and faux sort canvases
var backgrounds = []; // Background images (mats) for the canvases
function setUpGalleryCanvases() {
	// 1. Clear the backgrounds, in case this is the 2nd+ iteration
	backgrounds = [];
	// 2. Load 6 gallery canvases to 3x2 grid
	for(i = 0; i < galleryCanvasesToLoad.length; i++) {
		//console.log(galleryCanvasesToLoad[i]);
		// a. Set up the basic canvas settings
		var newCanvas = galleryCanvasesToLoad[i],
		c = newCanvas.getContext('2d'),
		mouseX = 0,
		mouseY = 0,
		width = 310, 
		height = 250,
		mousedown = false;
		// b. Resize the canvas
		newCanvas.width = width;
		newCanvas.height = height;
		newCanvas.setAttribute("role", "img");
		loadedCanvases.push(newCanvas);
	}
	// 3. Choose 5 faux sorts of out the set
	fauxSortsSelected = chooseSampleFauxSorts();
	// 4. Select and load backgrounds and aria labels that match each sort's categorization method 
	var backgroundsLoaded = 0.
	for(i = 0; i < galleryCanvasesToLoad.length; i++) {
		//console.log(i + " -------------------- ");
		var background = new Image();
		var timestamp = new Date().getTime();
		background.setAttribute('crossOrigin', 'anonymous');
		background.crossOrigin = "anonymous";
		if(i == 1) {
			// Load the tray background from the user's sort
			background.src = 'images/trays/' + sortingMethod + '.png' + '?' + timestamp;
			// Customize the user's sort label for the gallery
			if(sortingMethod == "free-sort_1" || sortingMethod == "free-sort_2") {
				document.getElementById("user-sort-title").innerHTML = "My Free Sort";
				loadedCanvases[i].setAttribute("aria-label", "My Free Sort");
			} else {
				var sortingMethodWord = convertToTitleCase(sortingMethod);
				var title = "My " + sortingMethodWord + " Sort";
				document.getElementById("user-sort-title").innerHTML = title;		
				loadedCanvases[i].setAttribute("aria-label", title);
			}
			//console.log("--- Item #" + i + " is " + sortingMethod);
		} 
		else if (i == 0) {
			background.src = 'images/fauxsorts/' + fauxSortsSelected[0].fileName + '.png' + '?' + timestamp;
			loadedCanvases[0].setAttribute("aria-label", fauxSortsSelected[0].fileName);
			//console.log("--- Item #" + i + " is " + fauxSortsSelected[0].type);
		} else {
			background.src = 'images/fauxsorts/' + fauxSortsSelected[i - 1].fileName + '.png' + '?' + timestamp;
			loadedCanvases[i].setAttribute("aria-label", fauxSortsSelected[i - 1].fileName);
			//console.log("--- Item #" + i + " is " + fauxSortsSelected[i - 1].type);
		}
		//console.log(background);
		backgrounds.push(background);
		background.onload = function() {
			backgroundsLoaded++;
			if(backgroundsLoaded == galleryCanvasesToLoad.length) {
				loadGalleryCanvasAssets();
			}
		}
	}
	// 5. Set up faux sort visible titles
	var fauxSortTitles = document.getElementsByClassName("faux-sort-title");
	for(i = 0; i < fauxSortsSelected.length; i++) {
		fauxSortTitles[i].innerHTML = fauxSortsSelected[i].fileName;
	}
}

function loadGalleryCanvasAssets() {
	// 1. Access the 2D context of each gallery item
	var dummy1 = loadedCanvases[0].getContext('2d');
	var userSort = loadedCanvases[1].getContext('2d');
	var dummy2 = loadedCanvases[2].getContext('2d');
	var dummy3 = loadedCanvases[3].getContext('2d');
	var dummy4 = loadedCanvases[4].getContext('2d');
	var dummy5 = loadedCanvases[5].getContext('2d');
	// 2. Paint the background imagees
	dummy1.drawImage(backgrounds[0], 0, 0, 310, 250);
	userSort.drawImage(backgrounds[1], 0, 0, 310, 250);
	dummy2.drawImage(backgrounds[2], 0, 0, 310, 250);
	dummy3.drawImage(backgrounds[3], 0, 0, 310, 250);
	dummy4.drawImage(backgrounds[4], 0, 0, 310, 250);
	dummy5.drawImage(backgrounds[5], 0, 0, 310, 250);
	// 3. Add painted rectangles (if needed) for the user sort
	if(sortingMethod == "color") {
		drawPaintedRectangles(userSort, colorsPainted, leftXPos/2, middleXPos/2, rightXPos/2, allYPos/2, rectangleStroke/2, paintedRectangleWidth/2, paintedRectangleHeight/2);
	}
	// 4. Load the sorted item images for the user sort
	for(j = 0; j < tray.length; j++) {
		loadItem(j, loadedCanvases[1], tray);
	}
}
