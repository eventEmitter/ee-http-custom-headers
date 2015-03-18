var Class   = require('ee-class');

var Collection = require('./Collection');

/**
 * Represents collection of nodes.
 */
var ArrayCollection = module.exports = new Class({

      _type     : 'Array Collection'
    , inherits  : Collection

    , accept: function(visitor){
        return visitor.visitArrayCollection(this);
    }
});