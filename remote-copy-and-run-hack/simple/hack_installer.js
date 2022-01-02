export async function main(ns) {
	var destination = ns.args[0];
	
	// If we have the BruteSSH.exe program, use it to open the SSH Port
	// on the target server
	if (ns.fileExists("BruteSSH.exe", "home")) {
		ns.brutessh(destination);
	}

	// Get root access to target server
	ns.nuke(destination);

	// Copy the hack script
	await ns.scp("hack.js", "home", destination);

	// Run the hack script
	var res = ns.exec("hack.js", destination);
	
	if (res == 0) {
		// Delete the script if it fails
		ns.rm("hack.js", destination);
		throw "Failed"
	}
}