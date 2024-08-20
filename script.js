// board
let board;
let boardWidth = 740;
let boardHeight = 250;
let context;
let floor = 32;

// dino
let dinoWidth = 45;
let dinoHeight = 50;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight - floor;
let baseDinoY = dinoY;
let dinoImg;
// dino animation
let dinoRunStartFrame = 4;
let dinoRunEndFrame = 9;
let dinoDuckStartFrame = 18;
let dinoDuckEndFrame = 23;

// box
let boxArray = [];
let boxX = 900;
//box1
let boxWidth1 = 32;
let boxHeight1 = 32;
let boxY1 = boardHeight - boxHeight1 - floor;
let boxImg1;
//box2
let boxWidth2 = 33;
let boxHeight2 = 64;
let boxY2 = boardHeight - boxHeight2 - floor;
let boxImg2;

// diamonds
let diamondArray = [];
let diamondWidth = 32;
let diamondHeight = 32;
let diamondX = 1100;
let diamondY = boardHeight - diamondHeight - floor;
let diamondImg1, diamondImg2, diamondImg3, diamondImg4;

// birds
let birdArray = [];
let birdWidth = 32;
let birdHeight = 28;
let birdX = 1250;
let birdY = boardHeight - birdHeight - floor - 47;
let birdImg;
let birdMaxFrame = 7;

// logic
let gameOver = false
let score = 0;
let next_speedup_score = 10;

// physics
let physics_interval = 1000 / 60;
let velocityX = -6;
let velocityY = 0;
let gravity = 0.8;
let then_physics = 0;
let elapsed_physics;


let dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight,
    duck : false
}

window.onload = function()  {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d")

    // ground
    grassImg = new Image();
    grassImg .src = "./sprites/Grass.png";
    grassImg .onload = function() {
        context.drawImage(grassImg , -5, boardHeight - 34, 750, 34);
    }

    // dino
    dinoImg = new Image();
    dinoImg.src = "./sprites/DinoSprites.png";
    dinoImg.onload = function() {
        context.drawImage(dinoImg, 72*5+18, 12, dino.width, dino.height, dinoX, dinoY, dino.width, dino.height);
    }

    // boxes
    boxImg1 = new Image();
    boxImg1.src = "./sprites/box.png"
    boxImg2 = new Image();
    boxImg2.src = "./sprites/box2.png"

    // diamonds
    diamondImg1 = new Image();
    diamondImg1.src = "./sprites/diamond.png"
    diamondImg2 = new Image();
    diamondImg2.src = "./sprites/diamond2.png"
    diamondImg3 = new Image();
    diamondImg3.src = "./sprites/diamond3.png"
    diamondImg4 = new Image();
    diamondImg4.src = "./sprites/diamond4.png"

    //birds
    birdImg = new Image();
    birdImg.src = "./sprites/BirdSprites.png"

    requestAnimationFrame(update);
    setInterval(placeBox, 1500);
    setInterval(placeDiamond, 1500);
    setInterval(placeBird, 1500);
    document.addEventListener("keydown", moveDino);
    document.addEventListener("keyup", unDuck);
}

// animation
let frame = dinoRunStartFrame;
let start_frame = dinoRunStartFrame;
let end_frame = dinoRunEndFrame;
let anim_interval = 1000 / 5; // dino animation is played in 5 fps
let bird_anim_interval = 1000 / 10; // bird animation is played at 10 fps
let then_anim = 0
let now, elapsed_anim

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.drawImage(grassImg , -5, boardHeight - 34, 750, 34);

    now = Date.now();
    elapsed_anim = now - then_anim;

    // animating dino
    if (elapsed_anim > anim_interval) {
        then_anim = now - (elapsed_anim % anim_interval);

        frame += 1;
        if (frame > end_frame) {
            frame = start_frame;
        }
    }

    elapsed_physics = now - then_physics;

    // physics && boxes, diamonds
    if (elapsed_physics > physics_interval) {
        context.clearRect(0, 0, board.width, board.height);
        context.drawImage(grassImg , -5, boardHeight - 34, 750, 34);
        then_physics = now - (elapsed_physics % physics_interval);

        velocityY += gravity;
        dino.y = Math.min(dino.y + velocityY, dinoY);
        context.drawImage(dinoImg, 72*frame+18, 12, dino.width, dino.height, 
            dino.x, dino.y, dino.width, dino.height);
        
        // drawing and moving boxes
        for (let i = 0; i < boxArray.length; i++) {
            let box = boxArray[i];
            box.x += velocityX;
            context.drawImage(box.img, box.x, box.y, box.width, box.height);

            if (detectCollision(dino, box)) {
                gameOver = true;
            }
        }

        // drawing and moving diamonds
        for (let i = 0; i < diamondArray.length; i++) {
            let diamond = diamondArray[i];
            diamond.x += velocityX;
            context.drawImage(diamond.img, diamond.x, diamond.y, diamond.width, diamond.height);

            if (detectCollision(dino, diamond)) {
                score += diamond.score;
                diamondArray.splice(i, 1);
            }
        }

        // drawing and moving birds
        for (let i = 0; i < birdArray.length; i++) {
            let bird = birdArray[i];
            bird.x += velocityX;

            bird_now = Date.now();
            bird.elapsed = bird_now - bird.then;

            if (bird.elapsed > bird_anim_interval) {
                bird.then = bird_now - (bird.elapsed % bird_anim_interval);

                bird.frame += 1
                if (bird.frame > birdMaxFrame) {
                    bird.frame = 0;
                }
            }

            context.drawImage(birdImg, 32*bird.frame, 0, bird.width, bird.height, 
                bird.x, bird.y, bird.width, bird.height);

            if (detectCollision(dino, bird)) {
                gameOver = true;
            }

        }

        // printing score
        context.fillStyle="darkgreen";
        context.font="35px monogram";
        display_text = "Score: " + score
        context.fillText(display_text, 315, 30);

        if (score >= next_speedup_score) {
            next_speedup_score += 10;
            velocityX -= 0.5;
            console.log(velocityX)
        }
    }
}

