var Class   = require('ee-class');

/*
 * Currently just an intermediate class to represent sequences of nodes.
 */
var NamedNode = module.exports = new Class({

      name : null
    , _type: 'NamedNode'

    , init: function(name){
        this.name = name || '';
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

    , toString: function(){
        return this.name;
    }
});