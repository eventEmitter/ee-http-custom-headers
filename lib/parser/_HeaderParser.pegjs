/**
 * New convention: every rule consumes whitespace to its right, except the starting rules (to the left).
 */
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

/* --------------------------------------------------------------------------------
 * general starting rule
 * ----------------------------------------------------------------------------- */
start   = select

/* --------------------------------------------------------------------------------
 * punctuation and whitespace
 * ----------------------------------------------------------------------------- */
dot             = '.'
comma           = full:(',' ws)  { return full[0]; }
sq              = "'"
dq              = '"'
ws "whitespace" = (blank / "\n")*   { return ""; }
blank           = " " / "\t"

bracketLeft         = '(' ws
bracketRight        = ')' ws
squareBracketLeft   = '[' ws
squareBracketRight  = ']' ws

bL              = bracketLeft
bR              = bracketRight
sBL             = squareBracketLeft
sBR             = squareBracketRight

/* --------------------------------------------------------------------------------
 * letters and digits
 * ----------------------------------------------------------------------------- */
letter "a letter"                   = [A-Z]i
word "a letter digit or underscore" = [A-Z0-9_]i
digit "a digit"                     = [0-9]

/* --------------------------------------------------------------------------------
 * names and identifiers
 * ----------------------------------------------------------------------------- */
name_base "a name"      = chars:(letter word*/'*')          { return (chars.length == 1) ? chars[0] : chars[0]+chars[1].join(""); }
name "an identifier"    = base:name_base !bL                { return IntermediateRepresentation.name(base); }
name_dotted             = first:name more:(dot name)* ws    { return IntermediateRepresentation.name_dotted(argumentsList(first, more)); }
name_tagged             = result:(name_dotted ws name_tag)  { return IntermediateRepresentation.name_tagged(result.shift(), result.pop()); }
name_tag                = name

/* --------------------------------------------------------------------------------
 * basic values
 * ----------------------------------------------------------------------------- */
value   =   result:(
              array
            / date
            / literal
            / name_dotted
            / function
            ) ws { return result; }

/* --------------------------------------------------------------------------------
 * comma separated values
 * ----------------------------------------------------------------------------- */
values  = first:value more:(comma value)*               { return IntermediateRepresentation.values(argumentsList(first, more)); }

/* --------------------------------------------------------------------------------
 * literals
 * ----------------------------------------------------------------------------- */
literal = result:(
              string
            / number
            / boolean
            / null
          ) ws { return IntermediateRepresentation.literal(result); }

array "array"   = sBL items:(array_items?) sBR        { return IntermediateRepresentation.arr(items); }
array_items     = values

null            = 'null'

boolean "boolean"   = boolean_true / boolean_false
boolean_true        = 'true'                            { return true; }
boolean_false       = 'false'                           { return false; }

number "number"     = integer:digit+ remainder:(dot digit+)? {
    var intPart     = parseInt(integer, 10);
    return (remainder) ? intPart + parseFloat(remainder[0]+remainder[1].join('')) : intPart;
}

string "string"     = str:(string_sq / string_dq)                    { return str[1].join(""); }
string_sq           = sq string_sq_char* sq
string_sq_char      = char:(('\\' sq) / (!sq .))             { return char.join(""); }

string_dq           = dq string_dq_char* dq
string_dq_char      = char:(('\\' dq) / (!dq .))             { return char.join(""); }

date "date"         = year:date_year '-' month:date_pair '-' day:date_pair ws time:date_time?
                                                    {
    time = time || [0, 0, 0, 0, 0];

    var   hour  = time[0]
        , min   = time[2]
        , sec   = time[4];

    return IntermediateRepresentation.date(year, month, day, hour, min, sec);
}
date_pair = result:([0-9][0-9])                                         { return parseInt(result.join(""), 10); }
date_year = result:([1-9][0-9][0-9][0-9])                               { return parseInt(result.join(""), 10); }
date_time = date_pair ':' date_pair ':' date_pair

/* --------------------------------------------------------------------------------
 * function
 * ----------------------------------------------------------------------------- */
function            = id:name_base bL params:function_arguments? bR        { return IntermediateRepresentation.func(id, params); }
function_arguments  = values

/* --------------------------------------------------------------------------------
 * select header
 * ----------------------------------------------------------------------------- */
select      = ws comma? single:select_item more:(comma select_item)* comma?  { return IntermediateRepresentation.select(argumentsList(single, more)); }
select_item = alias:name_dotted agg:(ws comp_eq ws function)?                 { return IntermediateRepresentation.selectItem(alias, agg) }

/* --------------------------------------------------------------------------------
 * filter header
 * ----------------------------------------------------------------------------- */
filter      = ws comma? single:filter_item more:(comma filter_item)* comma?     { return IntermediateRepresentation.filter(argumentsList(single, more)); }
filter_item = comp

/* --------------------------------------------------------------------------------
 * order header
 * ----------------------------------------------------------------------------- */
order       = ws comma? single:order_item more:(comma order_item)* comma?        { return IntermediateRepresentation.order(argumentsList(single, more)); }
order_item  = function / name_tagged / name_dotted

/* --------------------------------------------------------------------------------
 * comparison and operators
 * ----------------------------------------------------------------------------- */
comp        = compared:name_dotted operator:comp_op val:value                  { return IntermediateRepresentation.comp(compared, operator, val); }
comp_op     = op:('!=' / comp_eq / '>=' / '<=' / '>' / '<' / 'like'i ) ws    { return op.toUpperCase(); }
comp_eq     = '='