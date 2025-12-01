var fauxSorts = []; // All possible faux sorts
var fauxSortsSelected = []; // Faux sorts to show in the gallery per play

function FauxSort(title, fileName) {
  this.title = title;
  this.fileName = fileName;
}

var sortTitles = [
  "Kayla's Free Sort",
  "Fabiola's Free Sort",
  "Jamie's Size Sort",
  "Charlie's Free Sort",
  "Camila's Free Sort",
  "Jordan's Free Sort",
  "Jayden's Color Sort",
  "Makenna's Size Sort",
  "Ricardo's Size Sort",
  "Ebony's Size Sort",
  "Jonah's Color Sort",
  "Sophie's Color Sort",
  "Liam's Color Sort",
  "Leah's Free Sort", 
  "Manon's Size Sort", 
  "Maria's Free Sort",
  "Ramin's Free Sort",
  "Jeremiah's Color Sort", 
  "Deepak's Free Sort", 
  "Talia's Free Sort", 
  "Yan's Color Sort", 
  "Santiago's Color Sort", 
  "Noah's Free Sort",
  "Isabella's Free Sort",  
  "Julien's Free Sort", 
  "Akira's Free Sort", 
  "Katharina's Free Sort", 
  "Casey's Size Sort", 
  "Dakota's Size Sort", 
  "Avery's Color Sort"
];

for(i = 0; i < sortTitles.length; i++) {
  var fauxSortToLoad = new FauxSort(sortTitles[i], sortTitles[i]);
  fauxSorts.push(fauxSortToLoad);
}
console.log(fauxSorts);

function chooseSampleFauxSorts() {
  var sampleFauxSorts = []; // Random samples to show in the gallery
  var numberFauxSorts = 5;
  var randomOptions = []; // fauxSorts is all faux sorts available to choose from
  for(i = 0; i < fauxSorts.length; i++) {
    randomOptions.push(i);
  }
  //console.log(randomOptions);
  for(i = 0; i < numberFauxSorts; i++) {
    var numberOptions = randomOptions.length;
    var random = randomOptions[Math.floor(Math.random()*(numberOptions))];
    var indexToRemove = randomOptions.indexOf(random);
    randomOptions.splice(indexToRemove, 1);
    sampleFauxSorts.push(fauxSorts[random]);
  }
  return sampleFauxSorts;
}

function loadFauxTray(number) {
  var sortToLoad = fauxSortsSelected[number];
  var tray = [];
  //console.log(sortToLoad);
  //console.log(sortToLoad.items);
  for(i = 0; i < sortToLoad.items.length; i++) {
    var itemName = sortToLoad.items[i].name;
    var collectionName = sortToLoad.items[i].collection;
    //console.log("Faux tray item " + i + " collection: " + collectionName + " item name " + itemName);
    var xPos = sortToLoad.items[i].xPos;
    var yPos = sortToLoad.items[i].yPos;
    var itemToLoad = new Item(itemName, itemName, collectionName, xPos, yPos); // No readable name needed since all images are baked into the canvas
    tray.push(itemToLoad);
  }
  return tray;
}