//
// "main" file for music visualizers
//

var context;
var source = null;
var myAudioBuffer = null;

var sourceNode = null;
var mediaSourceNode = null;
var analyser = null;

var vis_view;
var vis_value;

var WIDTH = 720;
var HEIGHT = 480;
var SOUND_METER_GAP = 10;
var SOUND_METER_WIDTH = 60;
var SOUND_METER_HEIGHT = HEIGHT;
var SOUND_METER_MIN_LEVEL = -96.0;  // dB

var micOn = false;
var filePlayOn = false;

var animation_function;
var animation_id;

var prev_band_level = new Array(10); 
for (var i=0; i <10;i++ ) {
	prev_band_level[i] = 0;		
}


// load demo audio feils
var demo_buffer;

window.onload=function(){

	var micAudio = document.getElementById("micInput");
	micAudio.addEventListener("click", playMic, false);

	var demoAudio = document.getElementById("demoAudio");
	demoAudio.addEventListener("click", playFile, false);

	var visMod1 = document.getElementById("visMode1");
	visMod1.addEventListener("click", function(){
			setAnimationFunction(1)	
	}, false); 

	var visMod2 = document.getElementById("visMode2");
	visMod2.addEventListener("click", function(){
			setAnimationFunction(2)	
	}, false); 

	vis_view = document.getElementById("loudnessView");
	vis_value = document.getElementById("loudnessValue");
	vis_view.width =  WIDTH;
	vis_view.height = HEIGHT;

	
	// create audio context
	context = new AudioContext();
	
	// analyzer
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;
	analyser.smoothingTimeConstant = 0;		

	var demoReq = new XMLHttpRequest();
    demoReq.open("Get","demo1.mp3",true);
    demoReq.responseType = "arraybuffer";
    demoReq.onload = function(){
        context.decodeAudioData(demoReq.response, function(buffer){demo_buffer = buffer;});
    }
    demoReq.send();

    animation_function = draw_octaveband;
}

function setAnimationFunction (mode_num) {
	if (mode_num == 1) {
	    animation_function = draw_octaveband;
	}
	else if(mode_num == 2) {
	    animation_function = draw_MyOwn;		
	}

    if (filePlayOn || micOn) {
		stopAnimation();

		// restart visualize audio animation
    	animation_id = setInterval(animation_function, context.sampleRate/analyser.fftSize);
	}
}

function draw_octaveband() {

	// get samples 
	var data_array = new Float32Array(analyser.frequencyBinCount);
	analyser.getFloatFrequencyData(data_array);

	var octaveband_level_db = calc_octaveband(data_array)
	var loudness = octaveband_level_db[2];

	// display the loudness value
	vis_value.innerHTML = '32Hz-Band Level (dB): ' + loudness + ' dB'

	// 2d canvas context
	var drawContext = vis_view.getContext('2d');
	
	// fill rectangular (for the entire canvas)
	drawContext.fillStyle = 'rgb(0, 0, 0)';
	drawContext.fillRect(0, 0, WIDTH, HEIGHT);


	for (var i=0; i<10; i++) {

		// fill rectangular (for the sound level)
		var sound_level = (octaveband_level_db[i]-SOUND_METER_MIN_LEVEL)/(0.0-SOUND_METER_MIN_LEVEL)*SOUND_METER_HEIGHT;

		// asymmetric envelope detector
		if ( sound_level > prev_band_level[i]) {
			sound_level_env =  sound_level;
			prev_band_level[i] =  sound_level
		}
		else {
			sound_level_env =  prev_band_level[i];
			prev_band_level[i] = 0.95*prev_band_level[i]; 
		}

		// shape
		drawContext.beginPath();
		var x = SOUND_METER_GAP + (SOUND_METER_WIDTH+SOUND_METER_GAP)*i;
		drawContext.rect(x, SOUND_METER_HEIGHT, SOUND_METER_WIDTH, -sound_level_env);

		// color
		var hue = Math.floor(255/9*i);
		var saturation = 255;
		var value = 255;
		var rgb = hsvToRgb(hue, saturation, value);
		drawContext.fillStyle='rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'; 
		drawContext.fill();
	}

}

