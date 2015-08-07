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
ws "whitespace" = (blank / "\n")*   { return ""; }
blank           = " " / "\t"

dot             = result:'.' ws   { return result; }
comma           = result:',' ws   { return result; }
star            = result:'*' ws   { return result; }
sq              = "'"
dq              = '"'

bracketLeft         = '(' ws
bracketRight        = ')' ws
squareBracketLeft   = '[' ws
squareBracketRight  = ']' ws

bL              = bracketLeft
bR              = bracketRight
sBL             = squareBracketLeft
sBR             = squareBracketRight

epsilon         = &{ return true; }

/* --------------------------------------------------------------------------------
 * letters and digits (guess its faster to use dedicated scanners than composition)
 * ----------------------------------------------------------------------------- */
letter  "letter"                = [A-Z]i
letter_ "letter or underscore"  = [A-Z_]i
word    "word character"        = [A-Z0-9_]i
digit   "a digit"               = [0-9]

/* --------------------------------------------------------------------------------
 * names and identifiers
 * ----------------------------------------------------------------------------- */

identifier "identifier"     = result:(letter_ word*) ws         { return IntermediateRepresentation.identifier((result.length == 1) ? result[0] : result[0]+result[1].join("")); }
wildcard   "wildcard"       = result:star                       { return IntermediateRepresentation.wildcard(result); }
/* --------------------------------------------------------------------------------
 * literals
 * ----------------------------------------------------------------------------- */
literal = result:(
              string
            / number
            / boolean
            / null
          ) ws { return IntermediateRepresentation.literal(result); }

null                = 'null'

boolean "boolean"   = boolean_true / boolean_false
boolean_true        = 'true'                            { return true; }
boolean_false       = 'false'                           { return false; }

number "number"     = integer:digit+ remainder:(dot digit+)? {
    var intPart     = integer;
    return (remainder) ? parseFloat(integer+remainder[0]+remainder[1].join('')) : parseInt(intPart, 10);
}

string "string"     = str:(string_sq / string_dq)       { return str[1].join(""); }
string_sq           = sq string_sq_char* sq
string_sq_char      = char:(('\\' sq) / (!sq .))        { return char.join(""); }

string_dq           = dq string_dq_char* dq
string_dq_char      = char:(('\\' dq) / (!dq .))        { return char.join(""); }

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
 * accesses (dot access and array access)
 * ----------------------------------------------------------------------------- */
access_array                = sBL nested_select:select sBR              { return IntermediateRepresentation.access_array(nested_select); }
access_dot                  = result:((dot identifier)*)                { return IntermediateRepresentation.access_dot(result); }
access_wildcard             = result:(dot star)                         { return IntermediateRepresentation.access_dot([result]); }
access_extended             = result:(access_wildcard / access_array)   { return IntermediateRepresentation.access_extended(result); }

selector_base               = base:identifier dot_access:access_dot                 { return IntermediateRepresentation.selector_base(base, dot_access); }
selector_extended           = base:selector_base extended_access:access_extended?   { return IntermediateRepresentation.selector_extended(base, extended_access); }
selector "selector"         = result:(selector_extended / wildcard)                 { return IntermediateRepresentation.selector(result); }

/* --------------------------------------------------------------------------------
 * basic values
 * ----------------------------------------------------------------------------- */
value   =   result:(
              array
            / date
            / literal
            / function
            / selector_base
            ) ws { return result; }

/* --------------------------------------------------------------------------------
 * comma separated values
 * ----------------------------------------------------------------------------- */
values  = first:value more:(comma value)*               { return IntermediateRepresentation.values(argumentsList(first, more)); }

/* --------------------------------------------------------------------------------
 * array
 * ----------------------------------------------------------------------------- */
array "array"   = sBL items:(array_items?) sBR        { return IntermediateRepresentation.arr(items); }
array_items     = values

/* --------------------------------------------------------------------------------
 * function
 * ----------------------------------------------------------------------------- */
function            = id:identifier bL params:function_arguments? bR        { return IntermediateRepresentation.func(id, params); }
function_arguments  = values

/* --------------------------------------------------------------------------------
 * select header
 * ----------------------------------------------------------------------------- */
select      = ws comma? single:select_item more:(comma select_item)* comma?  { return IntermediateRepresentation.select(argumentsList(single, more)); }
select_item = alias:selector agg:(ws comp_eq ws function)?                   { return IntermediateRepresentation.selectItem(alias, agg) }

/* --------------------------------------------------------------------------------
 * filter header
 * ----------------------------------------------------------------------------- */
filter      = ws comma? single:filter_item more:(comma filter_item)* comma?     { return IntermediateRepresentation.filter(argumentsList(single, more)); }
filter_item = comp

/* --------------------------------------------------------------------------------
 * order header
 * ----------------------------------------------------------------------------- */
order           = ws comma? single:order_item more:(comma order_item)* comma?   { return IntermediateRepresentation.order(argumentsList(single, more)); }
order_item      = base:selector_base direction:order_direction?                 { return IntermediateRepresentation.order_item(base, direction); }
order_direction = identifier

/* --------------------------------------------------------------------------------
 * comparison and operators
 * ----------------------------------------------------------------------------- */
comp        = compared:selector operator:comp_op val:value                  { return IntermediateRepresentation.comp(compared, operator, val); }
comp_op     = op:('!=' / comp_eq / '>=' / '<=' / '>' / '<' / 'like'i ) ws    { return op.toUpperCase(); }
comp_eq     = '='