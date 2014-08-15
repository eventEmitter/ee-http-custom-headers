var log         = require('ee-log'),
    Class       = require('ee-class');

var PrettyPrinter = module.exports = new Class({

      _type: 'Pretty Printerio'

    , visitActionNode: function(node){
        return node.getName()+' ( '+this.visitCollection(node.parameters)+' ) ';
    }

    , visitNamedNode: function(node){
        return node.getName();
    }

    , visitValueNode: function(node){
        return node.toString();
    }
    , visitNodeCollection: function(node){
        var result = [];
        for(var i=0; i<node.length; i++){
            result.push(node.at(i).accept(this));
        }
        return result;
    }

    , visitOrdering: function(node){
        return node.value.accept(this)+"\t"+node.direction;
    }

    , visitSequence: function(node){
        return this.visitNodeCollection(node).join('\n\t&&\t');
    }

    , visitCollection: function(node){
        return this.visitNodeCollection(node).join(' , ');
    }

    , visitArrayCollection: function(node){
        return ' [ '+this.visitCollection(node)+' ] ';
    }

    , visitComparison: function(node){
        return node.identifier.accept(this)+' '+node.comparator+' '+node.value.accept(this);
    }

    , visitChoice: function(node){
        return ' ( '+this.visitNodeCollection(node).join('\n\t|\t')+' ) ';
    }

    , visitIdentifier: function(node){
        return node.toString();
    }

    , visitOrderStatement: function(node){
        return '\nORDER-BY:\n\t'+this.visitNodeCollection(node).join('\n\t')
    }

    , visitFilterStatement: function(node){
        return '\nFILTER: \n\t'+this.visitNodeCollection(node).join('\n\t|\t');
    }

    , visitSelectStatement: function(node){
        return '\nSELECT:\n\t'+this.visitNodeCollection(node).join(',\n\t');
    }

    , prettyPrint: function(node){
        return node.accept(this);
    }
});