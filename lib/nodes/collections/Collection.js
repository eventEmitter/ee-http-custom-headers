var Class   = require('ee-class');

/**
 * Represents collection of nodes.
 */
var Collection = module.exports = new Class({

      inherits: Array

    , first: {
        get: function(){
            return this.at(0);
        }
    }

    , last: {
        get: function(){
            return this.at(this.length - 1);
        }
    }

    , _type: "Collection"

    , init: function(items){
        items = items || [];
        for(var i = 0; i<items.length; i++){
            this.push(items[i]);
        }
    }

    , at: function(index){
        return this[index];
    }

    , isEmpty: function(){
        return this.length === 0;
    }

    , accept: function(visitor) {
        return visitor.visitCollection(this);
    }

    , clone: function(){
        return new Collection(this.map(function(item){
            if(Types.function(item.clone)) return item.clone();
            return item;
        }));
    }
});