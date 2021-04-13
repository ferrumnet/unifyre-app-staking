import { processOneWay } from "./BridgeProcessor";

console.log('Starting ');
processOneWay('RINKEBY').catch(console.error);