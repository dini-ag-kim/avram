---
title: Avram Specification
short: Avram
language: en
---

**Avram** is a [schema language](../../schema) for field-based data formats such as key-value records or library formats [MARC](../../marc) and [PICA](../../pica).

* author: Jakob Voß
* version: 0.8.2
* date: 2022-09-01

## Table of Contents

- [Introduction](#introduction)
  - [Conformance requirements](#conformance-requirements)
  - [Data types](#data-types)
  - [Records](#records)
- [Schema format](#schema-format)
  - [Field schedule](#field-schedule)
  - [Field identifier](#field-identifier)
  - [Field definition](#field-definition)
  - [Positions](#positions)
  - [Subfield schedule](#subfield-schedule)
  - [Indicator definition](#indicator-definition)
  - [Codelist](#codelist)
  - [Restrictions by format family](#restrictions-by-format-family)
  - [Metaschema](#metaschema)
- [Validation rules](#validation-rules)
  - [Record validation](#record-validation)
  - [Field validation](#field-validation)
  - [Indicator validation](#indicator-validation)
  - [Subfield validation](#subfield-validation)
  - [Validation with positions](#validation-with-positions)
  - [Validation with codelists](#validation-with-codelists)
  - [Counting](#counting)
  - [Validation options](#validation-options)
- [References](#references)
  - [Normative references](#normative-references)
  - [Informative references](#informative-references)
  - [Changes](#changes)

## Introduction

MARC and related formats such as PICA and MAB are used since decades as the basis for library automation. Several variants, dialects and profiles exist for different applications. The Avram schema language allows to specify individual formats for documentation, validation, and requirements engineering. The schema language is named after [Henriette D. Avram (1919-2006)](https://en.wikipedia.org/wiki/Henriette_Avram) who devised MARC as the first automated cataloging system in the 1960s.

The Avram specification consists of a [schema format](#schema-format) based on JSON and [validation rules](#validation-rules) to validate [records] against individual schemas. The format can also be used to express results of record analysis. Avram schemas cover library formats based on MARC and PICA as well as simple key-value structures.

The document is managed in a git repository at <https://github.com/gbv/avram> together with test files for implementations.

### Conformance requirements

The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119].

### Data types

A **string** is a sequence of Unicode code points.

A **timestamp** is a date or datetime as defined with XML Schema datatype [datetime](https://www.w3.org/TR/xmlschema-2/#dateTime) (`-?YYYY-MM-DDThh:mm:ss(\.s+)?(Z|[+-]hh:mm)?`) [date](https://www.w3.org/TR/xmlschema-2/#date) (`-?YYYY-MM-DD(Z|[+-]hh:mm)?`), [gYearMonth](https://www.w3.org/TR/xmlschema-2/#gYearMonth) (`-?YYYY-MM`), or [gYear](https://www.w3.org/TR/xmlschema-2/#gYear) (`-?YYYY`).

A **regular expression** is a non-empty string that conforms to the [ECMA 262 (2015) regular expression grammar](http://www.ecma-international.org/ecma-262/6.0/index.html#sec-patterns).  The expression is interpreted as Unicode pattern with `.` matching all characters, including newlines.

A **language** is a natural language identifier as defined with XML Schema datatype [language](https://www.w3.org/TR/xmlschema-2/#language).

A **non-negative integer** is a natural number (0, 1, 2...)

A **range** is a sequence of digits, optionally followed by a dash (`-`) and a second sequence of digits with same length and numerical value larger than the first sequence (examples: `0`, `00`, `3-7`, `03-12`, `01-09`...). A string **matches** a range if it is a sequence of digits of same length as the sequence(s) in the range and the numerical value is equal to or between the numerical value(s) of the range. Applications MAY accept and normalize two sequences of different length to valid ranges.

### Records

[records]: #records
[record]: #records
[field]: #records
[tag]: #records
[occurrence]: #records
[format family]: #records

Avram schemas are used to [validate](#validation-rules) and analyze records. A **record** is a non-empty sequence of **fields**, each consisting of a **tag**, being a non-empty string and

* either a **flat field value**, being a string,
* or a non-empty sequence of **subfields**, each being a pair of **subfield code** (being a character) and **subfield value** (being a string).

Fields with subfields, also called **variable fields**, MAY also have

* either two **indicators**, each being a single character,
* or an **occurrence**, being a sequence of two digits with positive numerical value (`01`, `02`, ...`99`).

The record model can further be restricted by a **format family**, identified by a non-empty string. The following format families are part of this specification and imply [restrictions on schemas for this format family](#restrictions-by-format-family):

* `flat`: all fields are flat without indicators or occurrences (simple key-value structures with repeatable keys)
* `marc`: flat fields have no indicators or occurrences, variable fields have two indicators and no occurrences
* `pica`: all fields are variable without indicators
* `mab`: fields have one indicator and no occurrences

The encoding of records in individual serialization formats such as MARCXML, ISO 2709, or PICA JSON is out of the scope of this specification.

## Schema format

[root level]: #schema-format

An **Avram Schema** is a JSON object given as serialized JSON document or any other format that encodes a JSON document. In contrast to [RFC 7159], all object keys MUST be unique. String values SHOULD NOT be the empty string. Applications MAY remove keys with empty string value.

A schema MUST contain key

* `fields` with a [field schedule](#field-schedule).

A schema SHOULD contain keys documenting the format defined by the schema:

* `title` with the name of the format
* `description` with a short description of the format
* `url` with a homepage URL of the format
* `family` with a [format family]
* `profile` with an URI of the format
* `language` with the language values of keys `title`, `description`, and `label` used throughout the schema. Its value SHOULD be assumed as `und` if not specified.

The schema MAY contain keys:

* `$schema` with an URL of the [Avram metaschema](#metaschema)
* `codelists` with a [codelist directory](#codelist)
* `checks` with [external validation rules](#external-validation-rules)
* `records` with a non-negative integer to indicate a number of records

##### Example

~~~json
{
  "fields": { },
  "title": "MARC 21 Format for Classification Data",
  "description": "MARC format for classification numbers and captions associated with them",
  "url": "https://www.loc.gov/marc/classification/",
  "profile": "http://format.gbv.de/marc/classification",
  "language": "en",
  "$schema": "https://format.gbv.de/schema/avram/schema.json"
}
~~~

### Field schedule

[field schedule]: #field-schedule

A **field schedule** is a JSON object that maps [field identifiers](#field-identifier) to [field definitons](#field-definition).

##### Example

~~~json
{
  "010": { "label": "Library of Congress Control Number" },
  "084": { "label": "Classification Scheme and Edition" }
}
~~~

Field identifiers of a field schedule SHOULD NOT overlap. Two field identifiers overlap when it is possible to match a field with both. Applications MUST either detect and reject overlapping field identifiers or match fields to the first of multiple overlapping field identifiers in alphabetical sort order.

### Field identifier

[field identifier]: #field-identifier
[field identifiers]: #field-identifier
[field counter]: #field-identifier
[field occurrence]: #field-identifier

A **field identifier** is a non-empty string that can be used to match fields. The identifier consists of a [tag], optionally followed by

* the slash (`/`) and a **field occurrence**, being a range of two digits except the single sequence of two digits (`00`),
* or the small letter x (`x`)  and a **field counter**, being a range of one or two digits (`0`, `0-1`..., `00`, `00-01`..., `98-99`).

Applications MAY further allow a tag followed by the slash and two zeroes (`/00`) as alias for a bare tag.

A [field] **matches** a field identifier if the tag of the field is equal to the tag of the field identifier, and

* the field has no occurrence and the field identifier has no field occurrence nor field counter,
* or the occurrence of the field matches the range of the field occurrence,
* or the first subfield value of subfield with subfield code `x` matches the range of the field counter.

##### Examples

* `LDR`, `001`, `850`... (MARC)
* `021A`, `045Q/01`, `028B/01-02`, `209K`, `209Ax00-09`, `247Ax0`... (PICA)
* `001`, `100`, `805`... (MAB)

### Field definition

[field definition]: #field-definition
[field definitions]: #field-definition

A **field definition** is a JSON object that SHOULD contain key:

* `tag` with the [tag]
* `label` with the name of the field
* `repeatable` with a boolean value, assumed as `false` by default
* `required` with a boolean value, assumed as `false` by default

The field definition MAY further contain keys:

* `occurrence` with a [field occurrence]
* `counter` with a [field counter]
* `url` with an URL link to documentation
* `description` with additional description of the field
* `indicator1` with first [indicator definition] or `null`
* `indicator2` with second [indicator definition] or `null`
* `pica3` with corresponding Pica3 number
* `modified` with a timestamp
* `positions` with a specification of [positions] (for flat fields)
* `pattern` with a regular expression (for flat fields)
* `codes` with a [codelist]
* `subfields` with a [subfield schedule] (for variable fields)
* `checks` with [external validation rules](#external-validation-rules)
* `total` with a non-negative integer to indicate the number of times this field has been found
* `records` with a non-negative integer to indicate the number of records this field has been found in

If a field definition contains keys for variable fields (`subfields`) it MUST NOT contain keys for flat fields (`positions`, `pattern` and/or `codes`).

If a field definition is given in a [field schedule], each of `tag`, `occurrence` and `counter` MUST either be missing or have same value as used to construct the corresponding [field identifier].

Applications MAY allow and remove `occurrence` keys with value two zeroes (`00`) as alias for a field definition without occurrence.

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

### Positions

[positions]: #positions

Subfield values and flat field values can be specified **positions**, being a
JSON object that maps **character positions** to data **element definitions**.
A character position is a range not consisting of zeroes only. It is
RECOMMENDED to use sequences of two digits.

A **data element definition** is a JSON object that SHOULD contain key:

* `label` with the name of the data element

The data element definition MAY further contain keys:

* `url` with an URL link to documentation
* `description` with additional description
* `codes` with a [codelist]
* `pattern` with a regular expression

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

### Subfield schedule

[subfield schedule]: #subfield-schedule
[subfield schedules]: #subfield-schedule
[subfield definition]: #subfield-schedule

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
* `codes` with a [codelist]
* `checks` with [external validation rules](#external-validation-rules)
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

### Indicator definition

[indicator definition]: #indicator-definition

An **indicator definition** is a JSON object that SHOULD contain key

* `label` with the name of the indicator

and further MAY contain keys:

* `url` with an URL link to documentation
* `description` with additional description of the indicator
* `codes` with a [codelist]

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

### Codelist

[codelist]: #codelist

A **codelist** is 

* either a JSON object that maps codes to code definitions (**explicit codelist**)
* or a non-empty string that SHOULD be an URI (**referenced codelist**).

A **code** is a non-empty string. A **code definition** is a JSON object with optional keys:

* `label` with the name of the code
* `description` with additional description of the code
* `total` with a non-negative integer to indicate the number of times this code has been found
* `records` with a non-negative integer to indicate the number of records this code has been found in

A **codelist directory** is a JSON object that maps referenced codelists to explicit codelists.

##### Examples (explicit, referenced, and truncated codelist directory)

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

~~~json
"http://id.loc.gov/vocabulary/languages"
~~~

~~~json
{
  "http://id.loc.gov/vocabulary/languages": {
    "eng": { "label": "English" },
    "fre": { "label": "French" }
  }
}
~~~

### External validation rules

An Avram Schema MAY include references to additional validation rules with key `checks` at the [root level], at [field schedules](#field-schedule), and at [subfield schedules]. The value of this keys MUST be an string or a JSON array of strings. Strings SHOULD be URIs.

##### Example

~~~json
{
    "fields": {
        "birth": {
            "subfields": {
                "Y": { "label": "year" },
                "M": { "label": "month" },
                "D": { "label": "day" }
            },
            "checks": "http://example.org/valid-date"
        },
        "death": {
            "subfields": {
                "Y": { "label": "year" },
                "M": { "label": "month" },
                "D": { "label": "day" }
            },
            "checks": "http://example.org/valid-date"
        }
    },
    "checks": [
        "death must not be earlier than birth",
        "birth only allowed before 1950 for privacy reasons"
    ]
}
~~~

### Restrictions by format family

A format family restricts the [model of records](#records) than can be described by an Avram schema. Known values of schema key `family` imply restriction on [field identifiers](#field-identifier) and [field definitions](#field-definition).

#### flat formats

Field identifiers are plain tags. Field definitions MUST NOT include keys `occurrence`, `counter`, `indicator1`, `indicator2`, or `subfields`.

#### marc formats

Field identifiers are plain tags and MUST either be the character sequence `LDR` or three digits. Field definitions MUST NOT include keys `occurrence` or `counter`. Field definitions of flat fields MUST NOT have keys `indicator1` or `indicator2`.

#### pica formats

Field identifiers MUST NOT include a [field counter] if its tag starts with digit `0` or `1` and MUST NOT include a [field occurrence] if its tag starts with digit `2`.Tags MUST match the regular expression `^[012][0-9][0-9][A-Z@]`. Field definitions MUST NOT include keys `indicator1` or `indicator2`.

#### mab formats

Field identifiers are plain tags and MUST consist of excactely three digits. Field definitions MUST NOT include keys `indicator2`, `occurrence`, or `counter`. 

### Metaschema

A [JSON Schema](http://json-schema.org/) to validate Avram Schemas is available
at <https://format.gbv.de/schema/avram/schema.json>.

Applications MAY extend the metaschema for particular [format families](#records) and formats, for instance by further restriction of the allowed set of [field identifiers].

## Validation rules

***Rules how to validate records against Avram Schemas have not fully been specified yet!***

Avram schemas can be used to validate [records] (see [record validation]). An Avram validator MAY limit validation to selected [format families](#record). Validation can be configured with [validation options](#validation-options).

### Record validation

[record validation]: #record-validation

A record is valid against a [field schedule] if

* every field matches a field identifier in the field schedule,
* every field is valid against its corresponding [field definition] from the field schedule (see [field validation](#field-validation)),
* the record does not contain more than one field matching the same field definition with `repeatable` being `false`,
* and the record contains at least one field for each field definition with `required` being `true`.

If validation option `ignore_unknown_fields` is enabled, all fields not matching a field identifier in the field schedule are valid by definition.

A record is valid against a schema if it is valid against the field schedule given with key `fields` of the schema.

### Field validation

[field validation]: #field-validation

A field is valid against a [field definition] if the following rules are met:

* If the field contains indicators, their values must be valid by [value validation](#value-validation) against the corresponding [indicator definition] `indicator1` (first indicator) and `indicator2` (second indicator) not being `null`.

* If the field is a flat field, its field value must be valid by [value validation].

* If the field is a variable field:

    * every subfield must have a [subfield definition] and is valid,
    * for subfield definitions with `repeatable` being `true` the field must at most contain one subfield
    * and there is at least one subfield for each [subfield definition] with `required` being `true`.

Field validation of variable fields can be configured:

* to not validate subfields (`ignore_subfields`)
* to ignore subfields not defined in the schema (`ignore_unknown_subfields`)

Tag and occurrence of a field are not included in field validation as they are part of [record validation](#record-validation).

### Subfield validation

A subfield is valid if it conforms to its corresponding [subfield definition]:

* if `repeatable` is `false` the subfield is valid only if the field does not contain another subfield with the same subfield code.
* Subfield value must be valid (see [value validation])

Subfield validation can be configured:

* to ignore subfield values (`ignore_values`)
* to also check order of subfields (`check_subfield_order`)

### Value validation

[value validation]: #value-validation

A value (given as string), is valid if it conforms to a definition (given as [field definition], [subfield definition], [indicator definition], [data element definition](#positions)):

* if the definition contains key `pattern`, the value must match its regular expression. The pattern is not anchored by default, so `^` and/or `$` must be included to match start and/or end of the value.
* if the definition contains key `positions`, the value must be [valid against its positions](#validation-with-positions).
* if the definition contains key `codes`, the value must be [valid against its codelists](#validation-with-codelists)

A value is always valid if the definition contains neither of keys `pattern`, `positions`, and `codes`.

If validation option `ignore_values` is enabled, all non-indicator values are valid.

### Validation with positions

[validation with positions]: #validation-with-positions

A string value is valid against [positions](#positions) if all substrings defined by character positions of the positions are valid against the corresponding data element definitions. Character positions are counted by Unicode code points.

Substrings can be empty, for instance when the value is shorter than some character position. An empty substring can be valid, depending on the data element definition.

Positions can recursively contain other positions via their data element definitions.

### Validation with codelists

[validation with codelists]: #validation-with-codelists

A string value is valid against an [explicit codelist](#codelist) if the value is a defined code in this codelist.

To check whether a string value is valid against a *referenced codelist*, the codelist is resolved with the codelist directory of the Avram schema. Applications MAY resolve referenced codelists against externally defined explicit codelists. If so, the application MUST make clear whether codelists defined in the codelist directory are overriden or extened.

Validation can further be configured:

* to not validate against codelists (`ignore_codes`)
* to not validate against referenced codelists if the corresponding explicit codelist cannot be found (`ignore_unknown_codelists`)

### Counting

An Avram schema can contain key `records` at [root level] and keys `records` and `total` at [field definitions], [subfield definitions](#subfield-schedule) and [code definitions](#codelist). Validation can be configured to not ignore these fields but to compare given counting fields to the actual number of records, subfields, and/or codes found in input data. Validation options are:

* `count_records` to enable counting number of records (key `records` at root level)
* `count_fields` to enable counting number of each field (keys `records` and `total` at field definitions)
* `count_subfields` to enable counting number of each subfield (keys `records` and `total` at subfield definitions)
* `count_codes` to enable counting number of each code (key `records` and `total` ad code definitions)

Enabling `count_subfields` implies `count_fields` and enabling `count_fields` or `count_codes` implies `count_records`.

### Validation options

An Avram validator MAY support selected validation options to configure how validation rules are applied. All options MUST be disabled by default and if not supported. An Avram validator MUST document which options it supports. The following validation options are defined:

Option | Aspect | Implication
-------|--------|------------
`ignore_unknown_fields` | [record validation] | ignore fields without field definition
`ignore_subfields` | [field validation] | ignore subfields
`ignore_unknown_subfields` | [field validation] | ignore subfields without subfield definition
`check_subfield_order` | [field validation] | additionally validate order of subfields
`ignore_values` | [value validation] | ignore all flat field values and subfield values
`ignore_codes` | [validation with codelists] | don't validate with codelists
`ignore_unknown_codelists` | [validation with codelists] | don't validate with unresolveable referenced codelists

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

#### Implementations

- [QA catalogue](https://github.com/pkiraly/metadata-qa-marc) Java implementation for MARC-based formats
- [PICA::Schema](https://metacpan.org/pod/PICA::Schema) Perl implementation for PICA-based formats
- [MARC::Schema](https://metacpan.org/pod/MARC::Schema) Perl implementation for MARC-based formats
- [avram-js](https://github.com/gbv/avram-js) draft of JavaScript implementation

#### Related standards

- [MARCspec - A common MARC record path language](http://marcspec.github.io/MARCspec/marc-spec.html)
- [JSON Table Schema](https://frictionlessdata.io/specs/table-schema/) schema format for tabular data
- [JSON Schema](https://json-schema.org/) schema language for JSON formats

#### Background information

- [discussion that lead to creation of Avram](https://github.com/pkiraly/metadata-qa-marc/issues/45)

### Changes

#### 0.?.? (2023-??-??)

- Remove `deprecated-fields`, `deprecated-subfields` and `deprecated-codes`.

#### 0.8.2 (2022-09-01)

- Allow `pattern`, `codes` and `deprecated-codes` at flat field definitions
- Allow flat field values and subfield values to be empty
- Let dot in regular expressions also match newlines
- Extend definition of format families

#### 0.8.1 (2022-06-20)

- Allow simple string for referenced codelists
- Simplify treatment of overlapping field identifiers
- Disallow empty string regular expressions
- Extend formal description of validation
- Rename "fixed fields" to "flat fields"
- Add optional schema key `family`

#### 0.8.0 (2022-04-25)

- Add codelist directories (`codelists`)
- Add external validation rules (`checks`)
- Remove field types (`types`)
- Allow `deprecated-codes` also at subfield schedules

#### 0.7.1 (2021-10-01)

- More explicitly specificy field occurrence and field counter
- Textual refactoring

#### 0.7.0 (2021-09-29)

- Rename `count` to `records` to not confuse with `counter`
- Add `total` and `records` at field definitions, subfield definitions and code definitions
- Allow URIs as codelists and allow `codes` at subfield level

#### 0.6.0 (2020-09-15)

- Add `counter` for PICA-based formats
- Modify allowed values in `occurrence`

#### 0.5.0 (2020-08-04)

- Add option field `description` in addition to `label`
- Add schema field `profile` to identify schemas

#### 0.4.0 (2019-05-09)

- Add `count` and `language`
- Change `occurrence` from three to two digits

#### 0.3.0 (2018-03-16)

- Add `deprecated-subfields`

#### 0.2.0 (2018-03-09)

- Add `pattern` at subfields and positions
- Add `position` at subfields
- Extend definition of positions
- Disallow empty strings

#### 0.1.0 (2018-02-20)

- First version

