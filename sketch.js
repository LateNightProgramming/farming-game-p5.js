class tile {
  constructor(sprite,state) {
    this.sprite = sprite;
    this.state = state;
  }
}

class animal {
  constructor(sprite,state) {
    this.sprite = sprite;
    this.state = state;
    this.hunger = 100;
  }
}

class gate { //one of the red messages
  constructor(Text,size) {
    this.message = Text; //text of message
    this.state = false; //if false it wont be shown, else it will
    this.size = size; //the font size of the text
  }
}

class mineTile {
  constructor(state,sprite) {
    this.state = state
    this.sprite = sprite
    this.level = 0;
  }
}

class achievement {
  constructor(textCol,col,txt) {
    this.textCol = textCol;
    this.col = col;
    this.txt = txt;
    this.unlocked = false;
  }
}

let tiles = [];
let animals = [];
let mines = [];
let particles = [];
let money = 9999999;
let playerLevel = 1;
let globalShift = 0; //variable that moves everything too the right and left with l/r controls
let moneyGain = 0;
const gates = [new gate("your too poor to buy discount land",25), new gate("you dont have enough money or land",22), new gate("you cant afford to buy food lmao",27), new gate("insufficient resources",30), new gate("to poor too buy a mine",25)];
const achievements = [new achievement("orange","red","M"), new achievement("green","blue","L")];

function preload() {
  grass = loadImage("grass.png");
  dirt = loadImage("dirt.png");
  rock = loadImage("rock.png");
  flower = loadImage("flower.png");
  cow = loadImage("cow.png");
  sheep = loadImage("sheep.png");
  coin = loadSound("coin.wav");
  song = loadSound("music.mp3");
  molten = loadImage("molten.png");
}

function planting() {
  "use strict";
  let changes;
  for (let i = 0; i < tiles.length; i++) {
    changes = ["grass","dirt","flower"][Math.floor(Math.random() * 3)];
    tiles[i].state = changes;
    switch (changes) {
      case "grass":
        tiles[i].sprite = grass;
        break;
      case "dirt":
        tiles[i].sprite = dirt;
        break;
      case "flower":
        tiles[i].sprite = flower;  
    }
  }
  moneyGain = calculateGain();
}

function buyAnimal() {
  "use strict";
  if (money >= 100 && animals.length < tiles.length) {
    const animalList = ["cow","sheep"]
    switch (animalList[Math.floor(Math.random() * 2)]) {
      case "cow":
        animals.push(new animal(cow,"cow"));
        break;
      case "sheep":
        animals.push(new animal(sheep,"sheep"));
        break;
    }
    money-=100;
    moneyGain = calculateGain();
  } else {
    openGate(1);
  }
}

function moneyGainAndHunger() { //gives the player money and subtracts all animals hunger var on a 1 second interval
  "use strict";
  if (moneyGain > 0) {
    money+=moneyGain;
    coin.play();
  }
  for (let i = 0; i < animals.length; i++) {
    animals[i].hunger--;
  }
  moneyGain = calculateGain();
}

function setup() {
  let globalVolume = 0.5; //volume of all sounds
  setAllVolumes(globalVolume);
  song.loop();
  setInterval(moneyGainAndHunger,1000);
  tiles.push(new tile(dirt,"dirt"));
  createCanvas(400, 400);
  let levelUpCost = 50;
  const plant = createButton("plant");
  plant.mousePressed(planting);
  const buyLandDiscount = createButton("buy land at a discount");
  buyLandDiscount.mousePressed(function(){buyLand("dirt",dirt,50)});
  const buyAnimalVar = createButton("buy an animal");
  buyAnimalVar.mousePressed(buyAnimal);
  const feedAnimals = createButton("feed your animals");
  feedAnimals.mousePressed(function(){
    "use strict";
    if (money >= 5) {
      for (let i = 0; i < animals.length; i++) {
        animals[i].hunger = 100;
      }
      money-=5;
    } else {
      openGate(2);    
    }
  });
  const buyMaccas = createButton("buy mcdonalds");
  buyMaccas.mousePressed(function() {
    "use strict";
    if (!achievements[0].unlocked && money >= 10000) {
      achievements[0].unlocked = true;
      money-=10000;
      playerLevel++;
      console.log("you bought maccas");
    }
  });
  const sellAnimalsVar = createButton("sell your animals");
  sellAnimalsVar.mousePressed(sellAnimals);
  const buyLandExpensive = createButton("buy land");
  buyLandExpensive.mousePressed(function(){buyLand("grass",grass,75)});
  const setVolumeVar = createButton("change volume");
  setVolumeVar.mousePressed(function(){globalVolume = changeVolume(globalVolume)});
  const levelUpVar = createButton("level up");
  levelUpVar.mousePressed(function(){levelUpCost = levelUp(levelUpCost)});
  const buyMineVar = createButton("buy a mine");
  buyMineVar.mousePressed(buyMine);
  const resizeVar = createButton("resize canvas");
  resizeVar.mousePressed(resize);
}

function sellAnimals() {
  "use strict";
  let count;
  while (true) {
    count = Number(prompt("input the amount to sell"));
    if (isNaN(count) || count > animals.length || animals < 0) {
      console.log("invalid response")
    } else {
      for (let i = 0; i < count; i++) {
        animals.pop();
      }
      moneyGain = calculateGain();
      break;
    }
  }
}

function resize() {
  let inp;
  while (true) {
    inp = Number(prompt("input a value"));
    if (isNaN(inp) || inp < 1) {
      console.log("invalid response");
    } else {
      resizeCanvas(inp,400);
      break;
    }
  }
}

