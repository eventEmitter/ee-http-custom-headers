var Class   = require('ee-class');

/*
 * Currently just an intermediate class to represent sequences of nodes.
 */
var Collection = module.exports = new Class({

      inherits: Array
    , _type: "Collection"

    , init: function init (items){
        var elements = items || [];
        for(var i = 0; i<elements.length; i++){
            this.addItem(items[i]);
        }
    }

    , addItem : function(item){
        this.push(item);
    }

    , at: function(index){
        return this[index];
    }

    , accept: function(visitor) {
        return visitor.visitNodeCollection(this);
    }
});