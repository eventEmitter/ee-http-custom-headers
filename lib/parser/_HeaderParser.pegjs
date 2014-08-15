{
    /**
    * Include intermediate representations (nodes).
    */
    var IR = require('./../IntermediateRepresentation');

    /**
     * Concat a single token with a sequence.
     * s := Single
     * r := Remainder
     */
    function conc(s, r){
        return [s].concat(r);
    }

}
/**
 * Basic start rule.
 */
start   = select

/**
 * Special Characters
 */
dot                 = '.'
comma   ","         = full:(ws ',' ws)                      { return full[1]; }
pipe    "|"         = full:(ws '|' ws)                      { return full[1]; }
sq                  = "'"
dq                  = '"'

ws      "whitespace"    = (blank / "\n")*                   { return ""; }
blank                   = " " / "\t"

open    "("             = full:(ws '(' ws)                  { return full[1]; }
close   ")"             = full:(ws ')' ws)                  { return full[1]; }
open_br    "["          = full:(ws '[' ws)                  { return full[1]; }
close_br   "]"          = full:(ws ']' ws)                  { return full[1]; }

/**
 * Characters
 */
letter  "letter"                      = [A-Z]i
letter_first "underscore or letter"   = [A-Z_]i
word    "letter digit or underscore"  = [A-Z0-9_]i
digit   "digit"                       = [0-9]

/**
 * Literals and Identifiers
 */

wildcard    = '*'
name        = s:(letter_first/wildcard) r:word*          { return conc(s, r).join(''); }
identifier  = s:name r:(dot name)* !open                 { return IR.identifier(s, r); }

value   = date
        / literal
        / identifier
        / function
        / array

values  = s:value r:(comma value)*                      { return IR.values(s, r); }

literal = result:(string / number / boolean / null)     { return IR.literal(result); }

null = 'null'

boolean = boolean_true / boolean_false
boolean_true = 'true'                                   { return true; }
boolean_false = 'false'                                 { return false; }

number  = integer / float
integer = num:digit+ !dot                               { return parseInt(num.join(""), 10); }
float   = num:(digit+ dot digit*)                       { return parseFloat( num[0].join("")+num[1]+num[2].join(""), 10); }

string      = str:(string_sq / string_dq)               { return str[1].join(""); }
string_sq   = sq string_sq_char* sq
string_sq_char = char:(('\\' sq) / (!sq .))             { return char.join(""); }

string_dq   = dq string_dq_char* dq
string_dq_char = char:(('\\' dq) / (!dq .))             { return char.join(""); }

/**
 * Complex Types
 */
date = year:date_year '-' month:date_pair '-' day:date_pair ws time:date_time?
{
    time = time || [0, 0, 0, 0, 0];

    var   hour  = time[0]
        , min   = time[2]
        , sec   = time[4];

    return IR.date(year, month, day, hour, min, sec);
}

date_pair = result:([0-9][0-9])                                         { return parseInt(result.join(""), 10); }
date_year = result:([1-9][0-9][0-9][0-9])                               { return parseInt(result.join(""), 10); }
date_time = date_pair ':' date_pair ':' date_pair

function    = id:name open params:values? close                         { return IR.func(id, params); }
array       = open_br items:values? close_br                            { return IR.arr(items); }

/**
 * Statements
 */
select   = comma? s:identifier r:(comma identifier)* comma?                     { return IR.select(conc(s, r)); }

filter      = s:filter_or                                               { return IR.filter(s); }
filter_or   = s:filter_and r:(pipe filter_and)*                         { return IR.choice(s, r); }
filter_and  = comma? s:filter_item r:(comma filter_item)* comma?        { return IR.sequence(s, r); }
filter_item = filter_precedence / comp
filter_precedence = open inner:filter_or close                             { return inner; }

direction = r:word*                                                     { return r.join(''); }
order = comma? s:order_item r:(comma order_item)* comma?                { return IR.order(s, r); }
// it would be cool to be able to memoize this!
order_item = v:(function / identifier) ws d:direction?                         { return IR.ordering(v, d); }

comp = c:identifier o:comp_op v:value                                       { return IR.comp(c, o, v); }
comp_op = ws op:('!=' / '=' / '>=' / '<=' / '>' / '<' / 'like'i ) ws    { return op.toUpperCase(); }