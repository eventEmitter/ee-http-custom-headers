var parser = require('./_HeaderParser');
var parseFunc = parser.parse.bind(parser);
parser.parse = function(value, rule){
    return parseFunc(value, {startRule: rule});
};
module.exports = parser;