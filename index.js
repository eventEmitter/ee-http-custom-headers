var parser      = require('./lib/parser/HeaderParser.js'),
    log         = require('ee-log'),
    Class       = require('ee-class'),
    NodeCollection = require('./lib/nodes/NodeCollection');

var PrettyPrinter = new Class({
    buffer: ''
    , visitActionNode: function(node){
        var buffer = node.accept(this)+' ( ';
        node.getParameter().forEach(function(item){
            buffer+= ' , ';
            buffer+= item.accept(this);
        });
        buffer += ' ) ';
        return buffer;
    }
    , visitNamedNode: function(node){
        return node.getName();
    }
    , visitPropertyNode: function(node){
        return node.getNames().join(' . ');
    }
    , visitVariableNode: function(node){
        return node.getName();
    }
    , visitComparisonNode: function(node){
        return node.getValue().accept(this)+" "+node.getOperator()+" "+node.getProperty().accept(this);
    }
    , visitValueNode: function(node){
        return node.toString();
    }
    , visitNodeCollection: function(node){
        var result = []
        node.forEach(function(item){
            result.append(item.accept(this));
        })
        return result;
    }

    , prettyPrint: function(node){
        return node.accept(this).join(' AND ');
    }
});

var printer = new PrettyPrinter();
for(var name in printer){
    if(typeof printer[name] == 'function'){
        console.log(name);
    }
}
var result = parser.parse('user.id!=[100, 200], created>bigger(2000-10-01)', 'filter');
log(printer.prettyPrint(result));