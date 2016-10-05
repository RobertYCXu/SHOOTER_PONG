
/*SETTING ALL VARIABLES*******************
******************************************
******************************************
*******************************************/

// boundaries
var canvas = document.querySelector("canvas");
fitToContainer(canvas);
function fitToContainer(canvas){
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
}
var boundX = canvas.width;
var boundY = canvas.height;
// initializing params
var notPause = true;
var start = false;
var direction = "down";
var angle = -90 *Math.PI/180;
var difficultyCoeff = 0.08;
var comScore = 0;
var playerScore = 0;
var secondLi = $("li").eq(1);
var modePressedOn = "default";
var easyPressed = true;
var winScore = 10;
var bullets = [];
// initializing sounds
var loser = new Howl({
	src: ['assets/sounds/loser.wav']
});
var hit = new Howl({
	src: ['assets/sounds/boop.mp3']
})
var background = new Howl({
	src: ['assets/sounds/retrogame.wav'],
	loop:true
})
var bloop = new Howl({
	src: ['assets/sounds/bloop.wav']
})
var gameOver = new Howl({
	src: ['assets/sounds/gameOver.wav']
})
var win = new Howl({
	src: ['assets/sounds/Win.mp3']
})
/*DRAWING NECESSITIES*********************
******************************************
******************************************
*******************************************/


// create paddles and ball
var pad1 = new Path.RoundRectangle(new Rectangle(new Point(180,20), new Point(225,27)), new Size(5,5));
pad1.fillColor = "#232323";
pad1.position.x = boundX/2;
console.log(pad1.position.x);
console.log(boundX);
console.log(boundX/2);
pad1.position.y = boundY/15;


var pad2 = new Path.RoundRectangle(new Rectangle(new Point(180,385), new Point(225,392)), new Size(5,5));
pad2.fillColor = "white";
pad2.position.x = boundX/2;
pad2.position.y = boundY - boundY/15;

var ball = new Path.Circle(new Point(boundX/2, boundY/2), 5);
ball.fillColor = 'white';


/*IMPORTANT MECHANICS FUNCTIONS**************
*********************************************
*********************************************
**********************************************/
// var id1 = background.play();
// initializing functions
function onFrame(e){
	startPong();
}

function startPong(){
	if (notPause && start){
		checkBounds();
		computer();
		shoot();	
	}
}
generateBullet();
function generateBullet(){
	if(start){
		var bullet = new Path.Circle(new Point(pad1.position.x, pad1.position.y), 7);
		bullet.fillColor = '#232323';
		bullets.push(bullet);
		console.log(pad2.bounds.width)
	}setTimeout(generateBullet, 3000);
}


function shoot(){
	for(var i = 0; i<bullets.length; i++){
		bullets[i].position.y+= 5;
		if(bullets[i].position.y >= pad2.position.y -10 && bullets[i].position.y < pad2.position.y && (bullets[i].position.x > pad2.bounds.x && bullets[i].position.x < pad2.bounds.x +pad2.bounds.width) ){
			bloop.play();
			if (pad2.bounds.width < 6) pad2.bounds.width = 0.01;
			else pad2.bounds.width -= 5;
		}

	}	
}


// moving paddle
function onMouseMove(e){	
	if(e.point.x >= 0 + pad2.bounds.width/2 && e.point.x <= boundX -pad2.bounds.width/2){
		pad2.position.x = e.point.x;
	}
}

// Pause function

function onKeyDown(e){
	if(e.key ==="p"){
		if(notPause === true)
			notPause = false;
		else
			notPause = true;
	}
}

/*LOGIC MATH AND AI*************************
*********************************************
*********************************************
**********************************************/

