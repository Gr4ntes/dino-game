// board
let board;
let boardWidth = 740;
let boardHeight = 250;
let context;

// dino
let dinoWidth = 45;
let dinoHeight = 50;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight - 32;
let dinoImg;

// box
let boxArray = [];
let boxX = 700;
//box1
let boxWidth1 = 32;
let boxHeight1 = 32;
let boxY1 = boardHeight - boxHeight1 - 32;
let boxImg1;
//box2
let boxWidth2 = 33;
let boxHeight2 = 64;
let boxY2 = boardHeight - boxHeight2 - 32;
let boxImg2;

// logic
let gameOver = false
let score = 0;

// physics
let physics_interval = 1000 / 60;
let velocityX = -8;
let velocityY = 0;
let gravity = 0.8;
let then_physics = 0;
let elapsed_physics;


let dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight
}

window.onload = function()  {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    grassImg = new Image();
    grassImg .src = "./sprites/Grass.png";
    grassImg .onload = function() {
        context.drawImage(grassImg , -5, boardHeight - 34, 750, 34);
    }

    context = board.getContext("2d")

    dinoImg = new Image();
    dinoImg.src = "./sprites/DinoSprites.png";
    dinoImg.onload = function() {
        context.drawImage(dinoImg, 72*5+18, 12, dino.width, dino.height, dinoX, dinoY, dino.width, dino.height);
    }

    boxImg1 = new Image();
    boxImg1.src = "./sprites/box.png"
    boxImg2 = new Image();
    boxImg2.src = "./sprites/box2.png"

    requestAnimationFrame(update);
    setInterval(placeBox, 1000);
    document.addEventListener("keydown", moveDino);
}

// animation
let frame = 4;
let fps = 5;
let anim_interval = 1000 / 5;
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
        if (frame > 9) {
            frame = 4;
        }
    }

    elapsed_physics = now - then_physics;

    // physics && boxes
    if (elapsed_physics > physics_interval) {
        context.clearRect(0, 0, board.width, board.height);
        context.drawImage(grassImg , -5, boardHeight - 34, 750, 34);
        then_physics = now - (elapsed_physics % physics_interval);

        velocityY += gravity;
        dino.y = Math.min(dino.y + velocityY, dinoY);
        context.drawImage(dinoImg, 72*frame+18, 12, dino.width, dino.height, 
            dino.x, dino.y, dino.width, dino.height);
        
        for (let i = 0; i < boxArray.length; i++) {
            let box = boxArray[i];
            box.x += velocityX;
            context.drawImage(box.img, box.x, box.y, box.width, box.height);

            if (detectCollision(dino, box)) {
                gameOver = true;
                
            }

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
    }
    else if (e.code == "ArrowDown" && dino.y == dinoY) {
        //duck
    }

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

let offset = 10 // offset of the dinosaurs nose
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width - offset > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}