var Class   = require('ee-class');

var NamedNode = require('./NamedNode');

/**
 * Node with a name such as an identifer
 */
var Identifier = module.exports = new Class({

      inherits:    NamedNode
    , _type:       'Identifier'
    , accesses:    null

    , init: function init (name, accesses){
        init.super.call(this, name);
        this.accesses = accesses || [];
    }

    , hasAccesses: function(){
        return this.accesses.length > 0;
    }

    , getAccesses: function(){
        return this.accesses;
    }

    , toString: function(){
        return [this.getName()].concat(this.accesses).join('.');
    }

    , accept: function(visitor){
        return visitor.visitIdentifier(this);
    }
});