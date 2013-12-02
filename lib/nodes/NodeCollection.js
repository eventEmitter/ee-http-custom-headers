var Class   = require('ee-class');

/*
 * Currently just an intermediate class to represent sequences of nodes.
 */
var NodeCollection = module.exports = Class({
    inherits: Array
    , init: function(items){
        for(var i = 0; i<items.length; i++){
            this.push(items[i]);
        }
    }
    , accept: function(visitor){
        return visitor.visitNodeCollection(this);
    }
});