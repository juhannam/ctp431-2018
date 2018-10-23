
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();


if ( context.state === 'suspended') {
	var resume = function () {
		context.resume();

		setTimeout(function () {
			if (context.state === 'running') {
				document.body.removeEventListener('touchend', resume, false);
			}
		}, 0);
	};

	document.body.addEventListener('touchend', resume, false);
}


var synth;

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



var params = {
	filterCutoffFreq:10000,
	filterQ:4,
	ampEnvAttackTime: 0.001,
	ampEnvDecayTime: 0.2,
	ampEnvSustainLevel: 0.9,
	ampEnvReleaseTime: 0.1,
};


var Voice = function(context, frequency, amplitude, parameters) {
	this.context = context;

	// oscillator
	this.osc = context.createOscillator()

	// filter 
	this.filter = context.createBiquadFilter();

	// amp envelope
	this.ampEnv = context.createGain();

	// connect
	this.osc.connect(this.filter);
	this.filter.connect(this.ampEnv);

	this.ampEnv.connect(context.destination);
  

	// preset parameters 
	this.osc.frequency.value = frequency;

	this.ampEnvLevel = amplitude;
	this.ampEnvAttackTime = parameters.ampEnvAttackTime;
	this.ampEnvDecayTime = parameters.ampEnvDecayTime;
	this.ampEnvSustainLevel = parameters.ampEnvSustainLevel;
	this.ampEnvReleaseTime = parameters.ampEnvReleaseTime;

	this.osc.type = 'sawtooth';
	this.filter.type = 'lowpass';
	this.filter.frequency.value = parameters.filterCutoffFreq;
	this.filter.Q.value = parameters.filterQ;

	this.ampEnv.gain.value = amplitude;	
};

Voice.prototype.on = function() {
	this.osc.start();
	this.triggerAmpEnvelope();
};

Voice.prototype.triggerAmpEnvelope = function() {
	var param = this.ampEnv.gain;
	var now = this.context.currentTime;

	param.cancelScheduledValues(now);

	// attack
	param.setValueAtTime(0, now);
	param.linearRampToValueAtTime(this.ampEnvLevel, now + this.ampEnvAttackTime);

	// decay
	param.exponentialRampToValueAtTime(this.ampEnvLevel * this.ampEnvSustainLevel, now + this.ampEnvAttackTime + this.ampEnvDecayTime);
};

Voice.prototype.off = function() {
	var param = this.ampEnv.gain;
	var now = this.context.currentTime;

	param.cancelScheduledValues(now);
	param.setValueAtTime(param.value, now);
	param.exponentialRampToValueAtTime(0.001, now + this.ampEnvReleaseTime);
	this.osc.stop(now + this.ampEnvReleaseTime);
};

var Synth = function(context, parameters) {
	this.context = context;
	this.voices = {};
	this.parameters = parameters;
};

Synth.prototype.noteOn = function(midi_note_number, midi_note_velocity) {
	var frequency = this.midiNoteNumberToFrequency(midi_note_number);
	var amplitude = this.midiNoteVelocityToAmp(midi_note_velocity);

	this.voices[midi_note_number] = new Voice(this.context, frequency, amplitude, this.parameters)
	this.voices[midi_note_number].on();
};

Synth.prototype.midiNoteNumberToFrequency = function(midi_note_number) {
	var f_ref = 440;
	var n_ref = 69;
	var a = Math.pow(2, 1/12);
	var n = midi_note_number - n_ref;
	var f = f_ref * Math.pow(a, n);

	return f;
};

Synth.prototype.midiNoteVelocityToAmp = function(midi_note_velocity) {

	var min_dB = -30.0;

	// velocity to dB
	var note_dB = midi_note_velocity/128.0*(-min_dB) + min_dB;

	// dB to amplitude
	var amplitude = Math.pow(10.0, note_dB/20.0);

	//console.log(midi_note_velocity)
	//console.log(amplitude)

	return amplitude;

};


Synth.prototype.noteOff = function(midi_note_number) {
	this.voices[midi_note_number].off();
};


// select a preset
window.onload=function(){

	// launch MIDI 	
	if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
    else
        alert("No MIDI support present in your browser.  You're gonna have a bad time.")


	// default
	synth = new Synth(context, params);
}


var getMIDINumOfNote = function (note) {
	var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
	key_number,
	octave;

	if (note.length === 3) {
		octave = note.charAt(2);
	} else {
		octave = note.charAt(1);
	}

	key_number = notes.indexOf(note.slice(0, -1));

	if (key_number < 3) {
		key_number = key_number + 12 + ((octave - 1) * 12) + 1;
	} else {
		key_number = key_number + ((octave - 1) * 12) + 1;
	}

	return (key_number+20);
};


// Qwerty-Hancock note on/off handlers	
keyboard.keyDown = function (note, frequency) {	
	synth.noteOn(getMIDINumOfNote(note), 100);	
};

keyboard.keyUp = function (note, frequency) {
	synth.noteOff(getMIDINumOfNote(note), 100);
};
	

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
			synth.noteOn(event.data[1], event.data[2]);	
			return;
		
		// if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
        case 0x80:
			synth.noteOff(event.data[1], event.data[2]);
			return;
	}
}	