var Class   = require('ee-class')
    , Types = require('ee-types');

var Collection = require('./Collection');

/**
 * Represents collection of nodes connected with an AND operator (in our case a ',')
 */
var Choice = module.exports = new Class({

      inherits: Collection

    , _type: "Choice"

    , accept: function(visitor) {
        return visitor.visitChoice(this);
    }

    , clone: function(){
        return this.cloneAllAs(Choice);
    }
});