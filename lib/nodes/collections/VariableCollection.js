var   Class      = require('ee-class')
    , Types      = require('ee-types')
    , Collection = require('./Collection');

/*
 * Currently just an intermediate class to represent sequences of nodes.
 */
var VariableCollection = module.exports = new Class({

      inherits: Collection
    , itemMap: null
    , _type: "VariableCollection"

    , init: function init (items){
        this.itemMap = {};
        init.super.call(this, items);
    }

    , hasItem: function(key){
        return !Types.undefined(this.getItem(key));
    }

    , getItem: function(key){
        return this.itemMap[key];
    }

    , addItem: function(variableNode){
        var key = variableNode.getName();
        if(this.hasItem(key)){
            var node = this.getItem(key);
            node.merge(variableNode);
        } else {
            this.itemMap[key] = variableNode;
            this.push(variableNode);
        }
    }
});