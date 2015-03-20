var   Class         = require('ee-class')
    , Types         = require('ee-types')
    , Collection    = require('./Collection');

/**
 * Represents collection of nodes connected with an AND operator (in our case a ',')
 */
var Sequence = module.exports = new Class({

      inherits: Collection

    , _type: 'Sequence'

    , accept: function(visitor){
        return visitor.visitSequence(this);
    }

    , clone: function(){
        return this.cloneAllAs(Sequence);
    }
});