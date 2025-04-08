/** @param {NS} ns */
export async function main(ns) {
  const scriptName = ns.getScriptName();
  const currentHost = ns.getHostname();
  const failedTargets = new Set(); // Keep track of targets we failed to get root on
  const infected = new Set([currentHost]); // Keep track of already infected servers, starting with current
  const hackScript = "hack.js";

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

    // Special case for 'n00dles'
    if (target === "n00dles") {
      await ns.scp(hackScript, target, currentHost);
      ns.print(`Successfully copied ${hackScript} to ${target}`);

      if (!ns.isRunning(hackScript, target, target)) {
        const scriptRam = ns.getScriptRam(hackScript, target);
        const availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
        let threads = Math.floor(availableRam / scriptRam);

        // Ensure threads is at least 1
        if (threads < 1) {
          threads = 1;
        }
        const pid = ns.exec(hackScript, target, threads, target); // Execute with target as argument
        if (pid === 0) {
          ns.tprint(`Failed to execute ${hackScript} on ${target}`);
          return false; // Indicate failure
        }
        ns.print(`Successfully executed ${hackScript} on ${target} with ${threads} threads and PID ${pid}`);
      } else {
        ns.print(`${hackScript} is already running on ${target}`);
      }
      infected.add(target); // Add to infected list
      return true;
    }

    // Copy the script to the target server
    await ns.scp(scriptName, target, currentHost);
    ns.print(`Successfully copied ${scriptName} to ${target}`);

    // Calculate the maximum number of threads that can be run
    // Moved calculation right before execution
    

    // Execute the script on the target server
    if (!ns.isRunning(scriptName, target, target)) {
      const scriptRam = ns.getScriptRam(scriptName, target);
      const availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
      let threads = Math.floor(availableRam / scriptRam);

      // Ensure threads is at least 1
      if (threads < 1) {
        threads = 1;
      }
      const pid = ns.exec(scriptName, target, threads, target); // Execute with target as argument
      if (pid === 0) {
        ns.tprint(`Failed to execute ${scriptName} on ${target}`);
        return false; // Indicate failure
      }
      ns.print(`Successfully executed ${scriptName} on ${target} with ${threads} threads and PID ${pid}`);
    } else {
      ns.print(`${scriptName} is already running on ${target}`);
    }

    infected.add(target); // Add to infected list
    return true; // Indicate success
  }

  // Recursive infection function
  async function spreadInfection(startHost) {
    const scannedServers = ns.scan(startHost);

    for (const target of scannedServers) {
      if (target === "home") continue;
      if (failedTargets.has(target) || infected.has(target)) continue;

      if (await infect(target)) {
        // If infection was successful, recursively spread from the new host
        await spreadInfection(target);
      }
    }
  }

  // Initial spread
  await spreadInfection(currentHost);

  // Post-infection operations: weaken, grow, hack
  while (true) {
    let targets = [...infected];
    
    targets = targets.filter(target => target !== currentHost); // Don't target the current host if other servers exist
    if (targets.length === 0) {
      targets = [currentHost];
    }

    for (const target of targets) {
      if (!ns.hasRootAccess(target)) {
        failedTargets.add(target);
        continue;
      }

      // Skip servers with $0 max money
      if (ns.getServerMaxMoney(target) === 0) {
        ns.print(`Skipping ${target} because it has $0 max money.`);
        continue;
      }

      // Perform weaken, grow, hack loop
      if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
        await ns.weaken(target);
      }

      if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
        await ns.grow(target);
      }

      await ns.hack(target);
    }

    // If there are no valid targets, target the current host
    if (targets.every(target => ns.getServerMaxMoney(target) === 0 || !ns.hasRootAccess(target))) {
      const currentHostTarget = ns.getHostname();
      if (ns.getServerSecurityLevel(currentHostTarget) > ns.getServerMinSecurityLevel(currentHostTarget)) {
        await ns.weaken(currentHostTarget);
      }

      if (ns.getServerMoneyAvailable(currentHostTarget) < ns.getServerMaxMoney(currentHostTarget)) {
        await ns.grow(currentHostTarget);
      }

      await ns.hack(currentHostTarget);
    }
    await ns.sleep(1000); // Add a 1-second delay
  }
}
