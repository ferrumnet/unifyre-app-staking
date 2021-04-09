
var r = require('ts-node').register();
var {handler} = require('./src/index');


var {SimulateLamdba} = require("aws-lambda-helper");
require('dotenv').config()
//mongodb+srv://test_user:sTiTyCHLoermiCkImerwOry@testdata.2k48y.gcp.mongodb.net/ferrumaddress_test?retryWrites=true&w=majority
//mongodb+srv://temp_staking_user:RmusIgHAliTUreYOnTeRvIDamEmBanGeLdercurtoriablaUcUr@prod-unifyre.2k48y.gcp.mongodb.net/pooldrop?retryWrites=true&w=majority
SimulateLamdba.run(8080, handler);
console.log('running on 8080.....');
