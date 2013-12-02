var parser = require('./lib/parser/HeaderParser.js'),
    log = require('ee-log');


log(parser.parse("halo.dings.bums", "select").pop().getHierarchy());
/*
log(parser.parse("halo.dings.bums", "name_dotted"));
log(parser.parse("[1, 3, 4]", "array"));
log(parser.parse("action(1, 3, false)", "function"));
log(parser.parse("id, thing.dings"), "select");
log(parser.parse("id=10, created!=null", "filter"));
log(parser.parse("id, created DESC", "order"));*/

/*log(parser.parse("dings.id>2013-20-12", "comp"));*/
