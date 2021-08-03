import { ValidationUtils } from "ferrum-plumbing";
import { argv } from "process";
import { processOneWay } from "./BridgeProcessor";
console.log('Starting ');
const net = 'RINKEBY';
// const net = 'BSC_TESTNET';
// const net = argv[2];
if (!net) {
    console.log('Syntax error: include network as an argument');
} else {
    processOneWay(net).catch(console.error);
}
