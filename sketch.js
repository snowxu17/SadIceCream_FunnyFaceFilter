//Canvas, background color, camera capture
const Y_AXIS = 1;
const X_AXIS = 2;
var b1, b2, c1, c2;

var capture;
var tracker
var w = 960,
    h = 720;
var img1;

//Speech recognition & speech speaking
var speech = new p5.Speech("Alex", voiceReady);
var lang = navigator.language || 'en-US';
var speechRec = new p5.SpeechRec(lang, gotSpeech);
speechRec.continuous = true;

var msg1 = "I'm a sad ice cream. I melt when I am too happy ( 🙃 ) I also like to repeat myself forever, often incorrectly ";
var note = "* Note to self: Because I have very short memory";
var msg2 = "I am too happy now. I can't be this happy. I have to stop smiling. Stop. Stop stop. Ha ha.";

var t = 0;

function preload(){
  img2 = loadImage("images/iceCream.png");
}

function setup() {
  // Speech
  speechRec.onResult = showResult;
  speechRec.start();

  speech = new p5.Speech(voiceReady);
  speech.speak(msg1);

  console.log(speech.voices);
  console.log(speechRec);

  // Canvas colors
  b1 = color('pink');
  b2 = color('yellow');
  c1 = color(204, 102, 0);
  c2 = color(0, 102, 153);

  textAlign(CENTER);
  text("say something", width / 2, height / 2);

  // Face tracker setup
    capture = createCapture({
        audio: false,
        video: {
            width: w,
            height: h
        }
    }, function() {
        console.log('capture ready.')
    });
    capture.elt.setAttribute('playsinline', '');
    createCanvas(w, h);
    capture.size(w, h);
    capture.hide();

    colorMode(HSB);

    tracker = new clm.tracker();
    tracker.init();
    tracker.start(capture.elt);

    canvas = createCanvas( windowWidth, windowHeight );
    canvas.parent( 'sketch-holder' );
    background( 51 );
    noStroke();
    fill( 0 );
}

function voiceReady(){
  console.log(speech.voices);
}

function gotSpeech() {
  console.log(speechRec);
}

function draw() {

    setGradient(0, 0, windowWidth, windowHeight, b1, b2, X_AXIS);
    setGradient(0, 0, windowWidth, windowHeight, b2, b1, X_AXIS);

    drawBubbles();

    var offsetX = windowWidth / 2 - w / 2;
    var offsetY = windowHeight / 2 - h / 2;

    image(capture, offsetX, offsetY, w, h);
    var positions = tracker.getCurrentPosition();

    noFill();
    stroke(255);
    beginShape();
    for (var i = 0; i < positions.length; i++) {
        // uncomment to see face line up tracked by  vector points
        // vertex(offsetX + positions[i][0], offsetY + positions[i][1]);
    }
    endShape();

    noStroke();
    textSize(14);
    textAlign(LEFT);
    for (var i = 0; i < positions.length; i++) {
        fill(map(i, 0, positions.length, 0, 360), 50, 100);
        // uncomment to see each vector point
        // ellipse(offsetX + positions[i][0], offsetY + positions[i][1], 4, 4);
        // text(i, offsetX + positions[i][0], offsetY + positions[i][1]);
    }

    if (positions.length > 0) {
        var mouthLeft = createVector(positions[44][0], positions[44][1]);
        var mouthRight = createVector(positions[50][0], positions[50][1]);
        var leftEyeX = positions[32][0];
        var leftEyeY = positions[32][1];

        var rightEyeX = positions[27][0];
        var rightEyeY = positions[27][1];

        var noseX = positions[62][0];
        var noseY = positions[62][1];

        var faceLeftX = positions[1][0];
        var faceLeftY = positions[1][1];
        var faceRightX = positions[13][0];
        var faceRightY = positions[13][1];

        var size = dist(faceLeftX,faceLeftY, faceRightX, faceRightY);
        var smile = mouthLeft.dist(mouthRight);
        // console.log(size);

        if (smile > 115){
          speech.speak(msg2);
          console.log("too happy!!!");
        }

        else{
          speech.speak(msg1);
          console.log("not happy anymore so I can stay alive");
        }

        var img_w = map(size, 250, 550, img2.width * 1.2, img2.width * 2.5);
        var img_h = map(size, 250, 550, img2.height * 1.2, img2.height * 2.5);

        noStroke();
        fill(0, 255, 255);

        image(img2, offsetX + positions[19][0] - img_w / 2.8, offsetY + positions[19][1] - img_h / 2.3, img_w, img_h);
        // syst_L.move(offsetX + positions[19][0], offsetY + positions[19][1] - img_h / 2.3);

        fill(color('magenta'));
        text('SMILE LEVEL :D  ', windowWidth * 0.2, 20);
        rect(windowWidth * 0.2, 30, smile * 3, 20);
        text(smile, smile * 3 + windowWidth * 0.21, 45);
    }

    textAlign(CENTER);
    stroke(color('magenta'));
    fill(color('pink'));
    textFont('Avenir', 30);
    text(msg1, windowWidth / 2, windowHeight * .93);
    textFont('Avenir', 20);
    text(note, windowWidth / 4 * 3 , windowHeight * .96);

    getCurFrameRate();
}

function setGradient(x, y, w, h, c1, c2, axis) {

  noFill();
  if (axis === Y_AXIS) {

    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  } else if (axis === X_AXIS) {

    for (let i = x; i <= x + w; i++) {
      let inter = map(i, x, x + w, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y + h);
    }
  }
}

function drawBubbles() {

  for (let x = 0; x <= width; x = x + 50) {
    for (let y = 0; y <= height; y = y + 50) {

      var xAngle = map(t, 0, width, -4 * PI, 4 * PI, true);
      var yAngle = map(t, 0, height, -4 * PI, 4 * PI, true);
      var angle = xAngle * (x / width) + yAngle * (y / height);

      var myX = x + 20 * cos(2 * PI * t + angle);
      var myY = y + 20 * sin(2 * PI * t + angle);

      stroke(color('orange'));
      ellipse(myX, myY, random(10, 60));
    }
  }
  t = t + 0.01;
}

function showResult() {

	if (speechRec.resultValue === true) {

		background(255);
    fill(color('red'));
		speech.speak(speechRec.resultString);
		console.log(speechRec.resultString);
	}
}

function getCurFrameRate(){

  fill(color('magenta'));
  textAlign(LEFT);
  textSize(14);
  text('Current Frame Rate', windowWidth * 0.2, 80);
  text(getFrameRate(), windowWidth * 0.2, 100);
}

function windowResized(){
    resizeCanvas( windowWidth, windowHeight );
}
