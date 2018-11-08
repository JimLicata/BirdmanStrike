import { getMouse, getRandomUnitVector } from './utilities.js';
import { createImageSprites } from './helpers.js';
export default init;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const screenWidth = 432;
const screenHeight = 768;
let totalScore = 0;
let levelScore = 0;
let levelGoal = 0;
let vectorChangeProb = 0;
let levelTimeLimit = 0;
let startTime;
let lastTimeRemaining = 0; // time remaining in integer seconds
let displayTime;
let lives = 3;
let round = 1;
let cloudsBack = new Image();
let cloudsFront = new Image();

// fake enum
const GameState = Object.freeze({
	START: Symbol("START"),
	MAIN: Symbol("MAIN"),
	LEVELOVER: Symbol("LEVELOVER"),
	GAMEOVER: Symbol("GAMEOVER")
});

const MyErrors = Object.freeze({
	drawHUDswitch: "Invalid value in drawHUD switch",
	mousedownSwitch: "Invalid value in mousedown switch",
	loadLevelSwitch: "Invalid value in loadLevel switch"
});


let gameState = GameState.START;
let imageData;
let sprites = [];
let currentLevel = 1;
let clearSound, hitSound, missSound, music, startSound, bupSound;


function init(argImageData) {
	imageData = argImageData;
	loadLevel(currentLevel);

	//load background
	cloudsBack.src = 'images/Background/CloudsBack.png'
	cloudsFront.src = 'images/Background/CloudsFront.png'

	// Load Sounds
	clearSound = new Howl({
		src: ['sounds/PowerUp17.mp3'],
		volume: 0.2
	});

	hitSound = new Howl({
		src: ['sounds/UI_Quirky28.mp3'],
		volume: 0.5
	});

	bupSound = new Howl({
		src: ['sounds/UI_Quirky32.mp3'],
		volume: 0.5
	});

	missSound = new Howl({
		src: ['sounds/PowerDown7.mp3'],
		volume: 0.8
	});

	startSound = new Howl({
		src: ['sounds/SynthChime2.mp3'],
		volume: 0.2
	});

	music = new Howl({
		src: ['sounds/Arcade-Heroes.mp3'],
		volume: 0.3,
		loop: true
	});

	music.play();

	// hook up events
	canvas.onmousedown = doMousedown;
	loop();
}

function loop(timestamp) {
	// schedule a call to loop() in 1/60th of a second
	requestAnimationFrame(loop);

	if (!startTime) startTime = timestamp; // this runs only once, when the game starts up
	ctx.clearRect(0, 0, screenWidth, screenHeight);

	// draw background
	ctx.fillRect(0, 0, screenWidth, screenHeight)

	// draw game sprites
	if (gameState == GameState.MAIN) {
		// draw background
		/*ctx.save();
		ctx.fillStyle = "#3399ff";
		ctx.fillRect(0, 0, screenWidth, screenHeight);*/

		

		ctx.save();
		ctx.scale(2.3, 2.3);
		ctx.drawImage(cloudsBack, 0, 0);
		ctx.restore();

		ctx.save();
		ctx.scale(2.3, 2.3);
		ctx.drawImage(cloudsFront, 0, 0);
		ctx.restore();

		ctx.save();
		ctx.fillStyle = "#001a33";
		ctx.fillRect(0, 710, 432, 100);
		ctx.fillRect(0, 698, 432, 7);
		ctx.fillRect(0, 688, 432, 5);
		ctx.fillRect(0, 679, 432, 3);
		ctx.fillRect(0, 670, 432, 3);
		ctx.restore();



		// loop through sprites
		for (let s of sprites) {
			if (s.speed == 0) continue; // don't score the sprite if it's already been clicked
			if (s.type == "monsterMid") {
				s.setEnemy(screenHeight / 2);
				if (Math.random() < vectorChangeProb) s.fwd = getRandomUnitVector();
			}

			if (s.type == "monsterHigh") {
				s.setEnemy(screenHeight / 4);
				if (Math.random() < vectorChangeProb) s.fwd = getRandomUnitVector();
			}

			if (s.type == "monsterLow") {
				s.setEnemy(3 * screenHeight / 4);
				if (Math.random() < vectorChangeProb) s.fwd = getRandomUnitVector();
			}

			// move sprites
			s.move();

			// left and right
			if (s.x <= 0 || s.x >= screenWidth - s.width) {
				s.reflectX();
				s.move();
			}

			// if off bottom of screen
			if (s.y > screenHeight + s.height) {
				s.speed = 0; // prevents sprite from being drawn or interacted with
				lives--;
				missSound.play();
			}

			// collision detection
			if (s.type == "player" && displayTime > 0) {
				if (s.collisionDetection(sprites)) {
					levelScore++;
					hitSound.play();
				}

			}
			// draw sprites
			s.draw(ctx);

		} // end for
		if (lives <= 0) {
			totalScore += levelScore;
			gameState = GameState.GAMEOVER;
		}

		if (levelScore == levelGoal) {
			clearSound.play();
			if (lives < 3) // add extra life if at least one was lost
				lives++;
			gameState = GameState.LEVELOVER;
		}
		displayTime = checkLevelTimer(timestamp);
	} // end if



	// draw rest of UI, depending on current gameState
	drawHUD(ctx);

} // end loop()

