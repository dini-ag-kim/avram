---
title: Avram Specification
short: Avram
language: en
---

**Avram** is a [schema language](../../schema) for field-based data formats such as key-value records or library formats [MARC](../../marc) and [PICA](../../pica).

- author: Jakob Voß
- version: 0.9.4
- date: 2024-01-02

## Table of Contents

- [Introduction](#introduction)
  - [Conformance requirements](#conformance-requirements)
  - [Data types](#data-types)
  - [Records](#records)
  - [Format families](#format-families)
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
  - [Field validation]
  - [Value validation]
  - [Validation with positions]
  - [Validation with codelists]
  - [Counting](#counting)
- [References](#references)
  - [Normative references](#normative-references)
  - [Informative references](#informative-references)
- [Appendix](#appendix)
  - [Acknowledgments](#acknowledgments)
  - [Changes](#changes)

## Introduction

MARC and related formats such as PICA and MAB are used since decades as the basis for library automation. Several variants, dialects and profiles exist for different applications. The Avram schema language allows to specify individual formats for documentation, validation, and requirements engineering. The schema language is named after [Henriette D. Avram (1919-2006)](https://en.wikipedia.org/wiki/Henriette_Avram) who devised MARC as the first automated cataloging system in the 1960s.

The Avram specification consists of a [schema format](#schema-format) based on JSON and [validation rules](#validation-rules) to validate [records] against individual schemas. The format can also be used to express results of record analysis. Avram schemas cover library formats based on MARC and PICA as well as simple key-value structures.

The document is managed in a git repository at <https://github.com/gbv/avram> together with test files for implementations.

### Conformance requirements

The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119].

### Data types

A **string** is a sequence of Unicode code points.

A **single character** is a string consisting of exactely one Unicode code point.

A **timestamp** is a date or datetime as defined with XML Schema datatype [datetime](https://www.w3.org/TR/xmlschema-2/#dateTime) (`-?YYYY-MM-DDThh:mm:ss(\.s+)?(Z|[+-]hh:mm)?`) [date](https://www.w3.org/TR/xmlschema-2/#date) (`-?YYYY-MM-DD(Z|[+-]hh:mm)?`), [gYearMonth](https://www.w3.org/TR/xmlschema-2/#gYearMonth) (`-?YYYY-MM`), or [gYear](https://www.w3.org/TR/xmlschema-2/#gYear) (`-?YYYY`).

A **regular expression** is a non-empty string that conforms to the [ECMA 262 (2015) regular expression grammar](http://www.ecma-international.org/ecma-262/6.0/index.html#sec-patterns).  The expression is interpreted as Unicode pattern with `.` matching all characters, including newlines.

A **language** is a natural language identifier as defined with XML Schema datatype [language](https://www.w3.org/TR/xmlschema-2/#language).

A **non-negative integer** is a natural number (0, 1, 2...)

An **URI** is a valid URI string according to [RFC 3986].

An **URL** is an URI starting with `http://` or `https://`.

A **range** is a sequence of digits, optionally followed by a dash (`-`) and a second sequence of digits with same length. The numeric values of each sequence are called **start number** and **end number**, respectively. The end number, if given, must be larger than the start number. Examples of valid ranges include `0`, `00`, `3-7`, `03-12`, and `01-09` but not `3-12` nor `7-2`. A string **matches** a range if it is a sequence of digits of same length as the sequence(s) in the range and the numerical value is equal to or within the start number and the end number of the range. Applications MAY accept and normalize sequences of different length to valid ranges.

### Records

[records]: #records
[record]: #records
[field]: #records
[tag]: #records
[occurrence]: #records
[format family]: #format-families

Avram schemas are used to [validate](#validation-rules) and analyze records. A **record** is a non-empty sequence of **fields**, each consisting of a **tag**, being a non-empty string and

* either a **flat field value**, being a string,
* or a non-empty sequence of **subfields**, each being a pair of **subfield code** (being a single character) and **subfield value** (being a string).

Fields with subfields, also called **variable fields**, MAY also have

* either two **indicators**, each being a single character,
* or an **occurrence**, being a sequence of two digits with positive numerical value (`01`, `02`, ...`99`).

The record model can further be restricted by a [format family].

The encoding of records in JSON or other individual serialization formats such as MARCXML, ISO 2709, or PICA JSON is out of the scope of this specification.

##### Example

Possible JSON serialization of a record with two flat fields with occurence and
one field with three subfields of code `g`, `g`, and `s`:

~~~json
[
  {
    "tag": "uri",
    "occurrence": "01",
    "value": "http://www.wikidata.org/entity/Q10953"
  },
  {
    "tag": "uri",
    "occurrence": "02"
    "value": "https://viaf.org/viaf/18236820"
  },
  {
    "tag": "name",
    "subfields": [
      "g", "Henriette",
      "g", "Davidson",
      "s", "Avram"
    ]
  }
}
~~~

### Format families

The [record model](#records) can be restricted by a **format family**, identified by a non-empty string. The following format families are part of this specification:

- `flat`: all fields are flat without indicators or occurrences (simple key-value structures with repeatable keys)

- `marc`: flat fields have no indicators or occurrences, variable fields have no occurrences and exactely two indicators, each being a lowercase alphanumeric character or a space character (`a` to `z`, `0` to `9`, and ` `).
   Field tags are either a string of three digits or the string `LDR`.

- `pica`: all fields are variable without indicators. Field tags consist of four characters being
   a digit `0`, `1`, or `2`, followed by two digits, followed by an uppercase letter `A` to `Z` or `@`.

- `mab`: fields have one indicator and no occurrences. Field tags consist of three digits.

Restrictions on records by a format family imply [restrictions on schemas for this format family](#restrictions-by-format-family).

##### Example

Possible JSON serialization of a record of family `flat`, `marc`, and `pica`, respectively: 

~~~json
[
  { "tag": "given", "value": "Henriette" },
  { "tag": "given", "value": "Davidson" },
  { "tag": "surname", "value": "Avram" },
  { "tag": "birth", "value": "1919-10-07" }
]
~~~

~~~json
[
  { "tag": "LDR", "value": "00000nz  a2200000oc 4500" },
  { "tag": "001", "value": "1089521669" },
  { "tag": "100",
    "indicators": [ "1", " " ],
    "subfields": [
      "a", "Avram, Henriette D."
      "d", "1919-2006"
    ] }
]
~~~

~~~json
[
  { "tag": "003U", "subfields": [ "a", "http://d-nb.info/gnd/1089521669" ] },
  { "tag": "028A", "subfields": [ "d", "Henriette D.", "a", "Avram" ] },
  { "tag": "060R", "subfields": [ "a", "1919", "b", "2006", "4", "datl" ] }
]
~~~

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
* `rules` with [external validation rules](#external-validation-rules)
* `records` with a non-negative integer to indicate a number of records
* `created` with a timestamp when this schema was created
* `modified` with a timestamp when this schema was updated

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

Field identifiers of a field schedule MUST NOT overlap. Two field identifiers overlap when it is possible to match a field with both.

### Field identifier

[field identifier]: #field-identifier
[field identifiers]: #field-identifier
[field counter]: #field-identifier
[field occurrence]: #field-identifier

A **field identifier** is a non-empty string that can be used to match fields. The identifier consists of a [tag], optionally followed by the slash (`/`) and

- either a **field occurrence**, being a range of two digits except the single sequence of two digits (`00`),
- or the dollar character (`$`) followed by small letter x (`x`) and a **field counter**, being a range of one or two digits (`0`, `0-1`..., `00`, `00-01`..., `98-99`).

Applications MAY further allow a tag followed by the slash and two zeroes (`/00`) as alias for a bare tag.

A [field] **matches** a field identifier if the tag of the field is equal to the tag of the field identifier, and

* the field has no occurrence and the field identifier has no field occurrence nor field counter,
* or the occurrence of the field matches the range of the field occurrence,
* or the first subfield value of subfield with subfield code `x` matches the range of the field counter.

##### Examples

* `LDR`, `001`, `850`... (MARC)
* `021A`, `045Q/01`, `028B/01-02`, `209K`, `209A/$x00-09`, `247A/$x0`... (PICA)
* `001`, `100`, `805`... (MAB)

### Field definition

[field definition]: #field-definition
[field definitions]: #field-definition

A **field definition** is a JSON object that SHOULD contain key:

* `tag` with the [tag] of the field
* `label` with the name of the field
* `repeatable` with a boolean value, assumed as `false` by default
* `required` with a boolean value, assumed as `false` by default

The field definition MAY further contain keys:

* `occurrence` with the [field occurrence] of the field
* `counter` with the [field counter] of the field
* `url` with an URL link to documentation of the field
* `description` with additional description of the field
* `indicator1` with first [indicator definition] or `null` as placeholder for `{" ":{}}`
* `indicator2` with second [indicator definition] or `null` as placeholder for `{" ":{}}`
* `pica3` with corresponding Pica3 number
* `created` with a timestamp when this field was introduced
* `modified` with a timestamp when this field was changed
* `positions` with a specification of [positions] (for flat fields)
* `pattern` with a regular expression (for flat fields)
* `codes` with a [codelist]
* `subfields` with a [subfield schedule] (for variable fields)
* `rules` with [external validation rules](#external-validation-rules)
* `total` with a non-negative integer to indicate the number of times this field has been found
* `records` with a non-negative integer to indicate the number of records this field has been found in

If a field definition is given in a [field schedule], each of `tag`, `occurrence` and `counter` MUST either be missing or have same value as used to construct the corresponding [field identifier].

If a field definition contains the `subfield` keys indicating a variable field, it MUST NOT contain keys for flat fields (`positions`, `pattern` and/or `codes`).

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
A character position is a range. It is RECOMMENDED to use sequences of two digits.

A **data element definition** is a JSON object that SHOULD contain key:

* `label` with the name of the data element
* `start` with the start number of the character position
* `end` with the end number of the character position or the start number if there is no end number

The data element definition MAY further contain keys:

* `url` with an URL link to documentation
* `description` with additional description
* `codes` with a [codelist]
* `pattern` with a regular expression

Character positions of a positions object MUST NOT overlap. Two character positions overlap if there is a string that matches both of them.

##### Example

* Positions for MARC 21 field `005`:

    ~~~json
    {
      "00-03": { "label": "year", "start": 0, "end": 3 },
      "04-05": { "label": "month", "start": 4, "end": 5 },
      "06-07": { "label": "day", "start": 6, "end": 7 },
      "08-09": { "label": "hour", "start": 8, "end": 9 },
      "10-11": { "label": "minute", "start": 10, "end": 11 },
      "12-15": { "label": "second", "start": 12, "end": 15 }
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
* `rules` with [external validation rules](#external-validation-rules)
* `url` with an URL link to documentation
* `description` with additional description of the subfield
* `pica3` with a corresponding Pica3 syntax definition
* `created` with a timestamp when this subfield was introduced
* `modified` with a timestamp when this subfield was updated
* `total` with a non-negative integer to indicate the number of times this subfield has been found
* `records` with a non-negative integer to indicate the number of records this subfield has been found in

The subfield definition MAY but SHOULD NOT contain an additional, deprecated key

* `order` with a non-negative integer used to specify a partial or complete order of subfields

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
* `codes` with a [codelist] of single character codes

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
[code definition]: #code-definition

A **codelist** is 

- either a JSON object that maps codes to code definitions (**explicit codelist**)
- or a non-empty string that SHOULD be an URI (**codelist reference**).

A **code** is a non-empty string. A **code definition** is either a string or a JSON object with optional keys:

- `code` with the code
- `label` with the name of the code
- `description` with additional description of the code
- `created` with a timestamp when this code was introduced
- `modified` with a timestamp when this code was updated

Optional key `code` of a code definition must be equal to the key of the code definition in its codelist.

A code definition being a string MUST be treated identical to a codelist definition being JSON object with only key `label` having the value of the string.

A **codelist directory** is a JSON object that maps codelist references to JSON objects each having at least the mandatory key `codes` with a [codelist] and optional keys:

- `title` with a name of the codelist
- `description` with additional description of the codelist
- `created` with a timestamp when this codelist was introduced
- `modified` with a timestamp when this codelist was updated
- `url` with a homepage URL or link to documentation of the codelist

A codelist reference can be **resolved** by looking up its value as key in the codelist directory to get the corresponding explicit codelist.

##### Examples (explicit, reference, and codelist directory)

~~~json
{
  " ": "No specified type",
  "a": {
    "label": "Archival",
    "created": "2022"
  },
  "x": {
    "code": "x"
  }
}
~~~

~~~json
"http://id.loc.gov/vocabulary/languages"
~~~

~~~json
{
  "http://id.loc.gov/vocabulary/languages": {
    "title": "MARC List for Languages",
    "codes": {
      "eng": { "label": "English" },
      "fre": { "label": "French" }
    }
  }
}
~~~

### External validation rules

An Avram Schema MAY include references to additional validation rules with key `rules` at the [root level], at [field schedules](#field-schedule), and at [subfield schedules] to check additional data types or integrity constraints. The value of this keys MUST be an array of strings or arbitrary JSON objects. String elements MUST NOT be equal to names of [validation rules](#validation-rules) but they SHOULD be URIs.

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
            "rules": ["http://example.org/valid-date"]
        },
        "death": {
            "subfields": {
                "Y": { "label": "year" },
                "M": { "label": "month" },
                "D": { "label": "day" }
            },
            "rules": ["http://example.org/valid-date"]
        },
        "age": {
          "rules": ["xsd:nonNegativeInteger"]
        }
    },
    "rules": [
        "death must not be earlier than birth, except for time-travelers",
        "age must equal death minus birth, if given",
        {
            "if": "birth?",
            "then": "birth.Y < 1950",
            "description": "birth only allowed before 1950 for privacy reasons"
        },
    ]
}
~~~

### Restrictions by format family

A format family restricts the [model of records](#records) than can be described by an Avram schema. Known values of schema key `family` imply restriction on [field identifiers](#field-identifier) and [field definitions](#field-definition).

#### flat formats

Field identifiers are plain tags. Field definitions MUST NOT include keys `occurrence`, `counter`, `indicator1`, `indicator2`, or `subfields`.

#### marc formats

Field identifiers are plain tags and MUST either be the string `LDR` or three digits. Field definitions MUST NOT include keys `occurrence` or `counter`. Field definitions of flat fields MUST NOT have keys `indicator1` or `indicator2`.

#### pica formats

Field identifiers MUST NOT include a [field counter] if its tag starts with digit `0` or `1` and MUST NOT include a [field occurrence] if its tag starts with digit `2`.Tags MUST match the regular expression `^[012][0-9][0-9][A-Z@]`. Field definitions MUST NOT include keys `indicator1` or `indicator2`.

#### mab formats

Field identifiers are plain tags and MUST consist of excactely three digits. Field definitions MUST NOT include keys `indicator2`, `occurrence`, or `counter`. 

### Metaschema

A [JSON Schema](http://json-schema.org/) to validate Avram Schemas is available
at <https://format.gbv.de/schema/avram/schema.json>.

Applications MAY extend the metaschema for particular [format families](#records) and formats, for instance by further restriction of the allowed set of [field identifiers].

## Validation rules

Avram schemas can be used to validate [records] based on **validation rules** specfied in this section (marked in bold and numbered from 1 to 17). Rule 1 to 13 refer to validation of individual records, fields, and subfields. Rule 14 to 16 ([counting](#counting)) refer to validation of sets of records. Rule 17 can refer to both.

An Avram validator MAY limit validation to selected [format families](#record). An Avram validator MAY choose to support only a limited set of validation rules, it SHOULD allow to enable and disable selected rules and it MAY disable selected rules by default. Support and selection of validation rules MUST be documented.

1. **invalidRecord**: A set of records is valid against a schema, if all of its records pass [record validation] against the field schedule of the schema.

### Record validation

[record validation]: #record-validation

A record is valid against a [field schedule] if the following rules are met and every field passes [field validation] against its corresponding [field definition] from the field schedule. If rule **undefinedField** is disabled, fields without corresponding field definition are assumed to be valid.

2. **undefinedField**: Every field matches a field identifier in the field schedule.

3. **nonrepeatableField**: The record does not contain more than one field matching the same field definition with `repeatable` being `false`.

4. **missingField**: the record contains at least one field for each field definition with `required` being `true`.

### Field validation

[field validation]: #field-validation
[Field validation]: #field-validation

A field is valid against a [field definition] if the following rules are met:

5. **invalidFieldValue**: If the field is a flat field, its field value must be valid by [value validation].

6. **invalidIndicator**: If the field contains indicators, their values must be valid by [value validation] against the corresponding [indicator definition] `indicator1` (first indicator) and `indicator2` (second indicator).

If the field is a variable field:

7. **undefinedSubfield**: Every subfield has a corresponding [subfield definition].

8. **nonrepeatableSubfield**: For subfield definitions with `repeatable` being `true`, the field MUST NOT contain more than one subfield.

9. **missingSubfield**: For subfield definitions with `required` being `true`, the field MUST contain at least one subfield.

10. **invalidSubfieldValue**: Every subfield value is valid by [value validation] against its corresponding [subfield definition].

Tag and occurrence of a field are not included in field validation as they are part of [record validation](#record-validation).

### Value validation

[value validation]: #value-validation
[Value validation]: #value-validation

A value (given as string), is valid if it conforms to a definition (given as [field definition], [subfield definition], [indicator definition], or [data element definition](#positions)) by meeting the following rules:

11. **patternMismatch**: If the definition contains key `pattern`, the value must match its regular expression. The pattern is not anchored by default, so `^` and/or `$` must be included to match start and/or end of the value.

12. **invalidPosition**: If the definition contains key `positions`, the value must be [valid against its positions](#validation-with-positions).

If the definition contains key `codes`, the value must further be [valid against its codelist](#validation-with-codelists) (see corresponding rules below).
 
A value is always valid if the definition contains neither of keys `pattern`, `positions`, and `codes`.

### Validation with positions

[validation with positions]: #validation-with-positions
[Validation with positions]: #validation-with-positions

A string value is valid against [positions](#positions) if all substrings defined by character positions of the positions are valid against the corresponding data element definitions. Character positions are counted by Unicode code points.

Substrings can be empty, for instance when the value is shorter than some character position. An empty substring can be valid, depending on the data element definition.

### Validation with codelists

[validation with codelists]: #validation-with-codelists
[Validation with codelists]: #validation-with-codelists

13. **undefinedCode**: A string value is valid against an [explicit codelist](#codelist) if the value is a defined code in this codelist.

14. **undefinedCodelist**: A string value is valid against a [codelist reference](#codelist) if the codelist reference can be resolved and the value is defined in the resolved explicit codelist.

Applications MAY also resolve codelist references against externally defined explicit codelists by implicitly extending the codelist directory of the schema. If so, the application MUST make clear whether codelists directly defined in the codelist directory are overriden or extened.

### Counting

[Counting]: #counting

Avram schemas can also be used to give or expect a number of elements with keys `records` at [root level] and keys `records` and `total` at [field definitions], [subfield definitions](#subfield-schedule) and [code definitions](#codelist). Support of the following counting rules in Avram validators is OPTIONAL. An Avram validator MUST document whether it supports counting rules or not.

Validation rules for counting are:

14. **countRecord** to enable counting the total number of records,
   and the total numbers or records each field with a [field definition],
   each subfield with a [subfield definition], and each code with
   a [code definition](#codelist) is found in.

15. **countField** to enable counting the total number each field from the [field schedule] is found

16. **countSubfield** to enable counting the total number each subfield field from a [subfield schedule] is found

If selected counting rules are supported and enabled, then the following must be checked by an Avram validator:

- the number of validated records MUST be equal to the value of schema key `records` if this key exist (rule **`countRecord`**).

- if a [field definition] of the schema includes key `records` then the number of input records with this field MUST be equal to the number given by this key (combination of rules **`countRecord`** and **`countField`**).

- if a [subfield definition] of the schema includes key `records` then the number of input records with a field with this subfield MUST be equal to the number given by this key (combination of rules **`countRecord`** and **`countSubfield`**).

- if a [field definition] of the schema includes key `total` then the total number this field is contained in input records MUST be equal to the number given by this key (rule **`countField`**).

- if a [subfield definition] of the schema includes key `total` then the total number this subfield is contained in input records MUST be equal to the number given by this key (rule **`countSubfield`**).

### Validation with external validation rules

By default [external validation rules](#external-validation-rules) are ignored for validation because their semantics is out of the scope of this specification. The following rule can be enabled to require records to met all external rules:

17. **externalRule**: Enforces an Avram validator to process all external rules and reject input data as invalid if a rule is violated or cannot be checked.

## References

### Normative references

* T. Berners-Lee, R. Fielding, L. Masinter: *Uniform Resource Identifier (URI): Generic Syntax*.
  RFC 3986, January 2005, <https://tools.ietf.org/html/rfc3986>.

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
[RFC 3986]: https://tools.ietf.org/html/rfc3986
[RFC 7159]: https://tools.ietf.org/html/rfc7159

### Informative references

#### Implementations

- **[avram-js](https://github.com/gbv/avram-js) reference implementation of an Avram validator**, also includes an Avram meta-validator to check whether an Avram schema conforms to this specification
- [QA catalogue](https://github.com/pkiraly/metadata-qa-marc) Java implementation for MARC-based formats
- [PICA::Schema](https://metacpan.org/pod/PICA::Schema) Perl implementation for PICA-based formats
- [MARC::Schema](https://metacpan.org/pod/MARC::Schema) Perl implementation for MARC-based formats

#### Related standards

- [MARCspec - A common MARC record path language](http://marcspec.github.io/MARCspec/marc-spec.html)
- [JSON Table Schema](https://frictionlessdata.io/specs/table-schema/) schema format for tabular data
- [JSON Schema](https://json-schema.org/) schema language for JSON formats

## Appendix

### Acknowledgments

Thanks to Péter Király for [picking up the idea](https://github.com/pkiraly/metadata-qa-marc/issues/45) and for collaborative development. Thanks to Carsten Klee, Ed Summers, Harry Gegic, Johann Rolschewski, Stefan Majewski, Thomas Frings, and Timothy Thompson
for comments, code and contributions.

### Changes

#### 0.9.4 - 2024-01-02

- Change expressing field counters in field identifiers (`xNN` to `/$xNN`)
- Define indicator value `null` as placeholder for `{" ":{}}`
- Rename and redefine `checks` as `rules`

#### 0.9.3 - 2023-12-22

- Add formal specification of URI and URL based on RFC 3986
- Allow plain strings as code definition
- Remove code counting
- Disallow overlapping field identifiers of a field schedule
- Rename validation options and replace numbered validation rules

#### 0.9.2 (2023-11-29)

- Change codelist directory to support codelist metadata (*breaking change!*)
- Remove subfield key `order` and validation option `check_subfield_order`
- Enumerate and better describe validation rules
- Add examples and improve wording
- Change semantics of counting options on validation

#### 0.9.1 (2023-11-27)

- Add optional code definition key `code`.
- Extend Metaschema.

#### 0.9.0 (2023-10-27)

- Remove `deprecated-fields`, `deprecated-subfields` and `deprecated-codes`.
- Allow `created` and `modified` at schema, field, subfield and code.
- Add position keys `start` and `end`.

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

