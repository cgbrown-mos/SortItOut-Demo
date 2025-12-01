var sampler = {
	// Settings for showing the sampler-related UI
	// This needs to stay separate because we don't want it as part of the sampling content
	"data": {
		"items": [],
		"sortingMethods": ["size", "color", "free-sort_1", "free-sort_2"],
		"credits": "Images in this activity were provided by: <a href='https://www.thebutterflycompany.com/' target='_blank'>The Butterfly Company</a> (butterflies and beetles), <a href='https://www.acornnaturalists.com/products/animal-replicas-skull-tooth-claw-talon-fur-feather-egg-fossil/feather-replica-collection.html' target='_blank'>Acorn Naturalists</a> (feathers), and <a href='https://www.conchology.be/' target='_blank'>Conchology</a> (shells &copy; Guido & Philippe Poppe)."
	}
}

var samplerItems = {
	// A select number of medium-sized items for the sampler
	"feathers": {
		"readableNames": ["Blue jay feather", "Hairy woodpecker feather", "Mallard duck feather", "Northern cardinal feather", "Northern flicker feather", "Red-tailed hawk feather", "Ring-billed gull feather", "Rough-legged hawk feather", "Sandhill crane feather", "Short-eared owl feather", "Snowy owl feather"],
		"fileNames": ["Blue-Jay,-Dorsal_s", "Hairy-Woodpecker,-Dorsal_s", "Mallard,-Dorsal_s", "Northern-Cardinal,-Dorsal_s", "Northern-Flicker,-Dorsal_s", "Red-tailed-Hawk,-Dorsal_s", "Ring-billed-Gull,-Dorsal_s", "Rough-legged-Hawk,-Dorsal_s", "Sandhill-Crane,-Dorsal_s", "Short-eared-Owl,-Dorsal_s", "Snowy-Owl,-Dorsal_s"]
	},
	"butterflies": {
		"readableNames": ["Apricot sulphur butterfly", "Peruvian hairstreak butterfly", "Pipevine swallowtail butterfly", "Purple glory princess butterfly", "The great Mormon butterfly"],
		"fileNames": ["apricot-sulphur_s", "peruvian-hairstreak_s", "pipevine-swallowtail_cropped_s", "purple-glory-princess_cropped_s", "the-great-mormon_s"]
	},
	"shells": {
		"readableNames": ["Coral lovers shell", "Spiral babylon shell", "Scallop shell 2", "Jacna abalone shell", "Conch shell", "Cone shell 1", "Cone shell 2", "Japanese wonder shell"],
		"fileNames": ["Babelomurex-gemmatus_s", "Babylonia-spirata_s", "Flexopecten-glaber_s", "Haliotis-jacnensis-jacnensis_s", "Laevistrombus-turturella_s", "Rhizoconus-capitaneus_s", "Tesselliconus-eburneus_s", "Thatcheria-mirabilis_s"]
	},
	"beetles": {
		"readableNames": ["Armillatus beetle", "Fancy pants weevil beetle", "Fiddle beetle", "Harlequin beetle", "Jewel beetle", "Regal jewel beetle", "Rhino beetle", "Saw toothed stag beetle"],
		"fileNames": ["armillatus-beetle_s", "fancy-pants-weevil_s", "fiddle-beetle_s", "harlequin-beetle_s", "jewel-beetle_s", "regal-jewel_s", "rhino-beetle_s", "saw-toothed-stag-beetle_s"]
	}
}

function generateSampler() {
	console.log("Generating sampler...");
	// Add a few of each items to the bucket
	// Note: Keep in mind that this should be flexible to adapt to a growing number of collections
	var numberCollections = Object.keys(samplerItems).length; // This is 3 now but might change
	var numberSamplesPerType = 3; // e.g. set this to 3 to get 9 items (3 samples each from 3 collections)
	// 1. Set up a 2D array to store the random numbers representing indices of sampled objects
	// This is what represents the items to add to the bucket
	// a. Each 1st level array is for a collection.
	// b. The 2nd level of the array represents items to add from these arrays (stored as index numbers)
	var randomNumbers = new Array(numberCollections);
	for(x = 0; x < randomNumbers.length; x++) {
	  randomNumbers[x] = Array(numberSamplesPerType);
	}
	//console.log(randomNumbers);
	// Make an array containing numbers 0 through numberItems
	// This is the inventory of random numbers to pick from
	// Keeping this inventory up-to-date as numbers are chosen prevents choosing duplicates
	var randomOptions = new Array(numberCollections);
	for(y = 0; y < numberCollections; y++) {
		var numberItems = samplerItems[Object.keys(samplerItems)[y]].readableNames.length;
		randomOptions[y] = Array(numberItems);
		for(z = 0; z < numberItems; z++) {
			randomOptions[y][z] = z;
		}
	}
	//console.log(randomOptions);
	for(i = 0; i < numberSamplesPerType; i++) { // For now, sample each collection 3 times to get 9 items
		// 2. Generate 3 random numbers for each collection
		// Add these to the array per collection
		for(j = 0; j < numberCollections; j++) {
			numberItems = samplerItems[Object.keys(samplerItems)[j]].readableNames.length;
			// Pick a random item from that list as the random number
			var numberRandomOptions = randomOptions[j].length;
			var random = randomOptions[j][Math.floor(Math.random()*numberRandomOptions)];
			// After the number has been assigned to the randomNumbers array, remove it from randomOptions
			var indexToRemove = randomOptions[j].indexOf(random);
			randomOptions[j].splice(indexToRemove, 1);
			randomNumbers[j][i] = random;
		}
	}
	// 3. Access the item of that index for each collection and add it to th
	// Note: This could potentially be consolidated into the loop above
	// Keeping them separate now to stay organized re: steps taking place
	for(i = 0; i < numberSamplesPerType; i++) {
		for(j = 0; j < numberCollections; j++) {
			var index = randomNumbers[j][i];
			var allItemReadableNames = samplerItems[Object.keys(samplerItems)[j]].readableNames;
			var itemReadableName = allItemReadableNames[Object.keys(allItemReadableNames)[index]];
			var allItemFileNames = samplerItems[Object.keys(samplerItems)[j]].fileNames;
			var itemFileName = allItemFileNames[Object.keys(allItemFileNames)[index]];
			var collectionName = Object.keys(samplerItems)[j];
			var itemToLoad = new Item(itemReadableName, itemFileName, collectionName, null, null); // (x, y) is only set when the item is placed
			bucket.push(itemToLoad);
		}
	}
}