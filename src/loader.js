import init from './main.js';
import {loadImages} from './helpers.js';

const imageSources = {
		player:'images/player.png',
		monster:'images/monster.png',
};

// loadImages(imageSourcesObject,callback);
loadImages(imageSources,startGame);


function startGame(imageData){
	init(imageData);
}
