var Class   = require('ee-class');

/*
 * Currently just an intermediate class to represent sequences of nodes.
 */
var NodeCollection = Class({
    inherits: Array
    , accept: function(visitor){
        return visitor.visitNodeCollection(this);
    }
});