var worldDic = {
    0: "empty",
    1: "brick",
    2: "coin",
    3: "cherry"
}

var step = 20;
var score = 0;

var worldDictMin = 0, worldDictMax = 2; // objects #s from the worldDict dictionary
var worldColumns = 10, worldRows = 10; // world's dimension

//Game settings
var gameSpeed = 400;
var intervalId = setInterval(gameLoop, gameSpeed);

var pacmanPos = {
    x: 1,
    y: 1
}

var ghostPos = {
    x: worldRows-2,
    y: worldColumns-2
}

var ghostMove = [
    {dx: 0, dy: -1}, // move up
    {dx: 0, dy: 1}, // move down
    {dx: -1, dy: 0}, // move left
    {dx: 1, dy: 0}, // move right
]

var coinPoint = 10, cherryPoint = 50; //points

var life = 3; //number of Pacman's lives

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWorld() {        
        var world = [];

        //randomize Cherry's coordinates. Started from 2 to be a bit far from Pacman
        var cherryPosX = randInt(2, worldColumns-1);
        var cherryPosY = randInt(2, worldColumns-1);

        //randomize World
        for(var x=0; x<worldColumns; x++){
            world[x]=[];
            for(var y=0; y<worldRows; y++){
                world[x][y] = randInt(worldDictMin, worldDictMax);
            }
        }
        
    world[pacmanPos.x][pacmanPos.y] = 0; //clear Pacman initial position
    world[cherryPosX][cherryPosY] = 3; //Cherry position

    return world;
}

world = randomWorld();

function displayWorld() {
    var output = "";

    for(var i=0; i<world.length; i++){
        output += "<div class='row'>";
        for(var j=0; j<world[i].length; j++) {
            output += `<div class="${worldDic[world[i][j]]}"></div>`;
        }
        output += "</div>";
    }
    
    document.getElementById("world").innerHTML = output;
}


function displayPacman() {
    document.getElementById("pacman").style.left = pacmanPos.x*step + "px";
    document.getElementById("pacman").style.top = pacmanPos.y*step + "px";
}

function ghostChase(){
    var bestMove = 0, bestDistance = (worldColumns*worldRows)**2;
    for (var m of ghostMove) {
        var next = {
            x: ghostPos.x + m.dx,
            y: ghostPos.y + m.dy
        };
        
        if(next.y > worldRows-1 || next.y < 0 || world[next.y][next.x] == 1){
            continue;
        }

        var dist = Math.sqrt((next.x - pacmanPos.x)**2 + (next.y - pacmanPos.y)**2);
        if (dist < bestDistance) {
            bestMove = m;
            bestDistance = dist;
        }
    }
        
        ghostPos.x += bestMove.dx;
        ghostPos.y += bestMove.dy;

        document.getElementById("ghost").style.left = ghostPos.x*step + "px";
        document.getElementById("ghost").style.top = ghostPos.y*step + "px";
    
}

displayWorld();
displayPacman();
ghostChase();


document.addEventListener(
    "keydown",
    function(e){
        //Left movement
        if(e.code === "ArrowLeft" && world[pacmanPos.y][pacmanPos.x-1] != 1) {
            document.getElementById("pacman").style.backgroundImage = "url(imgs/pacman-l.gif)";
            if(pacmanPos.x == 0 && world[pacmanPos.y][worldColumns-1] != 1){
                pacmanPos.x = worldColumns - 1;
            }
            else if (pacmanPos.x > 0){
                pacmanPos.x -= 1;
            }
        }
        //Right movement
        else if(e.code === "ArrowRight" && world[pacmanPos.y][pacmanPos.x+1] != 1) {
            document.getElementById("pacman").style.backgroundImage = "url(imgs/pacman-r.gif)";
            if(pacmanPos.x == worldColumns-1 && world[pacmanPos.y][0] != 1){
                pacmanPos.x = 0;
            }
            else if (pacmanPos.x < worldColumns-1){
                pacmanPos.x += 1;
            }
        }
        //Up movement
        else if(e.code === "ArrowUp") {
            document.getElementById("pacman").style.backgroundImage = "url(imgs/pacman-u.gif)";
            if(pacmanPos.y == 0 && world[worldRows-1][pacmanPos.x] != 1){
                pacmanPos.y = worldRows-1;
            }
            else if(pacmanPos.y !=0 && world[pacmanPos.y-1][pacmanPos.x] != 1) {
                pacmanPos.y -= 1;
            }
        }
        //Down movement
        else if(e.code === "ArrowDown") {
            document.getElementById("pacman").style.backgroundImage = "url(imgs/pacman-d.gif)";
            if(pacmanPos.y == worldRows-1 && world[0][pacmanPos.x] != 1){
                pacmanPos.y = 0;
            }
            else if(pacmanPos.y != worldRows-1 && world[pacmanPos.y+1][pacmanPos.x] != 1) {
                pacmanPos.y += 1;
            }
        }
        
        //check if Pacman ate coin and add 10 points
        if(world[pacmanPos.y][pacmanPos.x] == 2) {
            world[pacmanPos.y][pacmanPos.x] = 0;
            score +=coinPoint;
        }
        //check if Pacman ate cherry and add 50 points
        else if(world[pacmanPos.y][pacmanPos.x] == 3) {
            world[pacmanPos.y][pacmanPos.x] = 0;
            score +=cherryPoint;
        }
        
        displayPacman();
        displayWorld();
        displayScore();
    }
    )

function displayScore() {
    document.getElementById("score").innerText = score;
}

function gameOver(){
    // check if ghost caught Pacman 3 times
    if(pacmanPos.y == ghostPos.y && pacmanPos.x == ghostPos.x){
        life -= 1;
        document.getElementById("lives").innerText = life;
        if(life == 0){
            document.getElementById("pacman").remove();
            document.getElementById("ghost").remove();
            document.getElementById("finalText").innerText = "GAME OVER";

            clearInterval(intervalId);
        }   
        else{
            pacmanPos = {
                x: 1,
                y: 1
            }
            ghostPos = {
                x: worldRows - 2,
                y: worldColumns - 2
            }
            displayPacman();
        }
    }
    // check if Pacman ate all objects
    var s = 0;
    for (i=0; i<worldRows; i++){
        for(j=0;j<worldColumns; j++){
            if (world[i][j] > s){
                s = world[i][j];
            };
        }
    }
    if(s < 2){
        document.getElementById("ghost").remove();
        document.getElementById("finalText").innerText = "YOU WIN!";
        clearInterval(intervalId);
    }
}


function gameLoop(){
    console.log(pacmanPos.y == 0, world[worldRows-1][pacmanPos.x] != 1);
    gameOver();
    ghostChase();
}