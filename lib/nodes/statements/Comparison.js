var Class           = require('ee-class'),
    log             = require('ee-log'),
    ValueNode       = require('./../ValueNode');

var Comparison = module.exports = new Class({

      comparator: null
    , identifier: null
    , value:      null

    , _type:    "Comparison"

    , init : function initialize(identifier, comparator, value){
        this.identifier = identifier;
        this.comparator = comparator;
        this.value      = value;
    }

    , comparatorIs : function(comp){
        return this.comparator.toLowerCase() === comp.toLowerCase();
    }

    , accept : function(visitor){
        return visitor.visitComparison(this);
    }

    , clone : function() {
        return new Comparison(this.identifier.clone(), this.comparator, this.value.clone());
    }

});