function moveDino(e) {
    if (gameOver) {
        return;
    }

    if ((e.code == "Space" || e.code == "ArrowUp") && dino.y == dinoY) {
        //jump
        velocityY = -15;
        if (dino.duck) {
            resetDino();
        }
    }
    else if (e.code == "ArrowDown" && dino.y == dinoY && !dino.duck) {
        //duck
        start_frame = dinoDuckStartFrame;
        end_frame = dinoDuckEndFrame;
        frame = start_frame;
        dinoY = baseDinoY + 3;
        dino.height = dinoHeight - 3;
        dino.width = dinoWidth + 15;
        dino.duck = true;
    }
}

function unDuck(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowDown" && dino.y == dinoY) {
        resetDino();
    }
}

function resetDino() {
    start_frame = dinoRunStartFrame;
    end_frame = dinoRunEndFrame;
    frame = start_frame;
    dinoY = baseDinoY;
    dino.height = dinoHeight;
    dino.width = dinoWidth;
    dino.duck = false;
}

function placeBox() {
    if (gameOver) {
        return;
    }

    let box = {
        img : null,
        x : boxX,
        y : null,
        width : null,
        height: null
    }

    let placeBoxChance = Math.random();
    
    if (placeBoxChance > 0.66) {
        box.img = boxImg1
        box.height = boxHeight1
        box.width = boxWidth1
        box.y = boxY1
        boxArray.push(box);
    } 
    else if (placeBoxChance > 0.33) {
        box.img = boxImg2
        box.height = boxHeight2
        box.width = boxWidth2
        box.y = boxY2
        boxArray.push(box);
    }

    if (boxArray.length > 5) {
        boxArray.shift();
    }

}

function placeDiamond() {
    if (gameOver) {
        return;
    }

    let diamond = {
        img : null,
        x : diamondX,
        y : diamondY,
        width : diamondWidth,
        height : diamondHeight,
        score : null
    };

    let placeDiamondChance = Math.random();
    
    if (placeDiamondChance >= 0.95) {
        diamond.img = diamondImg4;
        diamond.score = 4
        diamondArray.push(diamond);
    } else if (placeDiamondChance >= 0.90) {
        diamond.img = diamondImg3;
        diamond.score = 3
        diamondArray.push(diamond);
    } else if (placeDiamondChance >= 0.75) {
        diamond.img = diamondImg2;
        diamond.score = 2
        diamondArray.push(diamond);
    } else if (placeDiamondChance >= 0.50) {
        diamond.img = diamondImg1;
        diamond.score = 1
        diamondArray.push(diamond);
    }
    
    if (diamondArray.length > 5) {
        diamondArray.shift();
    }
}

function placeBird() {
    if (gameOver) {
        return;
    }

    let bird = {
        img : birdImg,
        x : birdX,
        y : birdY,
        width : birdWidth,
        height : birdHeight,
        frame : 0,
        elapsed : null,
        then : 0,
    }

    let placeBirdChance = Math.random();

    if (placeBirdChance >= 0.80) {
        birdArray.push(bird);
    }

    if (birdArray.length > 5) {
        birdArray.shift();
    }

}

let offset = 10 // offset of the dinosaurs nose
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width - offset > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}