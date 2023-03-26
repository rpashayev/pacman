var worldDic = {
    0: "brick",
    1: "empty",
    2: "coin",
    3: "cherry",
    4: "ghost"
}

var pacmanClass = document.getElementsByClassName("pacman");
var ghostsClass = document.getElementsByClassName("ghost");
var pacmanAll = document.querySelectorAll(".pacman");
var ghostAll = document.querySelectorAll(".ghost");

var step = 20;
var score = 0;

var worldDictMin = 0, worldDictMax = 2; // objects #s from the worldDict dictionary
var worldColumns = 14, worldRows = 14; // world's dimension

var maze = [];
var path = 0;

//Game settings
var gameSpeed = 400;
var intervalId = setInterval(gameLoop, gameSpeed);
var gameOverChk = setInterval(gameOver, gameSpeed/3);
var bricksNum = Math.floor(worldColumns * worldRows * (1-0.20)); // bricks are 20% of the world
var ghostNum = 3; //number of ghosts

var pacmanObj = [
    {   
        x_i: 2,
        y_i: 2,
        x: 2,
        y: 2,
        _class: pacmanClass[0]
    },
    {   
        x_i: worldColumns-3,
        y_i: 2, 
        x: worldColumns-3,
        y: 2,
        _class: pacmanClass[1]
    }
]

var ghostObj =[];
for(var i=0; i<ghostNum; i++){
    ghostObj.push({
        x_i: Math.floor(worldRows/2) + randInt(-2, 2),
        y_i: Math.floor(worldColumns/2)  + randInt(-2, 2),
        x: Math.floor(worldRows/2) + randInt(-2, 2),
        y: Math.floor(worldColumns/2)  + randInt(-2, 2),
        _class: ghostsClass[i]
    })
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

//Prevent ghosts from mixing - wip
function isMixing(g1, g2) {
    return g1.x < g2.x &&
        g1.x > g2.x &&
        g1.y < g2.y &&
        g1.y > g2.y;
}

function randomWorld() {        
    var world = [];

    //randomize Cherry's coordinates. Started from 2 to be a bit far from Pacman
    var cherryPosX = randInt(2, worldColumns-1);
    var cherryPosY = randInt(2, worldColumns-1);

    //randomize World without bricks
    for(var x=0; x<worldColumns; x++){
        world[x]=[];
        for(var y=0; y<worldRows; y++){
            world[x][y] = randInt(worldDictMin, worldDictMax);
        }
    }

    // place some bricks
    for (var i = 0; i < bricksNum; i++) {
        var x = Math.floor(Math.random() * worldColumns);
        var y = Math.floor(Math.random() * worldRows);
        while (world[y][x] > 1) {
          // if the place is not empty , try again
          x = Math.floor(Math.random() * worldColumns);
          y = Math.floor(Math.random() * worldColumns);
        }
        world[y][x] = 1; // mark the cell as a brick
    }

    //add border
        //right and left
    for(var x=0; x<worldColumns; x++){
        for(var y=0; y<worldRows; y+=worldColumns-1){
            world[x][y] = 0;
        }
    }
        //up and down
    var border = [];
    for(var x=0; x<worldColumns-1; x++){
        border.push(0);
    }
    
    border.splice(Math.floor(border.length/2),0,1); //create top and bottom tunnel
    world[Math.floor(worldRows/2)][0] = 1; //left tunnel 
    world[Math.floor(worldRows/2)][worldColumns-1] = 1; //right tunnel

    world.splice(0,0,border); //up border
    world.push(border);//down border
    
    world[cherryPosX][cherryPosY] = 3; //Cherry position
    world[pacmanObj[0].y][pacmanObj[0].x] = 1; //clear Pacman initial position
    world[pacmanObj[1].y][pacmanObj[1].x] = 1; //clear Pacman 2 initial position

    return world;
}

world = randomWorld();
worldColumns = world[0].length, worldRows = world.length; // world's dimension with border


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
    for(var i=0; i<pacmanObj.length; i++){
        pacmanObj[i]._class.style.left = pacmanObj[i].x*step + "px";
        pacmanObj[i]._class.style.top = pacmanObj[i].y*step + "px";    
    }
}

function ghostChase(){
    for(var ghost of ghostObj){
        var bestMove = 0, bestDistance = (worldColumns*worldRows)**2;

        for (var m of ghostMove) {
            var next = {
                x: ghost.x + m.dx,
                y: ghost.y + m.dy
            };
            
            if(next.y > worldRows-1 || next.y < 0 || world[next.y][next.x] == 0){
                continue;
            }

            for(pacman of pacmanObj) {
                var dist = Math.sqrt((next.x - pacman.x)**2 + (next.y - pacman.y)**2);
                if (dist < bestDistance) {
                    bestMove = m;
                    bestDistance = dist;
                }
            }
        }
        ghost.x += bestMove.dx;
        ghost.y += bestMove.dy;

        ghost._class.style.left = ghost.x*step + "px";
        ghost._class.style.top = ghost.y*step + "px"
    }
    
}

