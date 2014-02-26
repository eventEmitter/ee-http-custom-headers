var log         = require('ee-log'),
    Class       = require('ee-class');

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
        var names = node.getNames().join('.');
        if(!node.hasTags()){
            return names;
        }
        return names+' '+node.getTags().join(' ');
    }
    , visitVariableNode: function(node){
        return this.visitPropertyNode(node);
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

    , visitOrderStatement: function(node){
        return '\nORDER-BY:\n\t'+this.visitNodeCollection(node).join('\n\t')
    }

    , visitFilterStatement: function(node){
        return '\nFILTER: \n\t'+this.visitNodeCollection(node).join('\n\tAND\t');
    }

    , visitSelectStatement: function(node){
        return '\nSELECT:\n\t'+this.visitNodeCollection(node).join(',\n\t');
    }
    , prettyPrint: function(node){
        return node.accept(this);
    }
});