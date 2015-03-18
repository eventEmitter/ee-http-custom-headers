var Class   = require('ee-class');

/**
 * Node with a name such as an identifer
 */
var NamedNode = module.exports = new Class({

    name : null

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

    , clone: function(){
        return new NamedNode(this.name);
    }
});