#Custom Rest Headers

This document contains grammar proposals for the rest header DSL specified in  [the Joinbox RESTFul Styleguide](https://github.com/joinbox/guidelines/blob/master/styleguide/RESTful.md). The parser itself is implemented as a PEG. For more information see the [Joinbox RESTFul Styleguide](https://github.com/joinbox/guidelines/blob/master/styleguide/RESTful.md) and [PEG.js](http://pegjs.majda.cz/)

##1. Select
###Example
```HTTP
GET /user HTTP/1.1
Select: id, name, tenant.id, tenant.name, friend.name, friend.id
```
###Grammar
```PEG
select ← name_dotted (',' name_dotted)*
```

##2. Filter
###Example
```HTTP
GET /user HTTP/1.1
Filter: id=in(3,4), firstName=like('mich%25')
```
###Grammar
```PEG
filter ← filter_item (',' filter_item)*
filter_item ← name_dotted '=' 
```

##3. Order
###Example
```HTTP
GET /user HTTP/1.1
Order: name, friends.name DESC
```
###Grammar
```PEG
order ← order_item (comma order_item)*
order_item ← function / name_tagged / dotted_name
// memoize the dotted_name
name_tagged ← dotted_name name_tag
name_tag ← name
```
##4. Dates
The parser supports dates and datetimes (possible ambiguity with number!!)
```
Filter: created=2013-11-18 
Filter: created!=2013-11-18
Filter: created>=2013-11-18 20:00:02
Filter: created<=2013-11-18
Filter: created>2013-11-18
Filter: created<2013-11-18
Filter: created=in(2013,2014)
Filter: created=null
Filter: created=notNull
```
###Grammar
```
date      ← date_year '-' date_month '-' date_day date_time?
date_two  ← [0-9][0-9]
date_year ← [1-9][0-9][0-9][0-9]
date_month ← date_two
date_day  ← date_two
date_time ←  date_two ':' date_two ':' date_two
```

##5. Expressions
The parser supports a minimal expression syntax for comparison. The parser does not do any type checking! Furthermore, future versions may have to care about
the difference between an assignment and a comparison.

```
Filter: id=1
Filter: id!=1
Filter: id>=1
Filter: id<=1
Filter: id>1
Filter: id<1
Filter: id=in(1,2,3,4)
Filter: id=null
```
###Grammar
```
comp ← name_dotted comp_op value 
comp_op ← ('!=' / '=' / '>=' / '<=' / '>' / '<')
```

##6. Generic
```PEG
dot          ← '.'
comma        ← ','
sq           ← "'"
dq           ← '"'

name         ← ([A-Z_]i[0-9A-Z_]i)+ !'('
name_dotted  ← name (dot name)*

array ← '[' array_items? ']'
array_items ← array_item (comma array_item)*
array_item ← array / literal

value = function / array / date / literal / name_dotted
values = first:value more:(comma value)* { return argumentsList(first, more); }

literal ← number / string / boolean

// memoize the integer in the number
number       ← integer / float
integer      ← ([1-9][0-9] * / 0) !dot
float        ← (integer? dot [0-9]+)
boolean      ← boolean_true / boolean_false

boolean_true ← 'true'
boolean_false ← 'false'

string       ← string_sq / string_dq
string_sq    ← sq string_sq_char* sq
string_sq_char ← ('\' sq) / (!sq .)
string_dq    ← dq string_dq_char dq
string_dq_char ← ('\' dq) / (!dq .)

function     ← name '(' function_arguments? ')'
function_arguments ← function_argument (comma function_argument)*
function_argument ← literal
```
