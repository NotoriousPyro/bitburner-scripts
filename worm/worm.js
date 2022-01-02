/** @param {NS} ns **/
export async function main(ns) {
	var destination = ns.args[0];
	if (destination == "home") {
		return;
	}
	else if (destination != null && destination.trim() != "") {
		await go(ns, destination);
	}
	else {
		var destinations = ns.scan();
		ns.print("Found " + destinations.length + " new friends to worm.");
		for (var destination of destinations) {
			if (destination == "home") {
				continue;
			}
			ns.print("Infecting new friend " + destination);
			await go(ns, destination);
		}
	}
	await process(ns);
}

/** @param {NS} ns **/
async function go(ns, destination) {
	await copy(ns, destination);
	exec(ns, destination);
}

/** @param {NS} ns **/
function exec(ns, destination) {
	var availMem = ns.getServerMaxRam(destination) - ns.getServerUsedRam(destination);
	var scriptRequiredMem = ns.getScriptRam("worm.js", destination);
	// This returns the maximum amount of threads we can run with based on the free memory and script requirements
	var maxThreads = Math.floor(availMem / scriptRequiredMem);
	// Can we run with even one thread?
	if (maxThreads == 0) {
		ns.print("Not enough free memory on host server to run one thread. Aborting.");
		ns.rm("worm.js", destination);
		return;
	}

	// Run the worm
	var res = ns.exec("worm.js", destination, maxThreads);

	if (res == 0) {
		ns.print("Failed to infect new friend: " + destination)
		ns.rm("worm.js", destination);
		return;
	}
	
	ns.print("Infected new friend: " + destination)
}

/** @param {NS} ns **/
async function copy(ns, destination) {
	var source = ns.getHostname();

	// If we have the BruteSSH.exe program, use it to open the SSH Port
	// on the target server
	if (ns.fileExists("BruteSSH.exe", "home")) {
		ns.brutessh(destination);
	}

	// Get root access to target server
	ns.nuke(destination);
	// Copy the hack script
	await ns.scp("worm.js", source, destination);
}

/** @param {NS} ns **/
async function process(ns) {
	var self = ns.getHostname();
	if (self == "home") {
		return;
	}
	
	// Defines how much money a server should have before we hack it
	// In this case, it is set to 75% of the server's max money
	var moneyThresh = ns.getServerMaxMoney(self) * 0.75;

	// Defines the maximum security level the target server can
	// have. If the target's security level is higher than this,
	// we'll weaken it before doing anything else
	var securityThresh = ns.getServerMinSecurityLevel(self) + 5;

	// Infinite loop that continously hacks/grows/weakens the target server
	while(true) {
		if (ns.getServerSecurityLevel(self) > securityThresh) {
			// If the server's security level is above our threshold, weaken it
			await ns.weaken(self);
		} else if (ns.getServerMoneyAvailable(self) < moneyThresh) {
			// If the server's money is less than our threshold, grow it
			await ns.grow(self);
		} else {
			// Otherwise, hack it
			await ns.hack(self);
		}
	}
}