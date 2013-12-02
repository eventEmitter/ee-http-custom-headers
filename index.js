var parser      = require('./lib/parser/HeaderParser.js'),
    log         = require('ee-log'),
    Class       = require('ee-class'),
    NodeCollection = require('./lib/nodes/NodeCollection'),
    PrettyPrinter = require('./example/PrettyPrinter');

var pri = new PrettyPrinter();
var result = parser.parse('user.mail!=null, user.birthday<diff(2013-11-10, NOW())', 'filter');
console.log(pri.prettyPrint(result).join('\t AND \n'));