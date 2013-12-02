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
    , accept: function(visitor){
        return visitor.visitNamedNode(this);
    }
});

var Action = Class({
    inherits: NamedNode
    , parameters: []
    , init: function initialize(options){
        initialize.parent(options);
        this.parameters = options.parameters || [];
    }
    , getParameters: function(){
        return this.parameters;
    }
    , hasParameters: function(){
        return this.parameters.length > 0;
    }
    , accept: function(visitor){
        return visitor.visitAction(this);
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

    , getRoot: function(){
        return this.hasParent() ? this.parent.getRoot() : this;
    }

    , getHierarchy: function(){
        if(this.hasParent()){
            var hierarchy = this.getParent().getHierarchy()
            hierarchy.push(this);
            return hierarchy;
        }
        return [this];
    }
    , accept: function(visitor){
        return visitor.visitProperty(this);
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
    , accept: function(visitor){
        return visitor.visitVariable(this);
    }
});

var Comparison = Class({
    operator: null
    , property: null
    , value: null
    , init: function initialize(options){
        this.operator = options.operator;
        this.property = options.property;
        this.value = options.value;
    }

    , getOperator: function(){
        return this.operator;
    }

    , getProperty: function(){
        return this.property;
    }

    , _hasOperator: function(op){
        return this.getOperator() === op;
    }
    , testsEquality: function(){
        return this._hasOperator('=');
    }
    , testsLessThan: function(){
        return this._hasOperator('<');
    }
    , testsMoreThan: function(){
        return this._hasOperator('>');
    }
    , testsLessOrEqual: function(){
        return this._hasOperator('<=');
    }
    , testsMoreOrEqual: function(){
        return this._hasOperator('>=');
    }
    , testsInequality: function(){
        return this._hasOperator('!=');
    }
    , accept: function(visitor){
        return visitor.visitComparison(this);
    }
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
        return new Action({name:name, parameters: params});
    }
    , select: function(items){
        return items;
    }
    , filter: function(comparisons){
        return comparisons;
    }
    , comp: function(name, operator, value){
        return new Comparison({operator: operator, property: name, value: value});
    }
    , date: function(year, month, day, hour, min, sec){
        return new Date(year, month-1, day, hour, min, sec, 0);
    }
    , order: function(names){
        return names;
    }
};