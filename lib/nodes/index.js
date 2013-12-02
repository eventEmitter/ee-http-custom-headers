var classes = ['ActionNode', 'ComparisonNode', 'NamedNode', 'NodeCollection', 'PropertyNode', 'VariableNode', 'ValueNode', 'SelectStatement', 'FilterStatement', 'OrderStatement'];
for(var i=0; i<classes.length; i++){
    module.exports[classes[i]] = require('./'+classes[i]);
}