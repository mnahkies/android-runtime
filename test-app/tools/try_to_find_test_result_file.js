var
	searchForFile = require('child_process').exec,
	execFindFile = require('child_process').exec,
	checkIfAppIsRunning = require('child_process').exec,
	fs = require('fs'),
	pullfile,

	isTimeToExit = false,

	processTimeout = 20 * 60 * 1000, // 20 minutes timeout (empirical constant :)) 
	searchInterval = 10 * 1000;

searchForFile("", getFile);

var runOnDeviceOrEmulator = process.argv[2];

function getFile(error, stdout, stderr) {
	closeProcessAfter(processTimeout);
	setInterval(tryToGetFile, searchInterval);
};

function closeProcessAfter(timeout) {
	//this will force process closed even if the the file is not found
	setTimeout(function () { isTimeToExit = true; }, timeout);
}

function tryToGetFile() {
	var checkApp = checkIfAppIsRunning("adb " + runOnDeviceOrEmulator + " shell \"ps | grep com.tns.android_runtime_testapp\"", checkIfProcessIsRunning);
	pullfile = execFindFile("adb " + runOnDeviceOrEmulator + " pull /sdcard/android_unit_test_results.xml", checkIfFileExists);
	pullfile.stdout.pipe(process.stdout, { end: false });
	pullfile.stderr.pipe(process.stderr, { end: false });
}

function checkIfProcessIsRunning(err, stdout, stderr) {
	if(stdout) {
		console.log("com.tns.android_runtime_testapp process is running")
	}
	else {
		console.log('com.tns.android_runtime_testapp process died!');
		process.exit(1);
	}

}

function checkIfFileExists(err, stout, stderr) {

	//if you find file in sdcard exit process
	if (!err) {
		console.log('Tests results file found file!');
		process.exit();
	}
	else {
		//if the time to get the file is out exit process
		if (isTimeToExit) {
			console.log(err);
			console.log('Tests results file not found!');
			process.exit(1);
		}
	}
}
