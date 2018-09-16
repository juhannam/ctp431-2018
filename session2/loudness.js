
function calc_sound_level_dB(input_array) {
	var rms, dB_level;

	var temp = 0.0;
	for (var i = 0; i < input_array.length; i++) {
//		var input = input_array[i]/256.0 - 0.5;
		temp = temp + Math.pow(input_array[i],2);
	}

	rms = Math.sqrt(temp/input_array.length);
	dB_level = 20.0*Math.log10(rms);

	return dB_level;
}

