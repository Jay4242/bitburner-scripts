/** @param {NS} ns */
export async function main(ns) {
  const target = ns.getHostname();

  while (true) {
    if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
      await ns.weaken(target);
    }

    if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
      await ns.grow(target);
    }
    await ns.hack(target);
  }
}