// check boundary conditions and when ball hits paddles and when player/comp scores
function checkBounds(){
	setBallTravel();
	if(ball.position.y >= pad2.position.y -10 && ball.position.y < pad2.position.y && (ball.position.x > pad2.bounds.x && ball.position.x < pad2.bounds.x +pad2.bounds.width) ){
		hit.play();
		direction = "up"
		checkAngle(pad2.bounds.x);
	}
		
	else if(ball.position.y <= pad1.position.y +10 && ball.position.y > pad1.position.y && (ball.position.x > pad1.bounds.x && ball.position.x < pad1.bounds.x +45) ){
		hit.play();
		direction = "down";
		checkAngle(pad1.bounds.x);
	}
	else if(ball.position.y < -5 && ball.position.y > -15 || ball.position.y > 420  && ball.position.y < 425){
			loser.play();
		}
	else if(ball.position.y < -400){
		angle = -90 *Math.PI/180;
		playerScore++;
		$("#player").text(playerScore); 
		 
		initBall();
		checkEndGame();
	}
	else if(ball.position.y > 800){
		angle = 90 *Math.PI/180;
		comScore++;
		$("#computer").text(comScore);
		 
		initBall();
		checkEndGame();
	}
}

// logic for ball direction and speed when it hits walls
function setBallTravel(){
	if(direction === "down"){
		
		if (ball.position.x <= 5){
			if(ball.position.y<boundY && ball.position.y>0){
				hit.play();
			}
			angle = 2*Math.PI-(angle - Math.PI);
		}
		else if (ball.position.x >= boundX ){
			if(ball.position.y<boundY && ball.position.y>0){
				hit.play();
			}
			angle = 3*Math.PI- angle;
		}
		ball.position.y -= 7*Math.sin(angle);
		ball.position.x  += 7*Math.cos(angle);

	}
	else if (direction === "up"){
		if (ball.position.x <=0){
			if(ball.position.y<boundY && ball.position.y>0){
				hit.play();
			}
			angle = Math.PI - angle ;
		}
		else if (ball.position.x >= boundX ){
			if(ball.position.y<boundY && ball.position.y>0){
				hit.play();
			}
			angle = Math.PI - angle;
		}
		ball.position.y -= 7*Math.sin(angle);
		ball.position.x  += 7*Math.cos(angle);
	}
}

// setting angle
function checkAngle(paddle){
	if(direction === "down"){
		angle = ((120/45)*(ball.position.x-paddle) + 210)*Math.PI/180;
	}
	else if(direction === "up"){
		angle = (-(120/pad2.bounds.width)*(ball.position.x-paddle) + 150)*Math.PI/180;
	}
	
}

// AI
function computer(){
	if(ball.position.x >= 24 && ball.position.x <= boundX){
		var difficulty = difficultyCoeff* Math.cos(2*Math.PI/(boundX*2)*ball.position.x )+ 1;
		pad1.position.x = difficulty*ball.position.x
		
	}
}

/*BUTTONS************************************
*********************************************
*********************************************
**********************************************/

// START BUTTON
$("#canvasholder button").on("click", function(){
	start = true;
	$(this).fadeOut(100);
	resetStyles();
	initBall();
	// background.fade(1, 0, 1000, id1);
	

})

// RESET BUTTON
$("#reset").on("click", function(){
	easyPressed = true;
	resetStyles();
	$("#canvasholder button").text("Play");
	$("#canvasholder button").fadeIn(500);
	hideBall();
})

// EASY MODE
$("#easy").on("click", function(){
	resetStyles();
	$("#canvasholder button").text("Play");
	$("#canvasholder button").fadeIn(500);
	hideBall();
	easyPressed = true;
	modeColorChanger();
	difficultyCoeff = 0.07;

})

// HARD MODE
$("#hard").on("click", function(){
	resetStyles();
	$("#canvasholder button").text("Play");
	$("#canvasholder button").fadeIn(500);
	hideBall();
	easyPressed = false;
	modeColorChanger();
	difficultyCoeff = 0.05;
	
})

/*RESETTER AND GAME OVER CHECKER*************
*********************************************
*********************************************
**********************************************/

