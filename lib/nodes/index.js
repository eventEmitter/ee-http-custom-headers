var classes = ['ActionNode', 'ComparisonNode', 'NamedNode', 'NodeCollection', 'PropertyNode', 'VariableNode', 'ValueNode'];
for(var i=0; i<classes.length; i++){
    module.exports[classes[i]] = require('./'+classes[i]);
}