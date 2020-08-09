
var r = require('ts-node').register();
var {handler} = require('./src/index');
var {SimulateLamdba} = require("aws-lambda-helper");
require('dotenv').config()

SimulateLamdba.run(8080, handler);
console.log('running on 8080.....');
