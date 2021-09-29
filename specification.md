---
title: Avram Specification
short: Avram
language: en
---

**Avram** is a [schema language](../../schema) for [MARC](../../marc) and
related formats such as [PICA](../../pica) and [MAB](../../mab).

* author: Jakob Voß
* version: 0.7.0
* date: 2021-06-03

## Introduction

MARC and related formats are used since decades as the basis for library automation. Several variants, dialects and profiles exist for different applications. The Avram schema language allows to specify individual formats based on MARC, PICA and similar standards for documentation, validation, and requirements engineering. The schema language is named after [Henriette D. Avram (1919-2006)](https://en.wikipedia.org/wiki/Henriette_Avram) who devised MARC as the first automated cataloging system in the 1960s.

This document consists of specification of the [schema format](#schema-format) and [validation rules](#validation-rules). It is managed in a git repository at <https://github.com/gbv/avram> together with test files for implementations.

### Conformance requirements

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119].

### Data types

A **timestamp** is a date or datetime as defined with XML Schema datatype [datetime](https://www.w3.org/TR/xmlschema-2/#dateTime) (`-?YYYY-MM-DDThh:mm:ss(\.s+)?(Z|[+-]hh:mm)?`) [date](https://www.w3.org/TR/xmlschema-2/#date) (`-?YYYY-MM-DD(Z|[+-]hh:mm)?`), [gYearMonth](https://www.w3.org/TR/xmlschema-2/#gYearMonth) (`-?YYYY-MM`), or [gYear](https://www.w3.org/TR/xmlschema-2/#gYear) (`-?YYYY`).

A **regular expression** is a string that conforms to the [ECMA 262 (2015) regular expression grammar](http://www.ecma-international.org/ecma-262/6.0/index.html#sec-patterns).  The expression is interpreted as Unicode pattern.

A **language** is a natural language identifier as defined with XML Schema datatype [language](https://www.w3.org/TR/xmlschema-2/#language).

A **non-negative integer** is a natural number (0, 1, 2...)

## Schema format

An **Avram Schema** is a JSON object given as JSON document or any other format that encodes a JSON document. In contrast to [RFC 7159], all object keys MUST be unique. String values SHOULD NOT be the empty string.

The schema MUST contain key:

* `fields` with a [field schedule](#field-schedule)

The schema SHOULD contain keys documenting the format defined by the schema:

* `title` with the name of the format
* `description` with a short description of the format
* `url` with a homepage URL of the format
* `profile` with an URI of the format
* `language` with the language values of keys `title`, `description`, and `label` used throughout the schema. Its value SHOULD be assumed as `und` if not specified.

The schema MAY contain keys:

* `$schema` with an URL of the [Avram metaschema](#metaschema)
* `deprecated-fields` with a [field schedule]
* `records` with a non-negative integer to indicate a number of records

Former versions of Avram also allowed key `count` with a non-negative integer. This key has been renamed to `records`.

Multiple schemas with same `title`, `description`, `url` and/or `profile` MAY exist but all schemas with same `profile` URI MUST include same [field definition] for fields with same [field identifier].

##### Example

~~~json
{
  "fields": { },
  "title": "MARC 21 Format for Classification Data",
  "description": "MARC format for classification numbers and captions associated with them",
  "url": "https://www.loc.gov/marc/classification/",
  "profile": "http://format.gbv.de/marc/classification",
  "language": "en",
  "$schema": "https://format.gbv.de/schema/avram/schema.json",
}
~~~

#### Field schedule

[field schedule]: #field-schedule

A **field schedule** is a JSON object that maps [field identifiers](#field-identifier) to [field definitons](#field-definition).

##### Example

~~~json
{
  "010": { "label": "Library of Congress Control Number" },
  "084": { "label": "Classification Scheme and Edition" }
}
~~~

#### Field identifier

[field identifier]: #field-identifier
[field identifiers]: #field-identifier

A **field identifiers** is can be any non-empty string that uniquely identifies a field. The identifier consists of a **field tag**, optionally followed by

* the slash (`/`) and a **field occurrence**,
* or the small letter x (`x`)  and a **field counter**.

Applications SHOULD add further restrictions on field identifier syntax.

##### Examples

* `LDR`, `001`, `850`... (MARC)
* `021A`, `045B/00`, `209K`... (PICA)
* `001`, `100`, `805`... (MAB)

#### Field definition

[field definition]: #field-definition

A **field definition** is a JSON object that SHOULD contain key:

* `tag` with the **field tag**
* `label` with the name of the field
* `repeatable` with a boolean value, assumed as `false` by default
* `required` with a boolean value, assumed as `false` by default

The field definition MAY further contain keys:

* `occurrence` with the **field occurrence**
* `counter` with a **field counter**
* `url` with an URL link to documentation
* `description` with additional description of the field
* `indicator1` with first [indicator], assumed as `null` by default
* `indicator2` with second [indicator], assumed as `null` by default
* `pica3` with corresponding Pica3 number
* `modified` with a timestamp
* `positions` with a specification of [positions] (for fixed fields)
* `subfields` with a [subfield schedule] (for variable fields)
* `deprecated-subfields` with a [subfield schedule] (for variable fields)
* `types` with specification of [field types] (for alternatives)
* `total` with a non-negative integer to indicate the number of times this field has been found
* `records` with a non-negative integer to indicate the number of records this field has been found in

A field definition MUST NOT contain keys for fixed fields (`position`), keys for variable fields (`subfields` and/or `deprecated-subfields`), and keys for alternatives (`types`).

If a field definition is given in a [field schedule], values of `tag`, `occurrence` and `counter` MUST either be missing or be used to automatically derive the corresponding [field identifier].

#### Additional rules for MARC-based formats

* field definitions MUST NOT include the keys `occurrence`, `counter`, `pica3`.
* field tag MUST either be the character sequence `LDR` for specification of the record leader, or consist of three digits (e.g. `001`).

#### Additional rules for PICA-based formats

* field definitions MUST NOT include the keys `indicator1` and `indicator2`.
* field tag MUST be three digits, the first `0` to `2`, followed by an uppercase letter (`A` to `Z`) or `@`.
* field definitions of fields with identifier starting with digit `2`
* field occurrence MUST NOT be given if field tag starts digit `2`.
* field counter MUST NOT be given unless field tag starts digit `2`.
* field occurrences and field counters MUST consist of digits (e.g. `00`, `21`..) or two sequences of digits with same length combined with `-` (e.g. `09-10` but not `9-10`).

##### Example

*   MARC field `240` specified as mandatory and non-repeatable:

    ~~~json
    {
      "tag": "240",
      "label": "Uniform Title",
      "url": "https://www.loc.gov/marc/bibliographic/bd240.html",
      "required": true,
      "repeatable": false,
      "modified": "2017-12"
    }
    ~~~

*   PICA field `045B/02` in K10plus format

    ~~~json
    {
      "tag": "045B",
      "occurrence": "02",
      "pica3": "5022",
      "label": "Systematik für Bibliotheken (SfB)",
      "repeatable": true,
      "subfields": {
        "a": { "label": "Notation", "repeatable": true },
        "A": { "label": "Quelle", "repeatable": true }
      }
    }
    ~~~

#### Field types

[field types]: #field-types

**Field types** are alternative sets of [positions] or [subfield schedules] as
part of a [field definition]. A specification of field types is a JSON object
maps type names to JSON objects either all having field `positions` or all
having field `subfields`.

*Note:* field types make Avram schemas more complicated. An alternative is to
provide multiple schemas, one for each type.

##### Example

~~~json
{
  "Map": {
    "positions": { "00": { "codes": { "a": { } } } } 
  },
  "Electronic resource": { 
    "positions": { "00": { "codes": { "c": { } } } } 
  },
  "Globe": { 
    "positions": { "00": { "codes": { "d": { } } } } 
  },
  ...
}
~~~

#### Positions

[positions]: #positions

Fixed fields can be specified with a JSON object that maps **character
positions** to data element definitions. A character position is sequence of
digits (e.g.  `09`) or two sequences separated by `-` (e.g. `12-16`). A
sequence of digit MUST NOT consists of zeroes only.  It is RECOMMENDED to use
sequences of two digits. If two sequences are given, the second interpreted as
number MUST NOT be smaller than the first interpreted as number. A **data
element definition** is a JSON object that SHOULD contain key:

* `label` with the name of the data element

The data element definition MAY further contain keys:

* `url` with an URL link to documentation
* `description` with additional description
* `codes` with a [codelist]
* `deprecated-codes` with a [codelist] of deprecated codes
* `pattern` with a regular expression

A data element definition MUST NOT contain more than one of the keys `codes`
and `pattern`.

##### Example

* Positions for MARC 21 field `005`:

    ~~~json
    {
      "00-03": { "label": "year" },
      "04-05": { "label": "month" },
      "06-07": { "label": "day" },
      "08-09": { "label": "hour" },
      "10-11": { "label": "minute" },
      "12-15": { "label": "second" }
    }
    ~~~

#### Subfield schedule

[subfield schedule]: #subfield-schedule
[subfield schedules]: #subfield-schedule

A **subfield schedule** is a JSON object that maps subfield codes to subfield
definitions.  A **subfield code** is a single character. A **subfield
definition** is a JSON object that SHOULD contain keys:

* `code` with the subfield code
* `label` with the name of the subfield
* `repeatable` with a boolean value, assumed as `false` by default
* `required` with a boolean value, assumed `false` by default

The subfield definition MAY further contain keys:

* `pattern` with a regular expression
* `positions` with a specification of [positions]
* `url` with an URL link to documentation
* `description` with additional description of the subfield
* `order` with a non-negative integer used to specify a partial or complete order
  of subfields
* `pica3` with a corresponding Pica3 syntax definition
* `modified` with a timestamp
* `total` with a non-negative integer to indicate the number of times this subfield has been found
* `records` with a non-negative integer to indicate the number of records this subfield has been found in

##### Example

*   Subfield schedule for MARC 21 bibliographic field `250` (Edition Statement):

    ~~~json
    {
      "a": {
        "label": "Edition statement",
        "repeatable": false,
        "pattern": "\\.$"
      },
      "b": {
        "label": "Remainder of edition statement",
        "repeatable": false
      },
      "3": {
        "label": "Materials specified",
        "repeatable": false
      },
      "6": {
        "label": "Field link and sequence number",
        "repeatable": true
      }
    }
    ~~~

#### Indicators

[indicator]: #indicators

An **indicator** is either the value `null` or a JSON object that SHOULD contain key:

* `label` with the name of the indicator

The indicator MAY further contain key:

* `url` with an URL link to documentation
* `description` with additional description of the indicator
* `codes` with a [codelist]
* `deprecated-codes` with a [codelist] of deprecated codes

Indicator codelist values MUST consist of a single character not being `#`.

##### Example

~~~json
{
  "label": "Type",
  "codes": {
    " ": "Abbreviated key title",
    "0": "Other abbreviated title"
  }
}
~~~

#### Codelist

[codelist]: #codelist

A **codelist** is a JSON object that maps codes to code definitions. A **code** is a non-empty string. All codes of a codelist MUST have same length. A **code definition** is a JSON object with optional keys:

* `label` with the name of the code
* `description` with additional description of the code
* `total` with a non-negative integer to indicate the number of times this code has been found
* `records` with a non-negative integer to indicate the number of records this code has been found in

##### Example

~~~json
{
  " ": {
    "label": "No specified type"
  },
  "a": {
    "label": "Archival"
  },
  "x": { }
}
~~~

### Metaschema

A [JSON Schema](http://json-schema.org/) to validate Avram Schemas is available
at <https://format.gbv.de/schema/avram/schema.json>.

Applications MAY extend the metaschema for particular formats, for instance the
further restrict the allowed set of [field identifiers].

## Validation rules

*This section (rules how to validate records against Avram Schemas) have not fully been specified yet!*

### Record validation

A record is valid if:

* every field has a field definition and is valid
* and there is at least one field for each [field definition] with `required` being `true`

Validation of a record can be configured:

* to ignore fields without field definition (`ignore_unknown_fields`)
* to allow fields defined as deprecated in the schemas (`allow_deprecated_fields`)

### Field validation

A field is valid if it conforms to its corresponding [field definition]:

* if `repeatable` is `false` the field is valid only if the record does not contain another field with the same field definition.
* every subfield has a [subfield definition] and is valid
* there is at least one subfield for each [subfield definition] with `required` being `true`

Field validation can be configured:

* to ignore subfields not defined in the schema (`ignore_unknown_subfields`)
* to allow subfields defined as deprecated in the schemas (`allow_deprecated_fields`)

### Subfield validation

A subfield is valid if it conforms to its corresponding [subfield definition]:

* if `repeatable` is `false` the subfield is valid only if the field does not contain another subfield with the same subfield code.
* Subfield value matches given `pattern` and/or `positions`

Subfield validation can be configured:

* to not validate subfields (`ignore_subfields`)
* to ignore subfield values (`ignore_subfield_values`)
* to ignore order of subfields (`ignore_subfield_order`)

## References

### Normative references

* P. Biron, A. Malhotra: *XML Schema Part 2: Datatypes Second Edition*.
  W3C Recommendation, October 2005.
  <https://www.w3.org/TR/xmlschema-2/>

* S. Bradner: *Key words for use in RFCs to Indicate Requirement Levels*.
  RFC 2119, March 1997. <https://tools.ietf.org/html/rfc2119>

* T. Bray: *The JavaScript Object Notation (JSON) Data Interchange Format*.
  RFC 7159, March 2014. <https://tools.ietf.org/html/rfc7159>

* *ECMAScript 2015 Language Specification (ECMA-262, 6ᵗʰ edition)*
   June 2015. <http://www.ecma-international.org/ecma-262/6.0/>

[RFC 2119]: https://tools.ietf.org/html/rfc2119
[RFC 7159]: https://tools.ietf.org/html/rfc7159

### Informative references

* [QA catalogue](https://github.com/pkiraly/metadata-qa-marc) Java implementation for MARC-based formats
* [PICA::Schema](https://metacpan.org/pod/PICA::Schema) Perl implementation for PICA-based formats
* [MARC::Schema](https://metacpan.org/pod/MARC::Schema) Perl implementation for MARC-based formats
* [discussion that lead to Avram](https://github.com/pkiraly/metadata-qa-marc/issues/45)
* [MARCspec - A common MARC record path language](http://marcspec.github.io/MARCspec/marc-spec.html)
* [avram-js](https://github.com/gbv/avram-js) draft of JavaScript implementation

### Changes

#### 0.7.0 (2021-09-29)

* Rename `count` to `records` to not confuse with `counter`
* Add `total` and `records` at field definitions, subfield definitions and code definitions.

#### 0.6.0 (2020-09-15)

* Add `counter` for PICA-based formats
* Modify allowed values in `occurrence`

#### 0.5.0 (2020-08-04)

* Add option field `description` in addition to `label`
* Add schema field `profile` to identify schemas

#### 0.4.0 (2019-05-09)

* Add `count` and `language`
* Change `occurrence` from three to two digits

#### 0.3.0 (2018-03-16)

* Add `deprecated-subfields`

#### 0.2.0 (2018-03-09)

* Add `pattern` at subfields and positions
* Add `position` at subfields
* Extend definition of positions
* Disallow empty strings

#### 0.1.0 (2018-02-20)

* First version

