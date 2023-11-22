let noiseX;
let noiseY;
let noiseParam = 0;
let noiseStep = 0.1;

let W = 500;
let H = 200;
let margin = 10;
let C = 1;

let cardX, cardY;
let holdX, holdY;
let mouseX_hold, mouseY_hold;
let dragging = false;
let justSwitched = false;

let inCorner = false;
let corner = -1;

let scroll = 0;

let three_d_links = ['assets/3d/boat.JPG', 'assets/3d/forYou.jpg', 'assets/3d/soundbox.jpg', 'assets/3d/walkInTheForest.JPG', 'assets/3d/thisBox.jpg', 'assets/3d/waves.jpg'];
let two_d_links = ['assets/2d/qqq.PNG', 'assets/2d/cabinetDoor.PNG', 'assets/2d/twoCabinets.PNG', 'assets/2d/minimalistKitchen.JPG', 'assets/2d/chrisBoard.jpg'];
let electronic_links = ['assets/electronic/noisySquares.png', 'assets/electronic/chimes.gif', 'assets/electronic/circuit.png', 'assets/electronic/selfPortrait.jpg', 'assets/electronic/scales.png'];

let three_d = [];
let two_d = [];
let electronic = [];

function preload() {
  for (let i = 0; i < three_d_links.length; i++) {
    three_d[i] = makeImg(loadImage(three_d_links[i]), '', 200, 200);
  } for (let i = 0; i < two_d_links.length; i++) {
    two_d[i] = makeImg(loadImage(two_d_links[i]), '', 200, 200);
  } for (let i = 0; i < electronic_links.length; i++) {
    electronic[i] = makeImg(loadImage(electronic_links[i]), '', 200, 200);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  rectMode(CENTER);
  textFont('monospace');
  frameRate(60);

  noiseX = random(1000);
  noiseY = random(1000);

  cardX = width/2;
  cardY = height/2;

}

function draw() {

  rectMode(CENTER);
  background(255 * int(!C));

  let noiseZ = map(mouseY, 0, height, 0, 1000 * 0.05) + noiseParam;

  stroke('white');
  noFill();
  
  let X = cardX;
  let Y = cardY;

  drawCard(X, Y, W, H, margin, C);

  if (mouseIsPressed && dragging) {

    dx = mouseX - mouseX_hold;
    dy = mouseY - mouseY_hold;

    cardX = holdX + dx;
    cardY = holdY + dy;

    cardX = constrain(cardX, W/2 + margin, width - W/2 - margin);
    cardY = constrain(cardY, H/2 + margin, height - H/2 - margin);
  }

  if (cardX - W/2 - margin <= 0 && cardY - H/2 - margin <= 0){
    inCorner = true;
    corner = 0;
  } else if (cardX + W/2 + margin >= width && cardY - H/2 - margin <= 0) {
    inCorner = true;
    corner = 1;
  } else if (cardX + W/2 + margin >= width && cardY + H/2 + margin >= height){
    inCorner = true;
    corner = 2;
  } else if (cardX - W/2 - margin <= 0 && cardY + H/2 + margin >= height){
    inCorner = true;
    corner = 3;
  } else {
    inCorner = false;
    corner = -1;
  }

  let x = cardX;
  let y = cardY;

  if (inCorner) {
    C = 0;

    stroke(255 * C);
    line(x - W/2 - margin, y - H/2 - margin, x - W/2 - margin, 0);
    line(x - W/2 - margin, y - H/2 - margin, 0, y - H/2 - margin);

    line(x + W/2 + margin, y - H/2 - margin, x + W/2 + margin, 0);
    line(x + W/2 + margin, y - H/2 - margin, width, y - H/2 - margin);

    line(x + W/2 + margin, y + H/2 + margin, x + W/2 + margin, height);
    line(x + W/2 + margin, y + H/2 + margin, width, y + H/2 + margin);

    line(x - W/2 - margin, y + H/2 + margin, x - W/2 - margin, height);
    line(x - W/2 - margin, y + H/2 + margin, 0, y + H/2 + margin);
  } else {
    C = 1;

    stroke(255 * C);
    line(x - W/2 - margin, y - H/2 - margin, 0, 0);
    line(x + W/2 + margin, y - H/2 - margin, width, 0);
    line(x + W/2 + margin, y + H/2 + margin, width, height);
    line(x - W/2 - margin, y + H/2 + margin, 0, height);
  }

  switch (corner){
    case (0): // top left --> about
      about();
      break;
    case (1): // top right --> art
      art();
      break;
    case (2): // bottom right --> design
      design();
      break;
    case (3): // bottom left --> research? engineering? 
      work();
      break;
    default:
      break;
  }

}

function drawCard(x, y, w, h, margin, c) {

  stroke(255*c);
  rect(x, y, w + 2*margin, h + 2*margin);
  pixelCurve(x+50, y, w-100, h, noiseParam, 5, c);

  noiseParam += noiseStep;


  fill(255 * c);
  noStroke();
  textSize(80);

  push();
    translate(x - w/2 + 4.5*margin, y + h/2)
    rotate(-90);

    text('yon', 0, 0);

    textSize(30);
    push();
      scale(1.1, 1);
      text('m a o r', 0, 45);
    pop();

  pop();

  push();
    translate(x - w/2 - margin/2, y - h/2 + margin);
    scale(0.9, 1);
    textSize(16);
    text("art", 0, 0);
    text("engineering", 0, 0 + 18);
    text("propaganda", 0, 0 + 2*18);
  pop();

}

function pixelCurve(x, y, w, h, noiseParam, d, c){
  draw_grid(x, y, w, h, d, c);
  removeCrossSection(x, y, w, h, noiseParam, d, c);
}

function removeCrossSection(sx, sy, w, h, noiseZ, d, c){

  // erase(0, 80);
  push();
  translate(sx - w/2, sy - h/2);

  for (let k = 0; k < 1000; k++) {

      let p = noiseZ;

      let x = map(noise(noiseX, k * 0.005, p * 0.011), 0, 1, -w * 0.75, w * 1.75);
      let y = map(noise(noiseY, k * 0.005, p * 0.0113), 0, 1, -h * 0.75, h * 1.75);
      
      // x = constrain(x, 0, width);
      // y = constrain(y, 0, height);

      x = floor(x / d);
      y = floor(y / d);

      if (0 <= x*d && x*d <= w && 0 <= y*d && y*d <= h){
        fill(255 * int(!c));
        stroke(255 * int(!c));
        rect(x * d, y * d, d);
      }

      // stroke('white');
      // draw_x(x * W, y * W, W-4);
    
  }

  pop();
  
  // noErase();
}

function draw_grid(sx, sy, w, h, d, c) {
  push();
  translate(sx - w/2, sy - h/2);

  noFill();
  stroke(255 * c);
  for (let i = 0; i <= w/d; i++){
    for (let j = 0; j <= h/d; j++){
      rect(i * d, j * d, d - 4);
    }
  }

  pop();
}

function draw_x(x, y, w){
  push();
  translate(x - w/2, y - w/2);
  line(0, 0, w, w);
  line(0, w, w, 0);
  pop();
}

function mousePressed() {

  if (cardX - W/2 - margin <= mouseX && mouseX <= cardX + W/2 + margin &&
      cardY - H/2 - margin <= mouseY && mouseY <= cardY + H/2 + margin){
    
    dragging = true;

    holdX = cardX;
    holdY = cardY;

    mouseX_hold = mouseX;
    mouseY_hold = mouseY;
  }
}

function mouseReleased() {
  dragging = false;
}

/** subpages */
function about(){
  fill('black');
  noStroke();
  textSize(28);
  rectMode(CORNER);

  push();
  translate(W + 2.5*margin, H + 4*margin - 30);

  text('about me', 0, 0);

  pop();

  push();
  translate(W + 2.5*margin, H + 5*margin);
  text("hello! my name is yon. i'm a third year studying electrical/computer engineering and art at carnegie mellon university.", 0, 0, width - W - 2*margin);

  textSize(22);
  text("i specialize in signals & systems. my research areas are in GUI design and interactivity in technical education.", 0, 120, width - W - 2*margin);
  text("i like woodworking, printmaking, reading theory, and designing confusing user interfaces.", 0, 190, width - W - 2*margin);

  text("if you don't like it here, here are some other places to go", 0, 280);

  textSize(18);
  text("instagram    github    twitter    K67", 0, 310);

  textSize(22);
  text("currently reading", 0, 360);
  textSize(18);
  text("the Modern Prince and Other Writings, Antonio Gramci", 0, 390);

  pop();
}

function art(){
  fill('black');
  noStroke();
  rectMode(CORNER);
  textSize(28);
  
  push();
  translate(margin, H + 5*margin - scroll);
  text("3d", 0, 20);
  imageGrid(three_d, 0, 30);

  translate(0, 80 + three_d[0].h * ceil(three_d.length / 3));
  text("2d", 0, 20);
  imageGrid(two_d, 0, 30);

  translate(0, 80 + two_d[0].h * ceil(two_d.length / 3));
  text("electronic", 0, 0);
  imageGrid(electronic, 0, 30);

  pop();

  fill('white');
  stroke('black');
  rect(0, 0, width - W - 2*margin, H + 2*margin);

  push();
  translate(margin, H + 4*margin - 30);

  noStroke();
  fill('black');
  text('art', 0, 0);

  pop();

}

function design() {

}

function work() {

}

function imageGrid(images, x, y) {
  push();
  translate(x, y);

  for (let i = 0; i < images.length; i++) {
    push();

    translate((images[i].w + margin) * (i % 3), (images[i].h + margin) * floor(i / 3));
    images[i].draw();

    pop();
  }

  pop();
}

function mouseWheel(event) {
  scroll += event.delta;

  if (corner == 1) scroll = constrain(scroll, 0, 6 * two_d[0].h);

  return false;
}