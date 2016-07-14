var   Class     = require('ee-class')
    , Types     = require('ee-types')
    , log       = require('ee-log')
    , NamedNode = require('./NamedNode')
    , collections     = require('./collections');

var VariableNode = module.exports = new Class({

      inherits      : NamedNode
    , parent        : null
    , alias         : null
    , accesses      : null
    , of            : { get: function(){ return this.parent; }}
    , children      : { get: function(){ return this.accesses; }}

    , tags      : []
    , _type     : "VariableNode"

    , init : function initialize(name, parent) {
        initialize.super.call(this, name);

        this.parent     = parent || null;
        this.accesses   = new collections.VariableCollection();
        this.alias      = null;
    }

    , getTags : function() {
        return this.tags;
    }

    , hasTags : function() {
        return this.tags.length !== 0;
    }

    , setParent : function(parentNode) {
        this.parent = parentNode;
        return this;
    }

    , getParent : function() {
        return this.parent;
    }
    , hasParent : function() {
        return this.parent !== null;
    }

    , getRoot : function() {
        return this.hasParent() ? this.getParent().getRoot() : this;
    }

    , accept : function(visitor) {
        return visitor.visitVariableNode(this);
    }

    , isPropertyNode : function() {
        return true;
    }

    , isSelectItem : function() {
        return false;
    }

    , addToParent : function(variableNode) {
        variableNode.addAccess(this);
        return this.setParent(variableNode);
    }

    , hasAccesses : function() {
        return this.accesses.length > 0;
    }

    , getAccesses : function() {
        return this.accesses;
    }

    , hasAccess : function(key){
        return this.getAccesses().hasItem(key);
    }

    , getAccess : function(key){
        return this.getAccesses().getItem(key);
    }

    , setAccesses : function(accesses) {
        this.accesses = accesses;
        return this;
    }

    , merge : function(variableNode){
        if(variableNode.hasAccesses()){
            variableNode.getAccesses().forEach(function(access){
                access.addToParent(this); }, this);
        } else {
            if (variableNode.isAlias()) {
                this.setAlias(variableNode.getAlias());
            }
        }
    }

    , addAccess : function(access) {
        this.getAccesses().addItem(access);
        return this;
    }

    , isLinear : function(){
        return !this.hasAccesses()
                || (this.getAccesses().length == 1 && this.getAccesses()[0].isLinear());
    }

    , leafAccess : function(){
        return this.getLeafAccesses()[0];
    }

    , isAlias : function(){
        return this.getAlias() !== null;
    }

    , setAlias : function(alias){
        this.alias = alias;
    }

    , getAlias : function(){
        return this.alias;
    }

    , resolveAlias : function(alias){
        this.getLeafAccesses().forEach(function(access){
            access.setAlias(alias);
        });
    }

    , getLeafAccesses: function(){
        if(!this.hasAccesses()) return [this];
        return this.accesses.reduce(function(previous, access){
            return previous.concat(access.getLeafAccesses());
        }, []);
    }

    , isWildcard : function(){
        return this.getName() === '*';
    }

    , flatten : function(){
        return this;
    }
});