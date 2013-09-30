//
// Deprecated non-Mocha Test
//

var exec = require('child_process').exec;

var command = "./bin/background-imager-cli.js test/images/ -u images/ | diff test/noodle.css -"

var child = exec(command, function(err, stdout, stderr) {
    
    // diff doesn't output anything if files are the same
    if (stdout === null || stdout === "" || stdout === "\n") {
    	console.log("Test PASSED\n");
    } else {
		// output diff and error msg
		console.log(stdout);
		console.error(stderr);
		console.log("Test FAILED\n");
    }

    // for whatever reason failed test also results in error?
    if (err) {
    	console.error(err);

    	throw err; // there was an error executing command
    }
 
});