// CHECK IF GAME OVER
function checkEndGame(){
	if(comScore === winScore || pad2.bounds.width < 0.1){
		$("canvas").css('background-color','purple');
		$("h1:first").css('background-color', 'purple');
		$("button").removeClass("default");
		$("button").removeClass("won");
		$("button").addClass("lost");
		$("#canvasholder button").text("Replay");
		$("#canvasholder button").fadeIn(500);
		$("li").eq(0).text("You lost").css({
			"font-size": "250%",
			"text-align": "center"
		});
		$("h3").css("background-color", "purple");
		modePressedOn = "lost";
		secondLi.remove();
		hideBall();
		modeColorChanger();
	}
	if(playerScore === winScore|| pad1.bounds.width < 0.1){
		$("canvas").css('background-color','orange');
		$("h1:first").css('background-color', 'orange');
		$("button").removeClass("default");
		$("button").removeClass("lost");
		$("button").addClass("won");
		$("#canvasholder button").text("Replay");
		$("#canvasholder button").fadeIn(500);
		$("li").eq(0).text("You won!").css({
			"font-size": "250%",
			"text-align": "center"
		});
		$("h3").css("background-color", "orange");
		modePressedOn = "won";
		secondLi.remove();
		hideBall();
		modeColorChanger();
	}

}

// RESETS GAME
function resetStyles(){
	comScore = 0;
	playerScore = 0;
	$("#computer").text(comScore);
	$("#player").text(playerScore);
	$("canvas").css('background-color','Steelblue');
	$("h1:first").css('background-color', 'Steelblue');
	$("button").removeClass("lost");
	$("button").removeClass("won");
	$("button").addClass("default");
	$("li").eq(0).text("Mouse to move, P to pause").css({
			"font-size": "100%",
			"text-align": "left"
		});
	$("ul").append(secondLi);
	$("h3").css("background-color", "black");
	modePressedOn = "default";
	angle = -90 *Math.PI/180;
	pad1.position.x = boundX/2;
	pad1.position.y = boundY/15;
	pad2.bounds.width = 45;
	console.log(pad2.bounds.width)
	modeColorChanger();
}

/*SECONDARY FUNCTIONS************************
*********************************************
*********************************************
**********************************************/

// INITIALIZES BALL IN CENTER
function initBall(){
		ball.position.x = boundX/2; 
		ball.position.y = boundY/2;
		
}

// HIDES BALL
function hideBall(){
	ball.position.x = -5; 
	ball.position.y = -5;
	start = false;
}

// CHANGES MODE COLOR BUTTONS
function modeColorChanger(){
	if (easyPressed){
		if(modePressedOn === "default" ){
			$("#easy").addClass("selectedDef");
			$("#easy").removeClass("selectedWon");
			$("#easy").removeClass("selectedLost");
			removeClasses("#hard");
		}
		else if(modePressedOn === "won" ){
			$("#easy").addClass("selectedWon");
			$("#easy").removeClass("selectedDef");
			$("#easy").removeClass("selectedLost");
			removeClasses("#hard");
		}
		else if(modePressedOn === "lost" ){
			$("#easy").addClass("selectedLost");
			$("#easy").removeClass("selectedDef");
			$("#easy").removeClass("selectedWon");
			removeClasses("#hard");
		}
	} else{
		if(modePressedOn === "default" ){
			$("#hard").addClass("selectedDef");
			$("#hard").removeClass("selectedWon");
			$("#hard").removeClass("selectedLost");
			removeClasses("#easy");
		}
		else if(modePressedOn === "won"){
			$("#hard").addClass("selectedWon");
			$("#hard").removeClass("selectedDef");
			$("#hard").removeClass("selectedLost");
			removeClasses("#easy");
		}
		else if(modePressedOn === "lost"){
			$("#hard").addClass("selectedLost");
			$("#hard").removeClass("selectedDef");
			$("#hard").removeClass("selectedWon");
			removeClasses("#easy");
		}
	}
}

function removeClasses(mode){
	$(mode).removeClass("selectedDef");
	$(mode).removeClass("selectedWon");
	$(mode).removeClass("selectedLost");
}















	


