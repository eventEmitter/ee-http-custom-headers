var log         = require('ee-log'),
    Class       = require('ee-class');

var PrettyPrinter = module.exports = new Class({

    _type: 'Pretty Printerio'
    , buffer : null

    , init :function(){
        this.buffer = [];
    }

    , visitActionNode : function(node) {

        var params          = node.getParameters(),
            parameterBuffer;

        parameterBuffer = params.map(function(parameter){
            return parameter.accept(this);
        });

        return node.getName()+'('+parameterBuffer.join(' , ')+')';
    }

    , visitNamedNode: function(node){
        return node.getName();
    }
    /**
     * A variable node can now represent multiple accesses.
     * @param node
     */
    , visitVariableNode: function(node){
        var   names = [];
        this.buffer.push(node.getName());
        if(node.hasAccesses()){
            this.buffer.push('[');
            node.getAccesses().forEach(function(access){
                access.accept(this);
                this.buffer.push(' , ');
            }, this);
            this.buffer.pop();
            this.buffer.push(']');
        }
    }

    , visitComparisonNode: function(node){
        return node.getValue().accept(this)+"\t"+node.getOperator()+"\t"+node.getVariable().accept(this);
    }

    , visitValueNode: function(node){
        return node.toString();
    }
    , visitNodeCollection : function(collection) {
        return collection.map(function(node){
            return node.accept(this);
        }, this);
    }

    , visitOrderStatement: function(node){
        return '\nORDER-BY:\n\t'+this.visitNodeCollection(node).join('\n\t')
    }

    , visitOrderItem: function(node){
        return node.getProperty().accept(this) + ' ' + node.getDirection();
    }
    , visitFilterStatement: function(node){
        return '\nFILTER: \n\t'+this.visitNodeCollection(node).join('\n\tAND\t');
    }

    , visitSelectStatement: function(node){
        return '\nSELECT:\n\t'+this.visitNodeCollection(node).join(',\n\t');
    }

    , prettyPrint: function(node){
        this.buffer = [];
        node.accept(this);
        return this.buffer.join('');
    }
});