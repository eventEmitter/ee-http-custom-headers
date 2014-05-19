{
  var IntermediateRepresentation = require('./../IntermediateRepresentation');

  var argumentsList = function(first, more){
    var sg = [first];
    for(var i=0; i<more.length; i++){
      sg.push(more[i][1]);
    }
    return sg;
  };
}

start   = select
dot     = '.'
comma   = full:(ws ',' ws) { return full[1]; }
sq      = "'"
dq      = '"'
ws      = (blank / "\n")* { return ""; }
blank   = " " / "\t"

name_base   = chars:([A-Z_]i[A-Z0-9_]i*/'*')        { return (chars.length == 1) ? chars[0] : chars[0]+chars[1].join(""); }
name        = base:name_base !'('               { return IntermediateRepresentation.name(base); }
name_dotted = first:name more:(dot name)*       { return IntermediateRepresentation.name_dotted(argumentsList(first, more)); }
name_tagged = result:(name_dotted ws name_tag)  { return IntermediateRepresentation.name_tagged(result.shift(), result.pop()); }
name_tag    = name

value   = date / name_dotted / function / array / literal
values  = first:value more:(comma value)*        { return IntermediateRepresentation.values(argumentsList(first, more)); }

literal = result:(string / number / boolean / null)     { return IntermediateRepresentation.literal(result); }

array = ws '[' ws items:(array_items?) ws ']' ws        { return IntermediateRepresentation.arr(items); }
array_items = values

null = 'null'

boolean = boolean_true / boolean_false
boolean_true = 'true' { return true; }
boolean_false = 'false' { return false; }

number = integer / float
integer = num:[0-9]+ !dot { return parseInt(num.join(""), 10); }
float = num:([0-9]+ dot [0-9]*) { return parseFloat( num[0].join("")+num[1]+num[2].join(""), 10); }

string = str:(string_sq / string_dq) {return str[1].join(""); }
string_sq = sq string_sq_char* sq
string_sq_char = char:(('\\' sq) / (!sq .)) {return char.join(""); }

string_dq = dq string_dq_char* dq
string_dq_char = char:(('\\' dq) / (!dq .)) {return char.join(""); }

date = year:date_year '-' month:date_pair '-' day:date_pair ws time:date_time? {
    var hour = 0,
    min = 0,
    sec = 0;
if(time !== null){
    hour = time[0],
        min = time[2],
        sec = time[4];
}
return IntermediateRepresentation.date(year, month, day, hour, min, sec);
}
date_pair = result:([0-9][0-9]) {return parseInt(result.join(""), 10); }
date_year = result:([1-9][0-9][0-9][0-9]) { return parseInt(result.join(""), 10); }
date_time = date_pair ':' date_pair ':' date_pair

function = id:name_base '(' ws params:function_arguments? ws ')' { return IntermediateRepresentation.func(id, params); }
function_arguments = values

select = comma? single:name_dotted more:(comma name_dotted)* comma?   { return IntermediateRepresentation.select(argumentsList(single, more)); }

filter = comma? single:filter_item more:(comma filter_item)* comma?   { return IntermediateRepresentation.filter(argumentsList(single, more)); }
filter_item = comp

order = comma? single:order_item more:(comma order_item)* comma? { return IntermediateRepresentation.order(argumentsList(single, more)); }
order_item = function / name_tagged / name_dotted

comp = compared:name_dotted operator:comp_op val:value { return IntermediateRepresentation.comp(compared, operator, val); }
comp_op = ws op:('!=' / '=' / '>=' / '<=' / '>' / '<') ws { return op; }