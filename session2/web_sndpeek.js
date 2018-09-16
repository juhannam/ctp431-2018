var mic, fft;

var DEPTH = 48; // 48
var NUM_SPEC_BINS = 1024;
var spec_array = new Array();

for (i=0;i<DEPTH;i++) {
	spec_array[i]=new Array();
	for (j=0;j<NUM_SPEC_BINS;j++) {
		spec_array[i][j]=0;
	}
}

// x[5][12] = 3.0;
var cur_spec_index = 0;


function setup() {
	createCanvas(1024, 640, WEBGL);

	//perspective(45 / 180 * PI, width/height, 0.5, 0);
	var fov = 45 / 180 * PI;
  	var cameraZ = (height/2.0) / tan(fov/2.0);
  	perspective(fov, width/height, cameraZ * 0.1, cameraZ * 10);

	mic = new p5.AudioIn();
	mic.start()
	fft = new p5.FFT(0.01, NUM_SPEC_BINS);
	fft.setInput(mic);
}

function draw() {
	background(0);
	
	// viewer's pespective
	camera(0, -300, 300);

	// add interactivity
	orbitControl();

	// get spectrum 
 	var spectrum = fft.analyze();

 	// store current spectrum
 	for (var i = 0; i < spectrum.length; i++) {
 		spec_array[cur_spec_index][i] = spectrum[i];
 	}

 	// draw spectrum using a 2D-circular buffer
 	for (var i = 0; i < DEPTH; i++) {
 		array_index = cur_spec_index - i;
 		if (array_index < 0) {
 			array_index = array_index + DEPTH;
 		}

 		beginShape();
 		for (var k = 0; k < spectrum.length; k++) {
			var y = map(spec_array[array_index][k], 0, 640, height, 0);
			var x = map(k, 0, spectrum.length, 0, width); 
			vertex(x-width/2, y/2-height/2, 0-i*35);
		}
		endShape();

		// gradation 
		fill(100-i/DEPTH*100, 255 - i/DEPTH*255, 100-i/DEPTH*100);

	}	

	cur_spec_index = cur_spec_index + 1;
 	if (cur_spec_index == DEPTH)
 		cur_spec_index = 0;

}

