/**
 * Create intermediate representations from the parse tree.
 */
var Class = require('ee-class'),
    log = require('ee-log');

var NamedNode = Class({
    name : null
    , init: function(options){
        this.name = options.name || '';
    }
    , getName: function(){
        return this.name;
    }
    , hasName: function(){
        return (this.name.length != 0);
    }
});

var Property = Class({
    inherits: NamedNode
    , of: null
    , init: function initialize(options){
        initialize.parent(options);
        this.of = options.of || null;
    }

    , getParent: function(){
        return this.of;
    }
    , hasParent: function(){
        return this.of !== null;
    }
});

var Variable = Class({
    inherits: Property
    , tags: []
    , init: function initialize(options){
        initialize.parent(options);
        this.tags = options.tags || [];
    }

    , getTags: function(){
        return this.tags;
    }

    , hasTags: function(){
        return this.tags.length !== 0;
    }
});

var Comparison = Class({
    operator: null
});

var IR = module.exports = {
    name: function(name){
      return new Variable({name: name});
    }
    , name_dotted: function(names){
        var variable = new Variable({name: names.shift()}),
            property;

        while(names.length){
            var name = names.shift();
            property = new Property({name: name, of: variable});
            variable = property;
        }

        return variable;
    }
    , name_tagged: function(variable, tag){
        variable.getTags().push(tag);
        return variable;
    }
    , arr: function(items){
        return items.length ? items : [];
    }
    , func: function(name, params){
        return [name, params];
    }
    , select: function(items){
        return items;
    }
    , filter: function(comparisons){
        return comparisons;
    }
    , comp: function(name, operator, value){
        return [name, operator, value]
    }
    , date: function(date){
        return date;
    }
    , order: function(names){
        return names;
    }
};