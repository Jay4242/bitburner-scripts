/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("scan");
    ns.disableLog("ls");

    /**
     * Recursively scans the network and lists contract files, showing the path.
     * @param {string} startServer - The server to start scanning from.
     * @param {Set<string>} visitedServers - A set to track visited servers to avoid loops.
     * @param {string[]} path - The path to the current server.
     * @param {string[]} connectCommands - Array to store the connect commands.
     */
    async function findContracts(startServer, visitedServers, path, connectCommands) {
        visitedServers.add(startServer);
        const connectedServers = ns.scan(startServer);

        for (const server of connectedServers) {
            if (!visitedServers.has(server)) {
                await findContracts(server, visitedServers, [...path, server], connectCommands);
            }
        }

        const contractFiles = ns.ls(startServer, ".cct");
        if (contractFiles.length > 0) {
            let connectString = "";
            for (let i = 1; i < path.length; i++) {
                connectString += `connect ${path[i]} ; `;
            }
            connectString = connectString.slice(0, -3); // Remove the trailing " ; "
            connectCommands.push(connectString);

            ns.tprint(`\nContracts found on ${startServer} (Connect: ${connectString}):`);
            for (const contract of contractFiles) {
                ns.tprint(`  ${contract}`);
            }
        }
    }

    const visited = new Set();
    const connectCommands = [];
    await findContracts("home", visited, ["home"], connectCommands);

    // Output all connect commands
    /*
    if (connectCommands.length > 0) {
        ns.tprint("\n--- Connect Commands ---");
        connectCommands.forEach(cmd => ns.tprint(cmd));
    } else {
        ns.tprint("\nNo contracts found.");
    }
    */
    if (connectCommands.length === 0) {
        ns.tprint("\nNo contracts found.");
    }
}
