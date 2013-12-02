var Class   = require('ee-class');

/*
 * Currently just an intermediate class to represent sequences of nodes.
 */
var NamedNode = module.exports = Class({
    name : null
    , init: function(options){
        this.name = options.name || '';
    }
    , getName: function(){
        return this.name;
    }
    , hasName: function(){
        return (this.name.length != 0);
    }
    , accept: function(visitor){
        return visitor.visitNamedNode(this);
    }
});