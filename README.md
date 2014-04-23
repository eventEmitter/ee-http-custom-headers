#ee-rest-headers

The ee-rest-headers package mainly consists of a parser which parses complex http headers based on the rest header
DSL specified in  [the Joinbox RESTFul Styleguide](https://github.com/joinbox/guidelines/blob/master/styleguide/RESTful.md).

The parser itself is implemented as a PEG. For more information see the [Joinbox RESTFul Styleguide](https://github.com/joinbox/guidelines/blob/master/styleguide/RESTful.md) and [PEG.js](http://pegjs.majda.cz/).
Currently the parser seems to be a little slow.

##Middleware
The package exposes a middleware to be used with ee-webservices. The middleware modifies the http request (@see: ee-webserver)
by wrapping the `getHeader(key, parsed)` method. Parseable headers will be parsed and cached in a LRU cache.

##Parser
The following headers are specified in the aforementioned styleguide.

###Select
Models a projection on the fields of the queried resource. If all fields should be selected the wilcard **should** be set.

```HTTP
GET /user HTTP/1.1
Select: id, name, tenant.id, tenant.name, friend.name, friend.id
```
Selections support wildcards, marked by an asterisk

```HTTP
GET /user HTTP/1.1
Select: id, name, friend.*
```

###Filter
Filters allow to restrict queries on collections and consist of a list of comparisons.

```HTTP
GET /user HTTP/1.1
Filter: id=in(3,4), firstName=like('mich%25')
```

###Order
Allows sorting of the returned collections in ASC(ending) or DESC(ending) order.

```HTTP
GET /user HTTP/1.1
Order: name, friends.name DESC
```

###Misc
#### Dates
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

####Expressions
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

####Values
The parser supports a variety of different value types:

 1. integers
 2. floats
 3. function calls
 4. booleans
 5. arrays
 6. variables (and nested variable accesses)

###Full Grammar
Please find the full grammar in `lib/parser/_HeaderParser.pegjs'