#Custom Rest Headers

This document contains grammar proposals for the rest header DSL specified in  [the Joinbox RESTFul Styleguide](https://github.com/joinbox/guidelines/blob/master/styleguide/RESTful.md). The parser itself is implemented as a PEG. For more information see the [Joinbox RESTFul Styleguide](https://github.com/joinbox/guidelines/blob/master/styleguide/RESTful.md) and [PEG.js](http://pegjs.majda.cz/).

Please be aware of the fact that this document currently is slightly outdated.

##1. Select
###Example
```HTTP
GET /user HTTP/1.1
Select: id, name, tenant.id, tenant.name, friend.name, friend.id
```
Selection supports wildcards, marked by an asterisk
```HTTP
GET /user HTTP/1.1
Select: id, name, friend.*
```

##2. Filter

###Example
```HTTP
GET /user HTTP/1.1
Filter: id=in(3,4), firstName=like('mich%25')
```

##3. Order
###Example
```HTTP
GET /user HTTP/1.1
Order: name, friends.name DESC
```

##4. Misc
###4.1 Dates
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

##4.2. Expressions
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

###Full Grammar
Please find the full grammar in `lib/parser/HeaderParser.pegjs'