function drawHUD(ctx) {
	ctx.save();

	switch (gameState) {
		case GameState.START:
			ctx.save();

			// Draw background
			ctx.translate(screenWidth / 2, screenHeight / 2);
			ctx.scale(6, 6);
			ctx.globalAlpha = 0.5;
			//ctx.drawImage(imageData.cage2, -20, -30, 41, 59);

			ctx.restore();

			// Draw Text
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			fillText(ctx, "Airborn", screenWidth / 2, screenHeight / 2 - 100, "38pt 'Anton', sans-serif", "red");
			fillText(ctx, "Onslaught!", screenWidth / 2, screenHeight / 2 - 20, "38pt 'Anton', sans-serif", "red");

			//ctx.drawImage(imageData.cage1, 100, screenHeight / 2 + 40, 50, 60);
			//ctx.drawImage(imageData.cage1, screenWidth - 100 - 50, screenHeight / 2 + 40, 50, 60);

			// Name
			fillText(ctx, "By James Licata", screenWidth / 2, screenHeight / 2 + 70, "18pt 'Anton', sans-serif", "white");
			//strokeText(ctx, "By James Licata", screenWidth / 2, screenHeight / 2 + 70, "14pt 'Press Start 2P', cursive", "white", 2);

			// instructions
			//fillText(ctx, "YOUR GOAL: To click all the Nick Cage's!", screenWidth / 2, screenHeight / 2 + 125, "8pt 'Press Start 2P', cursive", "red");
			fillText(ctx, "Click anywhere to begin", screenWidth / 2, screenHeight / 2 + 170, "20pt 'Anton', sans-serif", "white");


			break;

		case GameState.MAIN:


			// draw score
			fillText(ctx, `Score: ${totalScore + levelScore}`, 10, 20, "14pt Anton", "white");
			fillText(ctx, `Round: ${round}`, screenWidth - 110, 20, "14pt Anton", "white");

			break;

		case GameState.LEVELOVER:
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			fillText(ctx, `Round #${round} over!`, screenWidth / 2, screenHeight / 2 - 50, "30pt Anton", "red");
			fillText(ctx, "Click to Continue!", screenWidth / 2, screenHeight / 2 + 50, "12pt Anton", "white");
			break;

		case GameState.GAMEOVER:
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			fillText(ctx, "Game Over!", screenWidth / 2, screenHeight / 2 - 65, "38pt 'Anton'", "red");
			fillText(ctx, `Total Score: ${totalScore}`, screenWidth / 2, screenHeight / 2, "26pt 'Anton'", "white");
			fillText(ctx, `Round Reached: ${round}`, screenWidth / 2, screenHeight / 2 + 55, "26pt 'Anton'", "white");
			fillText(ctx, "Click to play again!", screenWidth / 2, screenHeight / 2 + 100, "20pt 'Anton'", "red");
			break;

		default:
			throw new Error(MyErrors.drawHUDswitch);

	}

	ctx.restore();

}

