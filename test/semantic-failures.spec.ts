import { tm } from './utils'

/**
 * JavaScript semantic conformance regression tests. Keep the assertions in
 * terms of observable behaviour rather than compiler implementation details.
 */
describe('JavaScript semantic conformance', (): void => {
  describe('this binding', (): void => {
    it('preserves primitive this values in strict functions', (): void => {
      tm(`
        function strictThis() {
          'use strict'
          return this
        }
        result = strictThis.call(1)
        expect(result).equal(1)
      `)
    })

    it('boxes primitive this values in non-strict functions', (): void => {
      tm(`
        function looseThis() {
          return typeof this
        }
        result = looseThis.call(1)
        expect(result).equal('object')
      `)
    })

    it('binds undefined to this in an unbound strict call', (): void => {
      tm(`
        'use strict'
        var result
        function strictThis() {
          return this
        }
        result = strictThis()
        expect(result).equal(undefined)
      `)
    })

    it('uses the containing object as this in literal accessors', (): void => {
      tm(`
        'use strict'
        var receiver
        var object = {
          get value() { return this },
          set value(next) { receiver = this },
        }
        expect(object.value).equal(object)
        object.value = 1
        expect(receiver).equal(object)
      `)
    })
  })

  describe('arguments object', (): void => {
    it('maps indexed values to parameters in non-strict functions', (): void => {
      tm(`
        function update(value) {
          arguments[0] = 2
          expect(value).equal(2)
          value = 3
          expect(arguments[0]).equal(3)
        }
        update(1)
      `)
    })

    it('does not map indexed values to parameters in strict functions', (): void => {
      tm(`
        function update(value) {
          'use strict'
          arguments[0] = 2
          expect(value).equal(1)
          value = 3
          expect(arguments[0]).equal(2)
        }
        update(1)
      `)
    })

    it('provides the ES5 callee and length descriptors', (): void => {
      tm(`
        function inspect() {
          expect(Object.getPrototypeOf(arguments)).equal(Object.prototype)
          expect(arguments.callee).equal(inspect)
          expect(Object.getOwnPropertyDescriptor(arguments, 'length').configurable).equal(true)
          expect(delete arguments.callee).equal(true)
        }
        inspect(1)
      `)
    })

    it('throws for strict caller and callee access', (): void => {
      tm(`
        function inspect() {
          'use strict'
          var callerThrew = false
          var calleeThrew = false
          try { arguments.caller } catch (error) { callerThrew = error instanceof TypeError }
          try { arguments.callee } catch (error) { calleeThrew = error instanceof TypeError }
          expect(callerThrew).equal(true)
          expect(calleeThrew).equal(true)
        }
        inspect()
      `)
    })
  })

  describe('evaluation order and references', (): void => {
    it('implements delete for references and non-references', (): void => {
      tm(`
        var local = 1
        var object = { value: 1 }
        expect(delete local).equal(false)
        expect(delete object.value).equal(true)
        expect(object.hasOwnProperty('value')).equal(false)
        expect(delete 42).equal(true)
      `)
    })

    it('boxes primitive bases and rejects nullish bases for delete', (): void => {
      tm(`
        expect(delete (1).value).equal(true)
        var threw = false
        try { delete null.value } catch (error) { threw = error instanceof TypeError }
        expect(threw).equal(true)
      `)
    })

    it('evaluates the callee before call arguments', (): void => {
      tm(`
      const events = []

      function getCallee() {
        events.push('callee')
        return function(value) {
          events.push('call:' + value)
        }
      }

      function getArgument() {
        events.push('argument')
        return 1
      }

      getCallee()(getArgument())

      expect(events).to.be.deep.equal([
        'callee',
        'argument',
        'call:1',
      ])
      `)
    })

    it('reads the left-hand value before evaluating the right-hand side of a compound assignment', (): void => {
      tm(`
      let value = 1
      value += (value = 2)

      expect(value).equal(3)
      `)
    })
  })

  describe('control flow', (): void => {
    it('checks cases after default before selecting the default clause', (): void => {
      tm(`
      const events = []

      switch (2) {
        default:
          events.push('default')
        case 2:
          events.push('case:2')
      }

      expect(events).to.be.deep.equal(['case:2'])
      `)
    })

    it('propagates an exception after running a finally block without catch', (): void => {
      tm(`
      const events = []
      let caught = false

      try {
        try {
          throw new Error('boom')
        } finally {
          events.push('finally')
        }
      } catch (error) {
        caught = true
      }

      expect(events).to.be.deep.equal(['finally'])
      expect(caught).equal(true)
      `)
    })

    it('runs a finally block before completing a return', (): void => {
      tm(`
      const events = []

      function getValue() {
        try {
          return 1
        } finally {
          events.push('finally')
        }
      }

      expect(getValue()).equal(1)
      expect(events).to.be.deep.equal(['finally'])
      `)
    })

    it('returns normally from inside a for-in loop', (): void => {
      tm(`
      function firstKey(object) {
        for (var key in object) {
          return key
        }
        return undefined
      }

      expect(firstKey({ first: 1 })).equal('first')
      `)
    })
  })

  describe('function kinds', (): void => {
    it('captures this lexically in an arrow function', (): void => {
      tm(`
      const owner = {
        value: 1,
        makeReader: function() {
          return () => this.value
        },
      }

      const read = owner.makeReader()

      expect(read.call({ value: 2 })).equal(1)
      `)
    })

    it('captures arguments lexically in an arrow function', (): void => {
      tm(`
      function outer(value) {
        const readOuterArgument = () => arguments[0]
        return readOuterArgument('inner')
      }

      expect(outer('outer')).equal('outer')
      `)
    })
  })

  describe('lexical bindings', (): void => {
    it('throws when assigning to a const binding', (): void => {
      tm(`
      let caught = false

      try {
        const value = 1
        value = 2
      } catch (error) {
        caught = true
      }

      expect(caught).equal(true)
      `)
    })

    it('throws when reading a let binding in its temporal dead zone', (): void => {
      tm(`
      let caught = false

      try {
        const observed = value
        let value = 1
      } catch (error) {
        caught = true
      }

      expect(caught).equal(true)
      `)
    })

    it('evaluates an assignment RHS before a temporal-dead-zone write fails', (): void => {
      tm(`
      let rhsWasEvaluated = false

      try {
        value = (rhsWasEvaluated = true)
        let value
      } catch (error) {}

      expect(rhsWasEvaluated).equal(true)
      `)
    })

    it('throws ReferenceError when reading an unresolved identifier', (): void => {
      tm(`
      let caught = false

      try {
        const observed = missingSemanticTestBinding
      } catch (error) {
        caught = true
      }

      expect(caught).equal(true)
      `)
    })

    it('returns undefined from typeof on an unresolved identifier', (): void => {
      tm(`
      expect(typeof missingSemanticTypeofBinding).equal('undefined')
      `)
    })
  })
})
