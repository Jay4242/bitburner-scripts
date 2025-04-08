/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("scan");
    ns.disableLog("ls");

    /**
     * Recursively scans the network and lists contract files.
     * @param {string} startServer - The server to start scanning from.
     * @param {Set<string>} visitedServers - A set to track visited servers to avoid loops.
     */
    async function findContracts(startServer, visitedServers) {
        visitedServers.add(startServer);
        const connectedServers = ns.scan(startServer);

        for (const server of connectedServers) {
            if (!visitedServers.has(server)) {
                await findContracts(server, visitedServers);
            }
        }

        const contractFiles = ns.ls(startServer, ".cct");
        if (contractFiles.length > 0) {
            ns.tprint(`\nContracts found on ${startServer}:`);
            for (const contract of contractFiles) {
                ns.tprint(`  ${contract}`);
            }
        }
    }

    const visited = new Set();
    await findContracts("home", visited);
}
