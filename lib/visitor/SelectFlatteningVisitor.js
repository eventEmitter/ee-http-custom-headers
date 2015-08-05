var   Class = require('ee-class')
    , log   = require('ee-log');


var SelectFlatteningVisitor = module.exports = new Class({
     visitSelectStatement: function(selects){
        return this.visitNodeCollection();
    }

    , visitSelectItem: function(item){

    }

    , visitPropertyNode: function(node){

    }

    , visitNodeCollection: function(selects){
        return this.map(function(node){
            return node.accept(this);
        }, this);
    }
});