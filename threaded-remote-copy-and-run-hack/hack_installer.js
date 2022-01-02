export async function main(ns) {
	var destination = ns.args[0];
	var threads = 1;
	if (Number.isInteger(ns.args[1]) && ns.args[1] >= 1) {
		threads = ns.args[1];
	}
	
	// If we have the BruteSSH.exe program, use it to open the SSH Port
	// on the target server
	if (ns.fileExists("BruteSSH.exe", "home")) {
		ns.brutessh(destination);
	}

	// Get root access to target server
	ns.nuke(destination);

	var availMem = ns.getServerMaxRam(destination) - ns.getServerUsedRam(destination);
	var scriptRequiredMem = ns.getScriptRam("hack.js", destination);
	// This returns the maximum amount of threads we can run with based on the free memory and script requirements
	var maxThreads = Math.floor(availMem / scriptRequiredMem);
	// Can we run with even one thread?
	if (maxThreads == 0) {
		throw "Not enough free memory on target server to even run one thread. Aborting.";
	}
	// Can we run with the requested threads?
	if (threads > maxThreads) {
		threads = maxThreads;
		ns.tprint("Insufficient free memory on target server for requested target threads. Running with determined max: " + maxThreads);
	}

	// Copy the hack script
	await ns.scp("hack.js", "home", destination);

	// Run the hack script
	var res = ns.exec("hack.js", destination, threads);

	if (res == 0) {
		throw "Failed"
	}
}