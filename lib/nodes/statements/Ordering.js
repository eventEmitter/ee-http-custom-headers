var   Class = require('ee-class')
    , log   = require('ee-log')
    , Types = require('ee-types');

var Ordering = module.exports = new Class({

      value:      null
    , direction:  null

    , _type:    "Ordering"

    , init: function initialize(value, direction){
        this.value      = value;
        this.direction  = Types.string(direction) ? direction.toUpperCase() : 'ASC';
    }

    , accept: function(visitor){
        return visitor.visitOrdering(this);
    }

    , clone: function(){
        return new Ordering(this.value.clone(), this.direction);
    }
});