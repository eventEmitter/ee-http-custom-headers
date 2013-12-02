var log         = require('ee-log'),
    Class       = require('ee-class');
var showMethods = function(obj){
    for(var name in obj){
        if(typeof obj[name] == 'function'){
            console.log(name);
        }
    }
};
var PrettyPrinter = module.exports = new Class({
    _type: 'Pretty Printerio'
    , visitActionNode: function(node){
        var params = node.getParameters(),
            parameterBuffer = [];

        for(var i=0; i<params.length; i++){
            parameterBuffer.push(params.at(i).accept(this));
        }

        return node.getName()+'('+parameterBuffer.join(' , ')+')';
    }

    , visitNamedNode: function(node){
        return node.getName();
    }
    , visitPropertyNode: function(node){
        return node.getNames().join('.');
    }
    , visitVariableNode: function(node){
        return node.getName();
    }

    , visitComparisonNode: function(node){
        return node.getValue().accept(this)+"\t"+node.getOperator()+"\t"+node.getProperty().accept(this);
    }

    , visitValueNode: function(node){
        return node.toString();
    }
    , visitNodeCollection: function(node){
        var result = [];
        for(var i=0; i<node.length; i++){
            result.push(node.at(i).accept(this));
        }
        return result;
    }

    , prettyPrint: function(node){
        return node.accept(this);
    }
});