var context = new (window.AudioContext || window.webkitAudioContext)();

// create
var generators = new Array(1);
var filters = new Array(1);
var buffers = new Array(3); // 0 : kick, 1 : snare, 2 : hihat
var volume_id = new Array("kickVol","snareVol","hihatVol","sineVol");
var volume_label_id = new Array("kickVolLabel","snareVolLabel","hihatVolLabel","sineVolLabel");
var gain_nodes = new Array(4);

generators[0] = context.createOscillator();
filters[0] = context.createBiquadFilter();

// connect
generators[0].connect(filters[0]);

// control
generators[0].type = 'sine';
generators[0].frequency.value = 440;
filters[0].frequency.value = 1000;
filters[0].Q.value = 10;

for (i  = 0; i < 4; i++) {
    gain_nodes[i] = context.createGain();
    var vol = document.getElementById(volume_id[i]).value;
    gain_nodes[i].gain.value = db2gain(vol);
    gain_nodes[i].connect(context.destination);
    document.getElementById(volume_label_id[i]).innerHTML = 'Volume:  ' + vol + 'dB'; 
}

filters[0].connect(gain_nodes[3]);
generators[0].start();

function togglesound(index)
{
    var sinepad = document.getElementById("sinePad");
    generators[index].connect(gain_nodes[3]);
    if (sinepad.className == "active") {
        sinepad.className = "";
        stopsound(index);
    } else {
        sinepad.className = "active";
        simulateFocus(sinepad);
    }
}

function stopsound(index)
{
    generators[index].disconnect();
}


var kick = new XMLHttpRequest();
kick.open("Get","lok.wav",true);   //  <---- replace this file with yours
kick.responseType = "arraybuffer";
kick.onload = function(){
    context.decodeAudioData(kick.response, function(buffer){buffers[0] = buffer;});
}
kick.send();

var snare = new XMLHttpRequest();
snare.open("Get","lok.wav",true);  //  <---- replace this file with yours
snare.responseType = "arraybuffer";
snare.onload = function(){
    context.decodeAudioData(snare.response, function(buffer){buffers[1] = buffer;});
}
snare.send();

var hihat = new XMLHttpRequest();
hihat.open("Get","lok.wav",true);  //  <---- replace this file with yours
hihat.responseType = "arraybuffer";
hihat.onload = function(){
    context.decodeAudioData(hihat.response, function(buffer){buffers[2] = buffer;});
}
hihat.send();


window.onload=function(){
    window.addEventListener('keydown', function (key) {
        keyboardDown(key);
    }, false);

    window.addEventListener('keyup', function (key) {
        keyboardUp(key);
    }, false);
}

function playdrum(i) {
    source = context.createBufferSource();
    source.buffer = buffers[i];
    source.connect(gain_nodes[i]);
    source.start();
}

function changegain(i,changedvalue) {
    gain_nodes[i].gain.value = db2gain(changedvalue);
    document.getElementById(volume_label_id[i]).innerHTML = 'V ' + changedvalue + 'dB';
}

function db2gain(db_gain) {
    var gain = Math.pow(10, +db_gain/20);
    return gain;
}

// SYNTH

function changeOscFreq(i,oscFreq){
		generators[i].frequency.value = oscFreq;

		var freqSlider_value = document.getElementById("oscFrequencySliderValue");
		freqSlider_value.innerHTML = oscFreq + ' Hz';
}

function changeFilterFreq(i,filterFreq){
    console.log(i, filterFreq)
		filters[i].frequency.value = filterFreq;

		var freqSlider_value = document.getElementById("filterFrequencySliderValue");
		freqSlider_value.innerHTML = filterFreq + ' Hz';
}

// keyboard mapping
function keyboardDown(key) {
    switch (key.keyCode) {
        case 65: //'a'
            var kickpad = document.getElementById("kickPad");
            kickpad.className = 'active';
            simulateClick(kickpad);
            break;
        case 83: //'s'
            var snarepad = document.getElementById("snarePad"); 
            snarepad.className = 'active';
            simulateClick(snarepad);
            break;
        case 76: //'l'
            var hihatpad = document.getElementById("hihatPad"); 
            hihatpad.className = 'active';
            simulateClick(hihatpad);
            break;
    }
}

function keyboardUp(key) {
    switch (key.keyCode) {
        case 65: //'a'
            var kickpad = document.getElementById("kickPad"); 
            kickpad.className = '';
            break;
        case 83: //'s'
            var snarepad = document.getElementById("snarePad"); 
            snarepad.className = '';
            break;
        case 76: //'l'
            var hihatpad = document.getElementById("hihatPad"); 
            hihatpad.className = '';
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

function simulateFocus(element) {
    var event = new MouseEvent("focus", {
        bubbles: true,
        cancelable: true,
        view: window
    });
    element.dispatchEvent(event);
}
