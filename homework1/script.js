var context = new(window.AudioContext || window.webkitAudioContext)();

// create
var generators = new Array(1);
var filters = new Array(1);
var buffers = new Array(7); // 0 : kick, 1 : snare, 2 : hihat
var pad_ids = new Array("kickPad", "snarePad", "hihatPad",
  "revKickPad", "revSnarePad", "revHihatPad",
  "lokPad")
var volume_id = new Array("kickVol", "snareVol", "hihatVol",
  "revKickVol", "revSnareVol", "revHihatVol",
  "lokVol");
var volume_label_id = new Array("kickVolLabel", "snareVolLabel", "hihatVolLabel",
  "revKickVolLabel", "revSnareVolLabel", "revHihatVolLabel",
  "lokVolLabel");
var gain_nodes = new Array(7);

var record = document.querySelector('#record');
var stop = document.querySelector('#stop');
var play = document.querySelector('#play');

// var mediaRecorder = new MediaRecorder(context.destination.stream);

// record.onclick = function() {
//     mediaRecorder.start();
//     console.log(mediaRecorder.state);
//     console.log("recorder started");
//     record.style.background = "red";
//     record.style.color = "black";
// }

// var recording = null;
// mediaRecorder.ondataavailable = function(e) {
//     recording = e.data;
// }

// stop.onclick = function() {
//     mediaRecorder.stop();
//     console.log(mediaRecorder.state);
//     console.log("recorder stopped");
//     record.style.background = "";
//     record.style.color = "";
// }

// generators[0] = context.createOscillator();
// filters[0] = context.createBiquadFilter();

// // connect
// generators[0].connect(filters[0]);

// // control
// generators[0].type = 'sine';
// generators[0].frequency.value = 440;
// filters[0].frequency.value = 1000;
// filters[0].Q.value = 10;

for (i = 0; i < volume_id.length; i++) {
  gain_nodes[i] = context.createGain();
  console.log(volume_id[i])
  var vol = document.getElementById(volume_id[i]).value;
  gain_nodes[i].gain.value = db2gain(vol);
  gain_nodes[i].connect(context.destination);
  console.log(volume_label_id[i])
  document.getElementById(volume_label_id[i]).innerHTML = 'V ' + vol + 'dB';
}

// filters[0].connect(gain_nodes[3]);
// generators[0].start();

soundpads = ["sinePad", "samplePad"]

function togglesound(index) {
  var pad = document.getElementById(soundpads[index]);
  buffers[index].connect(gain_nodes[index]);
  if (pad.className == "active") {
    pad.className = "";
    stopsound(index);
  } else {
    sinepad.className = "active";
    simulateFocus(pad);
  }
}

function stopsound(index) {
  generators[index].disconnect();
}

var sound_files = ["b_kickdrum.wav", "p_snare.wav", "ts_hitat.wav",
  "b_kickdrum_rev.wav", "p_snare_rev.wav", "ts_hitat_rev.wav",
  "lok.wav"
]

var sounds = new Array(7);

for (let i = 0; i < sound_files.length; i++) {
  sounds[i] = new XMLHttpRequest();
  sounds[i].open("Get", sound_files[i], true);
  sounds[i].responseType = "arraybuffer";
  var sound = sounds[i];
  sounds[i].onload = function() {
    context.decodeAudioData(sounds[i].response, function(buffer) {
      buffers[i] = buffer;
    });
  }
  sounds[i].send();
}

var kick = new XMLHttpRequest();
kick.open("Get", sound_files[0], true);
kick.responseType = "arraybuffer";
kick.onload = function() {
  context.decodeAudioData(kick.response, function(buffer) {
    buffers[0] = buffer;
  });
}
kick.send();

window.onload = function() {
  window.addEventListener('keydown', function(key) {
    keyboardDown(key);
  }, false);

  window.addEventListener('keyup', function(key) {
    keyboardUp(key);
  }, false);
}

function playdrum(i) {
  source = context.createBufferSource();
  source.buffer = buffers[i];
  source.connect(gain_nodes[i]);
  source.start();
}

function changegain(i, changedvalue) {
  gain_nodes[i].gain.value = db2gain(changedvalue);
  document.getElementById(volume_label_id[i]).innerHTML = 'V ' + changedvalue + 'dB';
}

function db2gain(db_gain) {
  var gain = Math.pow(10, +db_gain / 20);
  return gain;
}

// SYNTH

function changeOscFreq(i, oscFreq) {
  generators[i].frequency.value = oscFreq;

  var freqSlider_value = document.getElementById("oscFrequencySliderValue");
  freqSlider_value.innerHTML = oscFreq + ' Hz';
}

function changeFilterFreq(i, filterFreq) {
  console.log(i, filterFreq)
  filters[i].frequency.value = filterFreq;

  var freqSlider_value = document.getElementById("filterFrequencySliderValue");
  freqSlider_value.innerHTML = filterFreq + ' Hz';
}

// keyboard mapping
function keyboardDown(key) {
  var pad = null;
  switch (key.keyCode) {
    case 65: //'a'
      pad = document.getElementById("kickPad");
      break;
    case 83: //'s'
      pad = document.getElementById("snarePad");
      break;
    case 76: //'l'
      pad = document.getElementById("hihatPad");
      break;
    case 68: //'d'
      pad = document.getElementById("revKickPad");
      break;
    case 70: //'f'
      pad = document.getElementById("revSnarePad");
      break;
    case 75: //'k'
      pad = document.getElementById("revHihatPad");
      break;
    case 74: //'j'
      pad = document.getElementById("lokPad");
      break;
  }
  if (pad != null) {
    simulateClick(pad);
    pad.className = "drum active";
  }
}

function keyboardUp(key) {
  switch (key.keyCode) {
    case 65: //'a'
      var kickpad = document.getElementById("kickPad");
      kickpad.className = "drum";
      break;
    case 83: //'s'
      var snarepad = document.getElementById("snarePad");
      snarepad.className = "drum";
      break;
    case 76: //'l'
      var hihatpad = document.getElementById("hihatPad");
      hihatpad.className = "drum";
      break;
    case 68: //'d'
      var revKickPad = document.getElementById("revKickPad");
      revKickPad.className = "drum";
      break;
    case 70: //'f'
      var revSnarePad = document.getElementById("revSnarePad");
      revSnarePad.className = "drum";
      break;
    case 75: //'k'
      var revHihatPad = document.getElementById("revHihatPad");
      revHihatPad.className = "drum";
      break;
    case 74: //'j'
      var lokPad = document.getElementById("lokPad");
      lokPad.className = "drum";
      break;
  }
}

// simulated mousedown on buttons
function simulateClick(element) {
  var event = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(event);
}