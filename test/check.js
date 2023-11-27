const assert = require('assert')
const fs = require('fs')
const path = require('path')
const ajv = require('ajv')()
const yaml = require('js-yaml')

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))

// compilation also validates the JSON Schemas
const isAvram = ajv.compile(yaml.safeLoad(fs.readFileSync('./schema.yaml')))
const isTestcase = ajv.compile(yaml.safeLoad(fs.readFileSync('./case.yaml')))

const files = fs.readdirSync(__dirname).filter(f => path.extname(f) === '.yaml')

files.forEach(filename => {
  describe(filename, () => {
    let testset = yaml.safeLoad(fs.readFileSync(path.join(__dirname, filename)))
    testset.forEach((testcase) => {    
      it(testcase.description, () => {
        // is an actual Avram testcase 
        assert(isTestcase(testcase), JSON.stringify(isTestcase.errors))

        // the schema is valid Avram format 
        assert(isAvram(testcase.schema), JSON.stringify(isAvram.errors))

        // TODO: execute validation and check results. See avram-js

      })
    })
  })
})
