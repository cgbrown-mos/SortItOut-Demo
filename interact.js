/* jshint esversion: 6 */
// This script contains pieces from the Interact JS library, with additional features specific this activity

const item = document.querySelector('.item');
const clear = document.querySelector('.clear');    

interact('.item')
  .draggable({
    inertia: true,
    restrict: {
      endOnly: true,
      //elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      restriction: document.getElementById("sorting-workspace")
    },
    onmove: dragListener
  });

interact('.canvas').dropzone({
  accept: '.item',
  overlap: 0.5,
  ondragleave: revertBack,
 // listen for drop related events:

  ondropactivate: function (event) {
    // add active dropzone feedback
    event.target.classList.add('drop-active')
  },
  ondragenter: function (event) {
    var draggableElement = event.relatedTarget
    var dropzoneElement = event.target
    //console.log("drag enter");
    // feedback the possibility of a drop
    dropzoneElement.classList.add('drop-target')
    draggableElement.classList.add('can-drop')
    //draggableElement.textContent = 'Dragged in'
  },
  ondragleave: function (event) {
    // remove the drop feedback style
    //console.log("drag leave");
    var draggableElement = event.relatedTarget
    var dropzoneElement = event.target
    event.target.classList.remove('drop-target')
    event.relatedTarget.classList.remove('can-drop')
    var itemName = draggableElement.getAttribute('id');
    //console.log("Removing: " + itemName);
    var index = 0; // The index of the item to be removed from the tray
    for(i = 0; i < tray.length; i++) {
      if(tray[i].fileName == itemName) {
        index = i;
        //console.log("Found a match!")
      }
    }
    //console.log("--- This item is at index: " + index);
    tray.splice(index, 1);
    if(tray.length < 2) {
    	toggleButtonInteractability("done-button", "off");
    	toggleButtonInteractability("reset-button", "off");
    }
  },
  ondrop: function (event) {
  	var draggableElement = event.relatedTarget
    var dropzoneElement = event.target
    var itemName = draggableElement.getAttribute('id');
    // If the item is already on the board (i.e. same item was just rearranged)
    // then delete the old entry and add it again with the new coordinates
    for(i = 0; i < tray.length; i++) {
      if(tray[i].fileName == itemName) {
        tray.splice(i, 1);
        //console.log(itemName + " was re-arranged");
      }
    }
    // Item position is calculated here at the moment of placement
    var itemViewportOffset = draggableElement.getBoundingClientRect();
    // Canvas position is re-calculated every time the window scrolls (see the function getCanvasCoordinates called by window.onscroll)
    var itemYPos = Math.round(itemViewportOffset.top) - canvasYPos;
    var itemXPos = Math.round(itemViewportOffset.left) - canvasXPos;
    // console.log("---Canvas yPos: " + canvasYPos);
    // console.log("---Item yPos: " + Math.round(itemViewportOffset.top));
    var itemToAdd; // This will be matched to an item from the bucke t 
    for(i = 0; i < bucket.length; i++) {
    	if(bucket[i].fileName == itemName) {
    		itemToAdd = bucket[i]; // This is the item without x/y coordinates
    	}
    }
    // Add the (x, y) coordinates to the item object now that it has been placed
    //console.log("Adding: " + itemName + "(" + itemXPos + ", " + itemYPos + " )");
    itemToAdd.xPos = itemXPos;
    itemToAdd.yPos = itemYPos;
   // console.log(itemToAdd);
    tray.push(itemToAdd);
    if(tray.length > 1) {
    	document.getElementById("error-message").innerHTML = "<p>&nbsp;</p>";
    	toggleButtonInteractability("done-button", "on");
    	toggleButtonInteractability("reset-button", "on");
    }
  },
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active')
    event.target.classList.remove('drop-target')
  }
});

function dragListener(e) {
  const target = e.target,
  x = (parseFloat(target.getAttribute('data-x')) || 0) + e.dx,
  y = (parseFloat(target.getAttribute('data-y')) || 0) + e.dy;
  var width = target.clientWidth;
  target.style.transform = `translate(${x}px,${y}px)`;
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

function revertBack(e) {
  const target = e.relatedTarget;
  target.addEventListener('mouseup', (e) =>{
    target.style.webkitTransform = target.style.transform = 'translate(0,0)';
    target.setAttribute('data-x', 0);
    target.setAttribute('data-y', 0);
  });
}