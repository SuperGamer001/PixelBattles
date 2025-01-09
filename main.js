class World{
    constructor(){
        this.x = 0;
        this.y = 0;
        this.gravity = 0.5;
        this.terrain = [];
        this.entities = [];
        this.backdrops = [];
        this.isMultiplayer = false;
        this.skyColor = 'skyblue';
        this.html = document.createElement('div');
        this.camFocus = null
        this.cloudOffset = 0
        this.dayCycle = {minute: 0, hour: 22, time: 'morning'} // Lightlevel 1 = day (100%), 0 = night (0%)

        this.update = function(){
            this.cloudOffset += 0.3

            this.updateCamera(this.camFocus)
            for(let i = 0; i < this.backdrops.length; i++){
                this.backdrops[i].html.style.left = this.backdrops[i].x + 'px';
            }
        }

        this.updateCamera = function(focus){
            if(!focus){
                this.camFocus = Me
            }
            if(this.html && focus){
                this.html.style.left = -(focus.x - (innerWidth / 2) + (focus.size / 2)) + "px";
                this.html.style.top = -(focus.y - (innerHeight / 2) + (focus.size / 2)) + "px";
                if(focus.inRoom){
                    document.body.classList.add('room');
                    var darkness = document.getElementById('darkness');
                    darkness.style.display = 'block';
                    darkness.style.left = this.html.style.left * -1;
                    darkness.style.top = this.html.style.top * -1;
                }
                else{
                    document.body.classList.remove('room');
                    var darkness = document.getElementById('darkness');
                    darkness.style.display = 'none';
                }
            }
            this.html.style.background = this.skyColor;
            this.html.style.background = this.skyColor;
            document.body.style.background = this.skyColor;
        }

        this.setUp = function(){
            this.html.classList.add('world');
            this.html.style.overflow = 'visible';
            this.html.style.width = '0%';
            this.html.style.height = '0%';
            this.html.style.left = '0px';
            this.html.style.top = '0px';
            this.html.style.background = this.skyColor;
            document.body.appendChild(this.html);
        }

        this.setUp();
    }
}

