# Avram Specification

> Specification of a schema language for MARC and related formats such as PICA and MAB

This git repository contains the specification of **Avram** Schema Language.

The specification is published at <https://format.gbv.de/schema/avram/specification>. See repository <https://github.com/gbv/format.gbv.de/> for additional sources.

## Source files

- `specification.md` - Avram specification in Markdown format
- `schema.yaml` - Avram JSON Schema (in YAML syntax)
- `case.yaml` - Avram test case JSON Schema (in YAML syntax)
- `test/*.yaml` - Test suite
- `test/*.js` - Unit tests
- `test/schema/*.json` - Example schemas

The repository further contains a test script to check well-formedness of JSON schema. Run with:

~~~bash
npm install
npm test
~~~ 

## Test Suite

Subdirectory `test` contains a set of example schemas and records that
implementors of Avram validation libraries can use to test their validators.
The directory contains a number of `.yaml` test files which logically group a
set of test cases. The structure can best be illustrated with an example: 

~~~yaml
---
- description: Check existence of required fields
  schema:
    fields:
      245:
        required: true
  tests:
  - description: required field exists
    data:
    - ['245', '1', '0', 'a', 'Who is it?']
    valid: true
  - description: required field is missing
    data: []
    valid: false
~~~

The record instances as value of JSON field `data` are given in [MARC JSON]
or [PICA JSON] format as array of arrays.

[MARC JSON]: http://format.gbv.de/marc/json
[PICA JSON]: http://format.gbv.de/pica/json

The test suite does not fully cover all aspects of Avram yet.

The test suite itself is also validated with `npm test`.

## Implementations

See <https://format.gbv.de/schema/avram/specification#informative-references>

*Contribution is welcome!*
