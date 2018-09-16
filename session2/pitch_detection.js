//
// YIN-based pitch detection algorithm
//
// By Juhan Nam, Oct-4-2016

function detect_pitch(input_array) {

	// down-sampling by 4 for efficiency (from 44100 to 11025 Hz)
	// aliasing is not avoidable with this simple method :(
	var input_ds = [];
	for (var i = 0; i < input_array.length; i++) { 
		if (( i % 4) == 0) {
			// scale input to the range from -1 to 1 if input is unsigned byte
    		//input_ds.push((input_array[i]-128.0)/256.0);
    		input_ds.push(input_array[i]);
		}
	}

	// We assume that minimum pitch is 100 Hz
	// window_size must be greater than = fs/min_pitch = 11025/100 = 110.25 samples
	var	win_size = input_ds.length/4;  // 128 samples for 2048-FFT
	var max_lag = 256; 

	if ((win_size+max_lag) > input_ds.length) {
		max_lag = input_ds.length - win_size;
	}

	// Amplitude Difference Function
	var amdf = new Array(max_lag);

	var lag;
	for (var i = 0; i < max_lag; i++) { 
		lag = i;
		var temp = 0.0;
		for (var j = 0; j < win_size; j++) {
			temp = temp + (input_ds[j] - input_ds[j+i])*(input_ds[j] - input_ds[j+i]);
		}
		amdf[i] = temp;//Math.sqrt(temp);
	}

	// Cumulative Mean Normalized Difference
	var amdf_cum = new Array(max_lag);		
	var amdf_cum_norm = new Array(max_lag);
	amdf_cum[0] = amdf[0];
	for (var i = 1; i < amdf.length; i++) {
		amdf_cum[i] = amdf_cum[i-1] + amdf[i];
	}

	amdf_cum_norm[0] = 1;
	for (var i = 1; i < amdf.length; i++) {	
		var amdf_cum_mean = (amdf_cum[i]+0.000001)/(i+1);
		amdf_cum_norm[i] = amdf[i]/amdf_cum_mean;
	}

	// Absolute threshold
	var peak_index = 0;
	var peak_periodicity = 0;
	var threshold = 0.2;

	for (var i = 1; i < (amdf_cum_norm.length-1); i++) {
		// peak detection (actually, valley detection)
		if ( (amdf_cum_norm[i-1] > amdf_cum_norm[i]) && (amdf_cum_norm[i] < amdf_cum_norm[i+1]) ) {
			if ( amdf_cum_norm[i] < threshold ) {
				peak_index = i;
				peak_periodicity = 1.0 - amdf_cum_norm[i];
				break;		
			}
		}
	}

	// Convert to Frequency 
	var pitch;
	if (peak_index > 0 ) {
		// parabolic interpolation could be added
		pitch = 11025.0/peak_index;
	}
	else {
		pitch = 0.0;
		peak_periodicity = 1.0;
		for (var i = 0; i < amdf_cum_norm.length; i++) {
			if (peak_periodicity > amdf_cum_norm[i]) {
				pitch = 0;
				peak_periodicity = amdf_cum_norm[i];
			}
		}
	}

	return [pitch, peak_periodicity];

}

