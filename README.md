# Bitburner Scripts

This document describes the scripts in this repository.

## end.js

This script recursively traverses the network of connected servers, killing all running scripts on each server. It starts from the "home" server and explores all connected servers, ensuring that all scripts are terminated.

## hack.js

This script targets a specified server and continuously performs the following actions in a loop:
1.  Weakens the server's security level until it reaches the minimum.
2.  Grows the server's money until it reaches the maximum.
3.  Hacks the server to steal money.

This script is designed to be run on a server with root access to the target server.

## worm.js

This script is designed to spread across the network, gain root access to servers, and then continuously weaken, grow, and hack those servers.

The script performs the following actions:

1.  Spreads to connected servers by copying itself and executing.
2.  Attempts to gain root access to each server using various exploits (BruteSSH, FTPCrack, RelaySMTP, SQLInject, NUKE).
3.  Continuously weakens, grows, and hacks each infected server.
4.  If the script finds no connected servers other than itself, it will target itself for the weaken, grow, and hack loop.
