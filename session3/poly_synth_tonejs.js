
var settings = {
	id: 'keyboard',
	width: 600,
	height: 150,
	startNote: 'C3',
	whiteNotesColour: '#fff',
	blackNotesColour: '#000',
	borderColour: '#000',
	activeColour: 'blue',
	octaves: 2
}

keyboard = new QwertyHancock(settings);


var synth = new Tone.PolySynth(48, Tone.MonoSynth).toMaster();

// one octave up
synth.set("detune", 0);

synth.set({
	oscillator:{
		type:"square"
	},
	filter:{
		Q:6,
		type:"lowpass",
		frequency: 1000,
		rolloff:-24
	},
	filterEnvelope:{
		attack:0,
		decay:1,
		sustain:1.0,
		release:0.0001,
		baseFrequency: 1000,
		octaves:0
	},
	envelope:{
		attack:0.0,
		decay:0,
		sustain:1,
		release:0.3
	}
});


var midi2freq = function (midi_note_num) {
	var freq = 440.0*Math.pow(2.0,(midi_note_num-69)/12)
	console.log(midi_note_num)
	console.log(freq)
	return freq
}

// Qwerty-Hancock note on/off handlers	
keyboard.keyDown = function (note, frequency) {	
	synth.triggerAttack(frequency, undefined, 0.5);	
	console.log(frequency);
};

keyboard.keyUp = function (note, frequency) {
	synth.triggerRelease(frequency);
	console.log(frequency);
};


// select a preset
window.onload=function(){

	// launch MIDI 	
	if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
    else
        alert("No MIDI support present in your browser.  You're gonna have a bad time.")
}


function onMIDIInit(midi) {
	midiAccess = midi;

	var haveAtLeastOneDevice=false;
	var inputs=midiAccess.inputs.values();

	for ( var input = inputs.next(); input && !input.done; input = inputs.next()) {
		input.value.onmidimessage = MIDIMessageEventHandler;
		haveAtLeastOneDevice = true;
	}
      
	if (!haveAtLeastOneDevice)
		console.log("No MIDI input devices present.  You're gonna have a bad time.");
	}


function onMIDIReject(err) {
	console.log("The MIDI system failed to start.  You're gonna have a bad time.");
}


function MIDIMessageEventHandler(event) {
	// Mask off the lower nibble (MIDI channel, which we don't care about)
	switch (event.data[0] & 0xf0) {
		case 0x90:
		if (event.data[2]!=0)   // if velocity != 0, this is a note-on message
			var freq = midi2freq(event.data[1]);
			var amp = event.data[2]/127;
			synth.triggerAttack(freq, undefined, amp);	
			return;
		
		// if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
        case 0x80:
			var freq = midi2freq(event.data[1]);
			synth.triggerRelease(freq);
			return;
	}
}	

