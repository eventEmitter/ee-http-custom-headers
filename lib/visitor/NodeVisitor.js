"use strict";

var Class = require('ee-class')
    , Types = require('ee-types')
    , log = require('ee-log');

/**
 * Depth first visitor.
 */
var NodeVisitor = module.exports = new Class({
    visitComparison: function(comparison){
        return [
              comparison.identifier.accept(this)
            , comparison.comparator
            , comparison.value.accept(this) ];
    }

    , visitChoice: function(choice){
        return this.visitCollection(choice);
    }

    , visitCollection: function(coll){
        return this._visitArray(coll);
    }

    , visitArrayCollection: function(arr){
        return this.visitCollection(arr);
    }

    , _visitArray: function(arr){
        var result = [];
        for(var i = 0, len = arr.length;i<len;i++){
            result.push(arr[i]);
        }
        return result;
    }

    , visitSequence: function(sequence){
        return this.visitCollection(sequence);
    }

    , visitFilterStatement: function(node){
        return this.visitSequence(node);
    }

    , visitOrderStatement: function(node){
        return this.visitSequence(node);
    }

    , visitSelectStatement: function(node){
        return this.visitSequence(node)
    }

    , visitActionNode: function(node){
        return [  this.visitNamedNode(node)
                , this.visitSequence(node.parameters) ];
    }

    , visitIdentifier: function(node){
        return [this.visitNamedNode(node)].concat(node.accesses);
    }

    , visitNamedNode: function(node){
        return node.name;
    }

    , visitValueNode: function(node){
        return node.value;
    }

    , visitOrdering: function(node){
        return [ node.value.accept(this),
                 node.direction ]
    }
});