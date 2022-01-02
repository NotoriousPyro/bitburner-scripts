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

	var availMem = ns.getServerMaxRam(destination) - ns.getServerUsedRam(destination);
	var scriptRequiredMem = ns.getScriptRam("hack.js", destination);
	// This returns the maximum amount of threads we can run with based on the free memory and script requirements
	var maxThreads = Math.floor(availMem / scriptRequiredMem);
	// Can we run with even one thread?
	if (maxThreads == 0) {
		ns.rm("hack.js", destination);
		throw "Not enough free memory on target server to even run one thread. Aborting.";
	}

	// Run the hack script
	var res = ns.exec("hack.js", destination, maxThreads);

	if (res == 0) {
        // Delete the script if it fails
        ns.rm("hack.js", destination);
		throw "Failed"
	}
}