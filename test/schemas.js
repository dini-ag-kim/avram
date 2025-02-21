const assert = require('assert')
const fs = require('fs')
const path = require('path')
const ajv = require('ajv')()
const yaml = require('js-yaml')

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))
const validate = ajv.compile(yaml.safeLoad(fs.readFileSync('./schema.yaml')))

const files = fs.readdirSync(path.join(__dirname, 'schema')).filter(s => s.endsWith('.json'))
const load = filename => JSON.parse(fs.readFileSync(path.join(__dirname, 'schema', filename)))

describe('valid schemas', () => {
  files.filter(name => name.startsWith('valid')).forEach(name => {
    it(name, () => assert(validate(load(name)), JSON.stringify(validate.errors)))
  })
})

describe('invalid schemas', () => {
  files.filter(name => name.startsWith('invalid')).forEach(name => {
    it(name, () => assert(!validate(load(name)), name))
  })
})