class Player{
    constructor(x = 0, y = 0, playType = 'cpu', character = 'alex'){
        // Stats
        this.health = 100;
        this.maxHealth = 100;
        this.stamina = 100;
        this.maxStamina = 100;
        this.cooldown = 0;
        this.alive = true;
        this.playing = false;
        this.effect = "none";
        this.effectDuration = 0;

        // Capabilities
        this.attack = 10;
        this.attackSpeed = 10;
        this.defense = 10;
        this.speed = 10;
        this.jumpSpeed = 12;

        // Others
        this.onGround = false;
        Game.entities[Game.entities.length] = this;
        this.playType = playType;
        this.inRoom = false;

        // Inventory/Wallet
        this.xp = 0;
        this.nextLevel_XP = 100;
        this.level = 1;
        this.gold = 0;
        this.inventory = [];
        this.maxInventory = 25;
        this.equipped = [];

        // Position and Movement
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.x = x * 100;
        this.y = y * 100;
        this.size = 100;
        this.step = 0;

        // Character
        this.name = 'Player';
        this.character = character;
        this.teamColor = 'black';
        this.html = document.createElement('div');

        // CPU Information
        this.plan = 'none';
        this.planTime = 0;
        this.target = null;
        this.targetRecord = {}
        this.path = [];
        this.searchDirection = "none";

        this.left = function() {
            this.xVelocity = -this.speed;
        }
        this.right = function() {
            this.xVelocity = this.speed;
        }
        this.jump = function() {
            if(this.onGround){
                this.yVelocity = -this.jumpSpeed * 1.2;
            }
        }


        this.attack = function() {
            if(this.cooldown == 0){
                this.cooldown = this.attackSpeed * 1.3;
                this.html.style.background = 'url("lib/textures/players/'+this.character+'/attack.png")';
                this.html.style.backgroundSize = '100% 100%';
            }
        }
        this.update = function(){
            if(this.playing){
                this.x += this.xVelocity;
                this.y += this.yVelocity;
                this.yVelocity += Game.gravity;
                this.html.style.left = this.x + 'px';
                this.html.style.top = this.y + 'px';
                this.html.style.width = this.size + 'px';
                this.html.style.height = this.size + 'px';

                
                
                for(let i = 0; i < Game.terrain.length; i++){
                    if(this.checkCollision(Game.terrain[i])){
                        this.y = Game.terrain[i].y - this.size + 1;
                        this.yVelocity = 0;
                        this.onGround = true;
                        break
                    }
                    else{
                        this.onGround = false;
                    }
                }
                if(this.cooldown >= 5){
                    this.html.style.background = 'url("lib/textures/players/'+this.character+'/attack.png")';
                    this.html.style.backgroundSize = '100% 100%';
                }
                else if(!this.onGround){
                    this.html.style.background = 'url("lib/textures/players/'+this.character+'/jump.png")';
                    this.html.style.backgroundSize = '100% 100%';
                }
                else if(this.xVelocity != 0){
                    this.step += 1
                    if(this.step > 10){
                        this.step = 0
                    }

                    if(this.step < 5){
                        this.html.style.background = 'url("lib/textures/players/'+this.character+'/walk.png")';
                        this.html.style.backgroundSize = '100% 100%';
                    }
                    else{
                        this.html.style.background = 'url("lib/textures/players/'+this.character+'/idle.png")';
                        this.html.style.backgroundSize = '100% 100%';
                    }
                }
                else{
                    this.html.style.background = 'url("lib/textures/players/'+this.character+'/idle.png")';
                    this.html.style.backgroundSize = '100% 100%';
                    this.step = 0;
                }
                if(this.y > 1500){
                    this.alive = false;

                    Game.entities.splice(Game.entities.indexOf(this), 1);
                    this.html.remove();
                    this.alive = false;
                }
                if(this.cooldown > 0){
                    this.cooldown -= 1 
                }
                if(this.onGround){
                    if(this.xVelocity <= 0.02 && this.xVelocity >= -0.02){
                        this.xVelocity = 0;
                    }
                    else if(this.xVelocity > 0){
                        this.xVelocity -= 0.5;
                    }
                    else if(this.xVelocity < 0){
                        this.xVelocity += 0.5;
                    }
                }
                for (let i = 0; i < Game.terrain.length; i++) {
                    const terrain = Game.terrain[i];
                    if(terrain.html.classList.contains('room')){
                        if(this.x + this.size > terrain.x && this.x < terrain.x + terrain.width && this.y + this.size > terrain.y && this.y < terrain.y + terrain.height && this.y + this.size - 1 > terrain.y){
                            this.inRoom = true;
                            this.html.classList.add('room');
                            break
                        }
                        else{
                            this.inRoom = false;
                            this.html.classList.remove('room');
                        }
                    }
                }
                if(this.effectDuration > 0){
                    this.effectDuration -= 1
                    this.html.classList.add(this.effect);
                }
                else{
                    this.html.classList.remove(this.effect);
                }

                if(this.playType == 'cpu'){
                    //Make a plan
                    if(this.plan == 'none'){
                        let newPlan = parseInt(Math.random() * 10);
                        if(newPlan == 0){
                            this.plan = 'stalk on enemies'
                        }
                        else if(newPlan == 1){
                            this.plan = 'stalk up on items'
                        }
                        else if(newPlan == 2){
                            this.plan = 'attack'
                        }
                        else if(newPlan == 3){
                            this.plan = 'run'
                        }
                        this.plan = 'attack'
                    }

                    // If the plan is to attack, attack or plan attack on the targeted player
                    if(this.plan.includes('attack')){
                        //Search for nearby enemies
                        if(this.target == null){
                            for(let i = 0; i < Game.entities.length; i++){
                                if(Game.entities[i].alive && Game.entities[i] != this && this.getDistance(Game.entities[i]) < 1500){
                                    this.target = Game.entities[i];
                                    break
                                }
                            }
                        }
                        
                        if(this.target != null){

                            //If this player is close enough to the target, attack or dodge.
                            if(this.getDistance(this.target) < 150){
                                //Keep gard up if the target is targeting the player
                                if(this.target.target == this){
                                    //If the target's cooldown is 0, watch for attacks
                                    if(this.target.cooldown == 0){
                                        //If the target is movineg towards the player, quickly move back or jump away.
                                        if((this.x > this.target.x && this.target.xVelocity > 0)){
                                            //Make a decision for the dodge plan
                                            var decision = parseInt(Math.random() * 50);
                                            if(decision >= 0 && decision <= 40){
                                                this.right();
                                            }
                                            else{
                                                this.left();
                                                this.jump();
                                            }
                                        }
                                        else if(this.x < this.target.x ){
                                            //Make a decision for the dodge plan
                                            var decision = parseInt(Math.random() * 50);
                                            if(decision >= 0 && decision <= 40){
                                                this.left();
                                            }
                                            else{
                                                this.right();
                                                this.jump();
                                            }
                                        }
                                    }
                                }
                            }
                            //If the target is way too far away to watch, stop the attack plan
                            else if(this.getDistance(this.target) >= 1500){
                                this.plan = 'none';
                                this.target = null;
                            }

                            // If this player is not close enough to the target, strategies to move towards it.
                            else{

                                // If the target is above or below this player, but won't be close to attack when the player jumps, make an attack plan
                                if(Math.abs(this.x - this.target.x) < 120 && Math.abs(this.y - this.target.y) > 210 && this.plan == 'attack'){
                                    //Make a decision for the new attack plan
                                    var decision = parseInt(Math.random() * 3);
                                    if(decision == 0){
                                        this.plan = 'attack - Find a Workaround';
                                    }
                                    else if(decision == 1){
                                        this.plan = 'attack - Watch the Target';
                                    }
                                    else if(decision == 2){
                                        this.plan = 'none';
                                    }
                                }

                                // Move according to the attack plan

                                // Find a way to reach the target
                                if(this.plan == 'attack - Watch the Target' || this.plan == 'attack - Find a Workaround'){
                                    let changeOfPlan = false
                                    // Search for a place to jump
                                    for(let i = 0; i < Game.terrain.length; i++){
                                        // Try to jump on the terrain
                                        //If the terrain is currently above the player, and the jump height is high enough, jump onto the platform.
                                        if(Game.terrain[i].y > this.target.y && Game.terrain[i].y < this.y && Game.terrain[i].y > this.y - 210 && Math.abs(this.x - Game.terrain[i].x) < 1500){
                                            if(this.x > Game.terrain[i].x && this.onGround){
                                                this.left();
                                                this.html.style.transform = 'rotateY(180deg)';
                                            }
                                            else if(this.x < Game.terrain[i].x  + Game.terrain[i].width && this.onGround){
                                                this.right();
                                                this.html.style.transform = 'rotateY(0deg)';
                                            }
                                            if(this.getDistance(Game.terrain[i]) < 950){
                                                this.jump();
                                            }
                                            changeOfPlan = true
                                        }
                                        //If the player is close enough to the target, head to the target and attack.
                                        if(Math.abs(this.y - this.target.y) <= 25 && this.onGround && this.target.onGround){
                                            changeOfPlan = true
                                            this.plan = 'attack'
                                        }
                                    }
                                    if(this.plan == 'attack - Watch the Target'){
                                        // If the player isn't heading to a platform to jump on, stalk the target.
                                        if(!changeOfPlan && Math.abs(this.x - this.target.x) > 50){
                                            if(this.target.x < this.x){
                                                if(this.onGround){
                                                    this.left();
                                                }
                                                this.html.style.transform = 'rotateY(180deg)';
                                            }
                                            else{
                                                if(this.onGround){
                                                    this.right();
                                                }
                                                this.html.style.transform = 'rotateY(0deg)';
                                            }
                                        }
                                    }
                                    else if(this.plan == 'attack - Find a Workaround'){
                                        // If the player isn't heading to a platform to jump on, search for a way to reach the target while also watching the target.

                                        //If the target is getting too far away, follow the target.
                                        if(!changeOfPlan && Math.abs(this.x - this.target.x) > 700){
                                            if(this.target.x < this.x){
                                                if(this.onGround){
                                                    this.left();
                                                }
                                                this.searchDirection = 'left';
                                                this.html.style.transform = 'rotateY(180deg)';
                                            }
                                            else{
                                                if(this.onGround){
                                                    this.right();
                                                }
                                                this.searchDirection = 'right';
                                                this.html.style.transform = 'rotateY(0deg)';
                                            }
                                        }
                                        else if(!changeOfPlan){
                                            // If the player isn't heading to a platform to jump on, search for a way to reach the target.
                                            if(this.searchDirection == "none"){
                                                let direction = parseInt(Math.random() * 2);
                                                if(direction == 0){
                                                    this.searchDirection = 'left';
                                                }
                                                else{
                                                    this.searchDirection = 'right';
                                                }
                                            }
                                            if(this.searchDirection == 'left'){
                                                if(this.onGround){
                                                    this.left();
                                                }
                                                this.html.style.transform = 'rotateY(180deg)';
                                            }
                                            else{
                                                if(this.onGround){
                                                    this.right();
                                                }
                                                this.html.style.transform = 'rotateY(0deg)';
                                            }
                                        }
                                    }
                                }
                                else{
                                    if(Math.abs(this.x - this.target.x) > 120){
                                        // If the target is to the left of this player, move left
                                        if(this.target.x < this.x){
                                            if(this.onGround){
                                                this.left();
                                            }
                                            this.html.style.transform = 'rotateY(180deg)';
                                        }
                                        // If the target is to the right of this player, move right
                                        else{
                                            if(this.onGround){
                                                this.right();
                                            }
                                            this.html.style.transform = 'rotateY(0deg)';
                                        }
                                    }

                                    // If the target would be low enough to the player, jump
                                    if(this.target.y < this.y && Math.abs(this.target.x - this.x) <= 210){
                                        this.jump();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.setEffect = function(effect, duration = 5000){
            this.effect = effect;
            this.effectDuration = duration;
        }

        this.getDistance = function(entity){
            // Get the hypotenuse of a right triangle
            return Math.sqrt(Math.abs(this.x - entity.x) ** 2 + Math.abs(this.y - entity.y) ** 2);
        }
        this.getDirection = function(entity){
            if(entity instanceof Player){
                if(entity.html.style.transform == 'rotateY(180deg)'){
                    return 'left';
                }
                else{
                    return 'right';
                }
            }
        }
        
        this.findWorkAround = function(entity){
            let direction = this.getDirection(entity);
            if(this.path == []){
                //Search for an available path, above and below to reach the target

                //Make sure that the player and target are not too far apart
                if(this.getDistance(entity) > 1500){
                   if(this.x < entity.x){
                       this.right();
                       this.html.style.transform = 'rotateY(0deg)';
                   }
                   else if(this.x > entity.x){
                       this.left();
                       this.html.style.transform = 'rotateY(180deg)';
                   }
                }
                // If this player hasn't found a path yet, search for one
                else if(this.path == []){
                    
                }

                // if(entity.y < this.y){
                //     //Search for a place to jump
                //     for(let i = 0; i < Game.terrain.length; i++){
                //         // Try to jump on the terrain
                //         if(Game.terrain[i].y < this.y && Game.terrain[i].y > this.y - 210 && this.getDistance(Game.terrain[i]) < 250){
                //             if(this.x > Game.terrain[i].x + Game.terrain[i].width && this.onGround){
                //                 this.left();
                //                 this.html.style.transform = 'rotateY(180deg)';
                //             }
                //             else if(this.x > Game.terrain[i].x && this.onGround){
                //                 this.right();
                //                 this.html.style.transform = 'rotateY(0deg)';
                //             }
                //             this.jump();
                //         }
                //     }
                // }
                // else if(entity.y > this.y){
                //     for(let i = 0; i < Game.terrain.length; i++){
                //         if(Game.terrain[i].y < this.y && Game.terrain[i].y > this.y - 210 && this.getDistance(Game.terrain[i]) < 250){
                //             if(this.x > Game.terrain[i].x + Game.terrain[i].width && this.onGround){
                //                 this.left();
                //                 this.html.style.transform = 'rotateY(180deg)';
                //             }
                //             else if(this.x > Game.terrain[i].x && this.onGround){
                //                 this.right();
                //                 this.html.style.transform = 'rotateY(0deg)';
                //             }
                //             this.jump();
                //         }
                //     }
                // }
            }
        }
        this.checkCollision = function(entity){
            if (this.yVelocity >= 0 && this.x + this.size > entity.x && this.x < entity.x + entity.width && this.y + this.size - 2 <= entity.y && this.y + this.size + (this.yVelocity) >= entity.y) {
                return true
            }
            
        }

        this.play = function(){
            this.html.classList.add('player');
            this.html.style.left = this.x + 'px';
            this.html.style.top = this.y + 'px';
            this.html.style.width = this.size + 'px';
            this.html.style.height = this.size + 'px';
            this.html.style.background = 'url("lib/textures/players/'+this.character+'/idle.png")';
            this.html.style.backgroundSize = '100% 100%';
            document.getElementsByClassName('world')[0].appendChild(this.html);
            this.playing = true;
        }


        this.play();
    }
}

class Terrain{
    constructor(x, y, width, height, material, wallType = 'normal'){
        this.x = x * 100;
        this.y = y * 100;
        this.width = width * 100;
        this.height = height * 100;
        this.material = material;
        this.wallType = wallType;
        Game.terrain[Game.terrain.length] = this;
        this.html = document.createElement('div');
        this.html.classList.add('terrain');
        this.html.style.left = this.x + 'px';
        this.html.style.top = this.y + 'px';
        this.html.style.width = this.width + 'px';
        this.html.style.height = this.height + 'px';
        this.html.style.background = 'url("lib/textures/block/'+this.material+'(top).png") repeat-x,url("lib/textures/block/'+this.material+'.png")';
        this.html.style.backgroundSize = '100px 100px';
        document.getElementsByClassName('world')[0].appendChild(this.html);
        this.html.classList.add(wallType);

        if(wallType == 'room' || wallType == 'cover'){
            this.html.style.zIndex = 999999999999;
        }

        this.update = function(){
            if(this.playing){
                this.html.style.left = this.x + 'px';
                this.html.style.top = this.y + 'px';
                this.html.style.width = this.width + 'px';
                this.html.style.height = this.height + 'px';
            }
        }
    }
}

class BackDrop{
    constructor(height, distance, img, color){
        this.x = 0;
        this.y = 0;
        this.height = height;
        this.distance = distance;
        this.html = document.createElement('div');
        this.html.style.left = 0
        this.html.style.top = 0
        this.html.style.width = "100vw";
        this.html.style.height = "200px"
        // this.html.style.background = 'url("'+img+'") repeat-x';
        // this.html.style.background = 'rgb(0,20,0)';
        this.html.style.background = img;

        this.html.style.backgroundSize = '200px';
        this.html.style.backgroundRepeat = 'repeat-x';
        this.html.style.backgroundBlendMode = 'normal';
        this.html.style.zIndex = -999999 - (this.distance * 100);
        document.getElementsByClassName('world')[0].appendChild(this.html);
        this.html.classList.add('backdrop');
        Game.backdrops[Game.backdrops.length] = this;
        this.html.style.overflow = 'visible';

        if(img == 'clouds'){
            this.html.style.height = '200vh'
            this.html.style.backgroundBlendMode = 'normal';
            this.html.style.background = 'url("lib/textures/backdrops/clouds_'+color+'.png")';
            this.html.style.backgroundSize = '1000px';
            this.html.style.zIndex = -99999999 - (this.distance * 100);
            document.getElementsByClassName('world')[0].appendChild(this.html);
            this.html.classList.add('backdrop');
            Game.backdrops[Game.backdrops.length] = this;
            this.html.style.overflow = 'visible';
        }
        else{
            this.color = document.createElement('div');
            this.color.style.width = "100vw";
            this.color.style.height = "1000vh"
            this.color.style.top = "200px"
            this.color.style.background = color;
            this.html.appendChild(this.color);
            // this.color.classList.add('backdrop');
        }


        

        this.update = function() {
            const gameStyle = Game.html.style;
            const distanceFactor = this.distance * -1;
            
            this.x = -parseFloat(gameStyle.left);
            this.y = (parseFloat(gameStyle.top) / (this.distance * 3)) + this.height;
            
            const thisStyle = this.html.style;
            thisStyle.left = `${this.x}px`;
            thisStyle.top = `${this.y}px`;
            if(img == 'clouds'){
                thisStyle.backgroundPositionX = `${(this.x / this.distance) * -1 + Game.cloudOffset}px`;
            }
            else{
                thisStyle.backgroundPositionX = `${(this.x / this.distance) * -1}px`;
            }
        }
        
    }
}


// Start the Game
let Game = new World();

// Create the world
new Terrain(0, 6, 6, 10, 'dirt');
new Terrain(4, 8, 80, 8, 'dirt');

new Terrain(1, 10, 25, 2, 'stone');
new Terrain(13, 6, 8, 2, 'stone', 'inRoom');

new Terrain(8, 4, 20, 4, 'bricks', 'room');
new Terrain(10, 2, 16, 2, 'bricks');
new Terrain(12, 0, 12, 2, 'bricks');


new BackDrop(-100, 10, 'clouds', '1');
new BackDrop(300, 7, 'url("lib/textures/backdrops/grassHill_1.png")', '#085800');
new BackDrop(400, 5, 'url("lib/textures/backdrops/grassHill_2.png")', '#064200');
new BackDrop(540, 4, 'url("lib/textures/backdrops/grassHill_1.png")', '#085800');
new BackDrop(600, 3, 'url("lib/textures/backdrops/grassHill_2.png")', '#064200');


// Create the players
let Me = new Player(3, 5, 'player');
let num_CUP = 1

let CPU = [
    
];
for(let i = 0; i < num_CUP; i++){
    CPU[i] = new Player(20, 3)
}

// Game.camFocus = CPU[0];


// setTimeout(() => {
//     CPU[0].setEffect('poison')
// }, 1000);

let keyState = {};

function statsForNerds(toggle){
    let statsElement = document.getElementById('stats');
    if (statsElement){
        statsElement.style.display = toggle ? 'block' : 'none';
        stats.toggle = toggle;
    }
}

let stats = {
    toggle: false,
    fps: 0
}


statsForNerds(true);

setInterval(() => { 
    if (stats.toggle){
        let statsElement = document.getElementById('stats');
        if (statsElement){
            statsElement.innerHTML = `Stats for nerds <br> FPS: ${stats.fps}<br>Time of day: ${Game.dayCycle.time}<br>Time: ${parseInt(Game.dayCycle.hour)}:${parseInt(Game.dayCycle.minute)}`; 
            stats.fps = 0; 
        } 
    } 
}, 1000);

window.addEventListener('keydown', function(e){
    keyState[e.key] = true;
});
window.addEventListener('keyup', function(e){
    keyState[e.key] = false;
});

function updatePlayerMovement() {
    if (Me.playing) {
      if (keyState['Shift']) {
        console.log('Weapon change');
      }
      if (keyState['a'] || keyState['A'] || keyState['ArrowLeft']) {
        if (Me.onGround) {
          Me.left();
        }
        Me.html.style.transform = 'rotateY(180deg)';
      }
      if (keyState['d'] || keyState['D'] || keyState['ArrowRight']) {
        if (Me.onGround) {
          Me.right();
        }
        Me.html.style.transform = 'rotateY(0deg)';
      }
      if (keyState['w'] || keyState['W'] || keyState['ArrowUp']) {
        Me.jump();
      }
      if (keyState[' ']) {
        Me.attack();
      }
    }
  }
  
  function updateGameEntities() {
    for (let i = 0; i < Game.entities.length; i++) {
      Game.entities[i].update();
    }
  }
  
  function updateTerrain() {
    for (let i = 0; i < Game.terrain.length; i++) {
      Game.terrain[i].update();
    }
  }
  
  function updateBackdrops() {
    for (let i = 0; i < Game.backdrops.length; i++) {
      Game.backdrops[i].update();
    }
  }
  
  let frameCounter = 0;
  
  function animate() {
      frameCounter++;

      
      // Only update every nth frame to lower the frame rate
      if (frameCounter % 2 === 0) {
          stats.fps++;
          updatePlayerMovement();
          updateGameEntities();
          updateTerrain();

          Game.update();
          updateBackdrops();
      }
      
      requestAnimationFrame(animate);
  }
  
  animate();
  