function loadLevel() {
	levelScore = 0;
	let margin = 50;
	let rect = { left: margin, top: margin, width: screenWidth - margin * 2, height: screenHeight - margin * 3 }
	sprites = [];
	switch (currentLevel) {
		case 1:
			sprites = sprites.concat(
				createImageSprites(lives, 60, 70, imageData.player, "player", rect),
				createImageSprites(3, 70, 70, imageData.monster, "monsterMid", rect),
			);

			levelGoal = 3;
			vectorChangeProb = .005;
			break;

		case 2:
			// 6 Nick Cage's, 10 others
			sprites = sprites.concat(
				createImageSprites(lives, 60, 70, imageData.player, "player", rect),
				createImageSprites(3, 70, 70, imageData.monster, "monsterMid", rect),
				createImageSprites(3, 70, 70, imageData.monster, "monsterHigh", rect),
			);
			levelGoal = 6;
			vectorChangeProb = .008;
			break;

		case 3:
			// 9 Nick Cage's 20 others
			sprites = sprites.concat(
				createImageSprites(lives, 60, 70, imageData.player, "player", rect),
				createImageSprites(3, 50, 50, imageData.monster, "monsterLow", rect),
				createImageSprites(3, 70, 70, imageData.monster, "monsterMid", rect),
				createImageSprites(3, 70, 70, imageData.monster, "monsterHigh", rect),

			);

			levelGoal = 9;
			vectorChangeProb = .01;
			break;

		default:
			throw new Error(MyErrors.loadLevelSwitch);
	} // end switch
	startTime = performance.now();
}


function doMousedown(e) {
	console.log(e);
	let mouse = getMouse(e);
	console.log(`canvas coordinates: x=${mouse.x} y=${mouse.y}`);

	switch (gameState) {
		case GameState.START:
			currentLevel = 1;
			totalScore = 0;
			levelScore = 0;
			gameState = GameState.MAIN;
			startSound.play();
			loadLevel(currentLevel);
			break;

		case GameState.MAIN:
			// loop through the array backwards to check the sprites that are "on top" first
			for (let i = sprites.length - 1; i >= 0; --i) {
				let s = sprites[i];
				if (s.getRect().containsPoint(mouse)) {
					if (s.type == "player") {
						s.jump();
					}
					break;
				}
			} // end for loop
			break;



		case GameState.LEVELOVER:
			if (currentLevel != 3)
				currentLevel++;
			round++;
			totalScore += levelScore;
			levelScore = 0;
			loadLevel(currentLevel);
			gameState = GameState.MAIN;
			break;

		case GameState.GAMEOVER:
			gameState = GameState.START;
			lives = 3;
			break;



		default:
			throw new Error(MyErrors.mousedownSwitch);
	} // end switch
}

function fillText(ctx, string, x, y, css, color) {
	ctx.save();
	ctx.font = css;
	ctx.fillStyle = color;
	ctx.fillText(string, x, y);
	ctx.restore();
}

function strokeText(ctx, string, x, y, css, color, lineWidth) {
	ctx.save();
	ctx.font = css;
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.strokeText(string, x, y);
	ctx.restore();
}

function checkLevelTimer(timestamp) {
	let elapsedTime = (timestamp - startTime) / 1000;
	let timeRemaining = Math.ceil(levelTimeLimit + elapsedTime);
	if (timeRemaining < 0 && timeRemaining < lastTimeRemaining) {
		//levelScore--;
		//totalScore--;
		//hitWrongSound.play();
	}
	lastTimeRemaining = timeRemaining;
	// let displayTime = timeRemaining;
	return timeRemaining;
}


