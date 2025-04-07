/** @param {NS} ns */
export async function main(ns) {
  const visited = new Set();
  const stack = ["home"];

  while (stack.length > 0) {
    const server = stack.pop();

    if (visited.has(server)) {
      continue;
    }

    visited.add(server);

    ns.killall(server);
    ns.print(`Killed all scripts on ${server}`);

    const connectedServers = ns.scan(server);
    for (const connectedServer of connectedServers) {
      if (!visited.has(connectedServer)) {
        stack.push(connectedServer);
      }
    }
  }

  ns.tprint("All scripts on all connected servers have been killed.");
}