function buyLand(state,sprite,cost) {
  "use strict";
  if (money >= cost) {
    tiles.push(new tile(sprite,state));
    if (tiles.length === 4) {
      achievements[1].unlocked = true;
    }
    money-=cost;
    console.log("you bought cheap land");
  } else {
    console.log("poor");
    openGate(0);
  }
}

function buyMine() {
  "use strict";
  const states = ["standard","molten"];
  const sprites = [rock,molten];
  if (money > 1500 && tiles.length >= 5) {
    mines.push(new mineTile(states[Math.floor(Math.random() * 2)],sprites[Math.floor(Math.random() * 2)]));
    money -= 1500;
    console.log("you bought a mine");
    for (let i = 0; i < 5; i++) {
      tiles.pop();
    }
  } else {
    openGate(4);
  }
}

function draw() {
  background("grey");
  for (let i = 0; i < (width - 300) / 100; i++) { //start particle system
        append(particles, [round(random(0, width)), -10, round(random(1, 6)), round(random(3, 6)), Math.floor(Math.random() * 10)]);
  }
  for (let i = 1; i < particles.length; i++) {
    if (particles[i - 1][4] > 4) {
        particles[i - 1][0] += particles[i - 1][2];
    } else if (particles[i - 1][4] <= 4) {
        particles[i - 1][0] -= particles[i - 1][2];
    }
    particles[i - 1][1] += particles[i - 1][3];
    fill(225, 225, 225, 50);
    noStroke();
    circle(particles[i - 1][0], particles[i - 1][1], 10);
    if (particles[i - 1][1] > height + 10) {
        particles.splice(i - 1, 1);
    }
  } //end particle system
  //draw tiles
  for (let i = 0; i < tiles.length; i++) {
    image(tiles[i].sprite,100*i+globalShift,0,100,100);
  }
  //draw money and player level
  push();
    fill("gold");
    textSize(35);
    text(money,15,35);
    fill("green");
    text(playerLevel,15,65);
  pop();
  //draw messages
  push();
    fill("red");
    for (let i = 0, z = 0; i < gates.length; i++) {
      if (gates[i].state) {
        textSize(gates[i].size);
        text(gates[i].message,5,380-z*15);
        z++;
      }
    }
  pop();
  //draw animals
  for (let i = 0; i < animals.length; i++) {
    image(animals[i].sprite,(i*100+50)+globalShift, 50,25,25);
  }
  //draw achievements
  push();
    textSize(25)
    for (let i = 0; i < achievements.length; i++) {
      if (achievements[i].unlocked) {
        fill(achievements[i].col);
        square(7.5*(i+1)+45,300,45);
        fill(achievements[i].textCol);
        text(achievements[i].txt,20*(i+1),329.5);
      } else {
        fill("black");
        square(7.5*(i+1),300,45);
      }
    }
  pop();
  //draw mine tiles
  for (let i = 0; i < mines.length; i++) {
    image(mines[i].sprite,i*100+globalShift,100,100,100);
  }
}

function openGate(id) { //displays red message for 1 second
  "use strict";
  gates[id].state = true;
  setTimeout(function(){gates[id].state = false},1000);
}

function setAllVolumes(volume) { //changes all volumes to equal var volume (only a function as it's also used at the start in setup(){})
  "use strict";
  coin.setVolume(volume);
  song.setVolume(volume);
}

function changeVolume(globalVolume) {
  "use strict";
  let volume;
  while (true) {
    volume = Number(prompt("change volume (current volume = " + String(globalVolume*100) + ")"));
    if (isNaN(volume) || volume > 100 || volume < 0) {
      console.log("invalid response");
    } else {
      if (volume === 0) { //deals with divided by 0 error
        setAllVolumes(0);
      } else {
        setAllVolumes(volume/100);
      }
      break;
    }
  }
  return volume/100;
}

function calculateGain() {
  "use strict";
  function minesAndTiles(arr,case1,case2,plus,calculation) { //handles the calculations for mines and tiles. arr = array of things, case1/2 = the text of state, plus = amount calculation is added by in second case, calculation = current amount
    for (let i = 0; i < arr.length; i++) {
      switch(arr[i].state) {
        case case1: //state name (i.e "standard")
          calculation++;
          break;
        case case2: //state name (i.e flower)
          calculation+=plus;
          break;
      }
    }
    return calculation;
  }
  let calculation = minesAndTiles(tiles,"grass","flower",3,0); //defines variable and calls function for tiles
  for (let i = 0; i < animals.length; i++) { //checks state of all animals
    if (animals[i].hunger > 0) {
      switch (animals[i].state) {
        case "cow":
          calculation++;
          break;
        case "sheep":
          calculation+=2;
          break;
      }
    }
  }
  return minesAndTiles(mines,"standard","molten",10,calculation) + (playerLevel - 1); // returns calcuation after minesandtiles i called for mines
}

function keyPressed() {
  "use strict";
  if (keyCode === LEFT_ARROW) { //moves everything to the left
    globalShift-=5;
  } else if (keyCode === RIGHT_ARROW) { //moves everything to the right
    globalShift+=5;
  }
}

function levelUp(levelUpCost) {
  "use strict";
  if (money > levelUpCost && tiles.length > 4 && animals.length > 4) {
    playerLevel++;
    return Math.floor(levelUpCost * 1.3);
  } else {
    openGate(3);
  }
}
