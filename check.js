const assert = require('assert')
const fs = require('fs')
const path = require('path')
const ajv = require('ajv')()
const yaml = require('js-yaml')

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))

// compilation also validates the JSON Schemas
const isAvram = ajv.compile(yaml.safeLoad(fs.readFileSync('./schema.yaml')))
const isTestcase = ajv.compile(yaml.safeLoad(fs.readFileSync('./case.yaml')))

describe("Test files", () => {
  const dir = path.join(__dirname, '/tests')
  const files = fs.readdirSync(dir).filter(f => path.extname(f) === '.yaml')

  files.forEach(filename => {
    it(path.basename(filename, '.yaml'), () => {
      let testset = yaml.safeLoad(fs.readFileSync(path.join(dir, filename)))
      testset.forEach((testcase, number) => {
        let name = `testcase ${number+1} "${testcase.description}"`
        assert(isTestcase(testcase), name + ":\n" + JSON.stringify(isTestcase.errors))
        assert(isAvram(testcase.schema), name + ":\n" + JSON.stringify(isAvram.errors)) 
      })
    })
  })
})