displayWorld();
displayPacman();
ghostChase();


function movePacman(e, p){
    //Left movement
    if((e.code === "ArrowLeft" || e.code == "KeyA")  && world[pacmanObj[p].y][pacmanObj[p].x-1] != 0) {
        pacmanObj[p]._class.style.backgroundImage = "url(imgs/pacman-l.gif)";
        if(pacmanObj[p].x == 0 && world[pacmanObj[p].y][worldColumns-1] != 0){
            pacmanObj[p].x = worldColumns - 1;
        }
        else if (pacmanObj[p].x > 0){
            pacmanObj[p].x -= 1;
        }
    }
    //Right movement
    else if((e.code === "ArrowRight" || e.code == "KeyD" ) && world[pacmanObj[p].y][pacmanObj[p].x+1] != 0) {
        pacmanObj[p]._class.style.backgroundImage = "url(imgs/pacman-r.gif)";
        if(pacmanObj[p].x == worldColumns-1 && world[pacmanObj[p].y][0] != 0){
            pacmanObj[p].x = 0;
        }
        else if (pacmanObj[p].x < worldColumns-1){
            pacmanObj[p].x += 1;
        }
    }
    //Up movement
    else if(e.code === "ArrowUp"  || e.code == "KeyW") {
        pacmanObj[p]._class.style.backgroundImage =  "url(imgs/pacman-u.gif)";
        if(pacmanObj[p].y == 0 && world[worldRows-1][pacmanObj[p].x] != 0){
            pacmanObj[p].y = worldRows-1;
        }
        else if(pacmanObj[p].y !=0 && world[pacmanObj[p].y-1][pacmanObj[p].x] != 0) {
            pacmanObj[p].y -= 1;
        }
    }
    //Down movement
    else if(e.code === "ArrowDown"  || e.code == "KeyS") {
        pacmanObj[p]._class.style.backgroundImage = "url(imgs/pacman-d.gif)";
        if(pacmanObj[p].y == worldRows-1 && world[0][pacmanObj[p].x] != 0){
            pacmanObj[p].y = 0;
        }
        else if(pacmanObj[p].y != worldRows-1 && world[pacmanObj[p].y+1][pacmanObj[p].x] != 0) {
            pacmanObj[p].y += 1;
        }
    }

            //check if Pacman ate coin and add 10 points
        if(world[pacmanObj[p].y][pacmanObj[p].x] == 2) {
            world[pacmanObj[p].y][pacmanObj[p].x] = 1;
            score +=coinPoint;
        }
        //check if Pacman ate cherry and add 50 points
        else if(world[pacmanObj[p].y][pacmanObj[p].x] == 3) {
            world[pacmanObj[p].y][pacmanObj[p].x] = 1;
            score +=cherryPoint;
        }

}

function keyDown(e, p){
    
    if(e.code === "ArrowDown" || e.code === "ArrowUp" || e.code === "ArrowRight"|| e.code === "ArrowLeft") {
        p = 0; //move left Pacman
    }
    else {
        p = 1; //move right Pacman
    }
    movePacman(e, p);
    
    displayPacman();
    displayWorld();
    displayScore();
}

document.addEventListener("keydown", keyDown);

function displayScore() {
    document.getElementById("score").innerText = score;
}

function gameOver(){
    // check if ghost caught Pacman 3 times
    for(ghost of ghostObj){
        for(pacman of pacmanObj){
            if(pacman.y == ghost.y && pacman.x == ghost.x){
                
                life -= 1;
                document.getElementById("lives").innerText = life;
                if(life > 0){
                    for(pacman of pacmanObj){
                        pacman.x = pacman.x_i;
                        pacman.y = pacman.y_i;
                    }

                    for(ghost of ghostObj){
                        ghost.x = ghost.x_i;
                        ghost.y = ghost.y_i
                    }
                }
                else{
                    for (var i=0; i<ghostAll.length; i++) {
                        ghostAll[i].parentNode.removeChild(ghostAll[i]);
                    }
                    for (var i=0; i<pacmanAll.length; i++) {
                        pacmanAll[i].parentNode.removeChild(pacmanAll[i]);
                    }
                    document.getElementById("finalText").innerText = "GAME OVER";
                    document.getElementById("lives").innerText = "0";
                    document.removeEventListener("keydown", keyDown);
                    clearInterval(intervalId);
                    clearInterval(gameOverChk);
                }       
                displayPacman();
            }
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
        while (ghostsClass.length > 0) {
            ghostsClass[0].parentNode.removeChild(ghostsClass[0]);
        }
        document.getElementById("finalText").innerText = "YOU WIN!";
        clearInterval(intervalId);
        clearInterval(gameOverChk);
    }
}

function gameLoop(){
    ghostChase();
}