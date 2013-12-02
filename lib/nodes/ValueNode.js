var Class   = require('ee-class'),
    log     = require('ee-log');

var ValueNode = module.exports = new Class({
    _type: "ValueNode",
    value: null
    , init: function(options){
        this.value = options.value || null;
    }

    , getValue: function(){
        return this.value;
    }

    , accept: function(visitor){
        log(this);
        log('Entering a value node');
        // Here the visitor all of a sudden is a giant motherfucker of an object
        // log(visitor);
        return visitor.visitValueNode(this);
    }

    , toString: function(){
        return this.isNull() ? 'null': this.value.toString();
    }

    , isNull: function(){
        return this.value === null
    }
});