var PrettyPrint = require('./PrettyPrinter'),
    log = require('ee-log'),
    header = require('../.')
    , Visitor = require('../lib/visitor/NodeVisitor');


var vis = new Visitor();

var printer     = new PrettyPrint(),
    parseOrder  = header.parseOrder('user.id, user.created DESC'),
    parseFilter = header.parseFilter('(user.created < 2013-01-01 | user.name!=startswith("j")) , user.state=max(["vip", "prom"])'),
    parseSelect = header.parseSelect('id, firstName, lastName, profile.id');

log(printer.prettyPrint(parseOrder));
log(printer.prettyPrint(parseFilter));
log(printer.prettyPrint(parseSelect));

parseFilter.accept(vis);