function draw_MyOwn() {

	// get samples 
	var data_array = new Float32Array(analyser.frequencyBinCount);
	analyser.getFloatFrequencyData(data_array);

	var octaveband_level_db = calc_octaveband(data_array)
	var loudness = octaveband_level_db[2];

	// display the loudness value
	vis_value.innerHTML = '32Hz-Band Level (dB): ' + loudness + ' dB'

	// 2d canvas context
	var drawContext = vis_view.getContext('2d');
	
	// fill rectangular (for the entire canvas)
	drawContext.fillStyle = 'rgb(0, 0, 0)';
	drawContext.fillRect(0, 0, WIDTH, HEIGHT);

	var radius = 0;
	var start_angle = 0;
	var end_angle = 0;

	for (var i=0; i<10; i++) {

		// fill rectangular (for the sound level)
		var sound_level = (octaveband_level_db[i]-SOUND_METER_MIN_LEVEL)/(0.0-SOUND_METER_MIN_LEVEL);

		// asymmetric envelope detector
		if ( sound_level > prev_band_level[i]) {
			sound_level_env =  sound_level;
			prev_band_level[i] =  sound_level
		}
		else {
			sound_level_env =  prev_band_level[i];
			prev_band_level[i] = 0.95*prev_band_level[i]; 
		}

		// shape
		drawContext.beginPath();
		var radius = radius + sound_level*40;
		var start_angle = end_angle - Math.PI*2/6;
		var end_angle = start_angle + Math.PI*2*sound_level;

		drawContext.arc(WIDTH/2, HEIGHT/2, radius, start_angle, end_angle, 0);
		drawContext.lineWidth = 20;

		// color
		var hue = Math.floor(255/9*i);
		var saturation = 50;
		var value = 255;
		var rgb = hsvToRgb(hue, saturation, value);
		drawContext.strokeStyle='rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'; 
		drawContext.stroke();
	}

}

function playMic()
{
    if (filePlayOn) {
    	turnOffFileAudio();
    }

    if (micOn) {
		turnOffMicAudio();
		return;
    }

	if (!navigator.getUserMedia)
		navigator.getUserMedia = (navigator.getUserMedia({audio: true}) || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
							  
	if (!navigator.getUserMedia)
		alert("Error: getUserMedia not supported!");
						
	// get audio input streaming 				 
	navigator.getUserMedia({audio: true}, onStream, onStreamError)

	micOn = true;

	var mic = document.getElementById("micInput");
	mic.innerHTML = 'Mic Off'
}


// success callback
function onStream(stream) {
    mediaSourceNode = context.createMediaStreamSource(stream);
	
	// Connect graph
	mediaSourceNode.connect(analyser);
						  
	// visualize audio animation
    animation_id = setInterval(animation_function, context.sampleRate/analyser.fftSize);
}

// errorCallback			 
function onStreamError(error) {
	console.error('Error getting microphone', error);

	micOn = false;
}


function playFile() {
    if (filePlayOn) {
    	turnOffFileAudio();
    	return;
    }

    if (micOn) {
		turnOffMicAudio();
    }

    sourceNode = context.createBufferSource();

    sourceNode.buffer = demo_buffer;
    sourceNode.connect(context.destination);
    sourceNode.start(0);

	sourceNode.connect(analyser);

	// visualize audio animation
    animation_id = setInterval(animation_function, context.sampleRate/analyser.fftSize);

	filePlayOn = true;
	
	var demoAudio = document.getElementById("demoAudio");
	demoAudio.innerHTML = 'Demo Audio Stop'
}


function turnOffMicAudio() {
	var mic = document.getElementById("micInput");		
	mic.innerHTML = 'Mic On'
	mediaSourceNode = null;
	micOn = false;

	stopAnimation();
}

function turnOffFileAudio() {
	var demoAudio = document.getElementById("demoAudio");
	demoAudio.innerHTML = 'Demo Audio Play'
	sourceNode.stop(0);
    sourceNode = null;
    filePlayOn = false;

	stopAnimation();
}

function stopAnimation() { 
    clearInterval(animation_id);
}




