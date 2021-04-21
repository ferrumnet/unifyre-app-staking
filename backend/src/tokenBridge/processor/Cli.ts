import { processOneWay } from "./BridgeProcessor";
console.log('Starting ');
//processOneWay('BSC_TESTNET').catch(console.error);
processOneWay('RINKEBY').catch(console.error);