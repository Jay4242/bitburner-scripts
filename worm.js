/** @param {NS} ns */
export async function main(ns) {
  const scriptName = ns.getScriptName();
  const currentHost = ns.getHostname();
  const failedTargets = new Set(); // Keep track of targets we failed to get root on
  const infected = new Set([currentHost]); // Keep track of already infected servers, starting with current

  // Function to attempt gaining root access
  async function gainRootAccess(target) {
    try { ns.brutessh(target); } catch { }
    try { ns.ftpcrack(target); } catch { }
    try { ns.relaysmtp(target); } catch { }
    try { ns.sqlinject(target); } catch { }
    try { ns.nuke(target); } catch { }

    return ns.hasRootAccess(target);
  }

  // Function to infect a target server
  async function infect(target) {
    if (infected.has(target)) return true; // Skip if already infected

    ns.print(`Attempting to infect ${target}`);

    // Check if we have root access, if not, try to gain it
    if (!ns.hasRootAccess(target)) {
      if (!await gainRootAccess(target)) {
        ns.tprint(`Failed to get root access on ${target}`);
        failedTargets.add(target); // Add to failed targets
        return false; // Indicate failure
      }
    }

    // Copy the script to the target server
    await ns.scp(scriptName, target, currentHost);
    ns.print(`Successfully copied ${scriptName} to ${target}`);

    // Execute the script on the target server
    if (!ns.isRunning(scriptName, target, target)) {
      const pid = ns.exec(scriptName, target, 1, target); // Execute with target as argument
      if (pid === 0) {
        ns.tprint(`Failed to execute ${scriptName} on ${target}`);
        return false; // Indicate failure
      }
      ns.print(`Successfully executed ${scriptName} on ${target} with PID ${pid}`);
    } else {
      ns.print(`${scriptName} is already running on ${target}`);
    }

    infected.add(target); // Add to infected list
    return true; // Indicate success
  }

  // Recursive infection function
  async function spreadInfection() {
    const scannedServers = ns.scan(currentHost);

    for (const target of scannedServers) {
      if (target === "home" || failedTargets.has(target) || infected.has(target)) continue;

      if (await infect(target)) {
        // If infection was successful, recursively spread from the new host
        const pid = ns.exec(scriptName, target, 1, target); // Start worm on new host
        if (pid === 0) {
          ns.tprint(`Failed to execute ${scriptName} on ${target}`);
        }
      }
    }
  }

  // Initial spread
  await spreadInfection();

  // Post-infection operations: weaken, grow, hack
  while (true) {
    for (const target of infected) {
      if (target === currentHost) continue; // Don't target the current host

      if (!ns.hasRootAccess(target)) {
        failedTargets.add(target);
        continue;
      }

      while (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
        await ns.weaken(target);
      }

      while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
        await ns.grow(target);
      }

      // If hack.js doesn't exist on the target, copy it
      if (!ns.fileExists("hack.js", target)) {
        await ns.scp("hack.js", target, currentHost);
      }

      // Execute hack.js on the target
      if (!ns.isRunning("hack.js", target)) {
        ns.exec("hack.js", target);
      }
    }
    await ns.sleep(1000); // Add a 1-second delay
  }
}
