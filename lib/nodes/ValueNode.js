var Class   = require('ee-class'),
    log     = require('ee-log');

var ValueNode = module.exports = new Class({

      _type: "ValueNode"
    , value: null

    , init: function(value){
        this.value = value || null;
    }

    , getValue: function(){
        return this.value;
    }

    , accept: function(visitor){
        return visitor.visitValueNode(this);
    }

    , toString: function(){
        return this.isNull() ? 'null': this.value.toString();
    }

    , isNull: function(){
        return this.value === null
    }

    , clone: function(){
        return new ValueNode(this.value);
    }
});