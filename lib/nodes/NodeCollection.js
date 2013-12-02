var Class   = require('ee-class');

/*
 * Currently just an intermediate class to represent sequences of nodes.
 */
var NodeCollection = module.exports = new Class({
    inherits: Array
    , _type: "NodeCollection"
    , init: function(items){
        for(var i = 0; i<items.length; i++){
            this.push(items[i]);
        }
    }
    , at: function(index){
        return this[index];
    }
    , accept: function(visitor){
        return visitor.visitNodeCollection(this);
    }
});