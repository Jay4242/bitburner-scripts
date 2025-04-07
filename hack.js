/** @param {NS} ns */
export async function main(ns) {
  const target = ns.getHostname();

  while (true) {
    while (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
      await ns.weaken(target);
    }

    while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
      await ns.grow(target);
    }
    await ns.hack(target);
  }
}
