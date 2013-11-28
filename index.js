var parser = require('./ee-rest-header-parser.js'),
    log = require('ee-log');

log(parser.parse("halo.dings.bums", "name_dotted"));
/*
log(parser.parse("[1, 3, 4]", "array"));
log(parser.parse("action(1, 3, false)", "function"));
log(parser.parse("id, thing.dings"), "select");
log(parser.parse("id=10, created!=null", "filter"));
log(parser.parse("2010-10-10 12:04:14", "date"));
log(parser.parse("id, created DESC", "order"));*/
