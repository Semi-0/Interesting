import { evaluate  } from '../Evaluate';
import { LNumber, LSymbol,  LBoolean } from '../definition/SchemeElement';
import { Environment } from '../definition/Environment';

describe('Interpreter Tests', () => {
  let env: Environment;

  beforeEach(() => {
    env = new Environment();
    // Setup environment with necessary primitive functions if any
  });

  test('evaluate if expression true branch', () => {
    const expr =  [
      new LSymbol('if'), 
      new LBoolean(true), 
      new LNumber(1), 
      new LNumber(2)
    ];
    const result = evaluate(expr, env);
    expect(result).toBeInstanceOf(LNumber);
    expect(result.value).toEqual(1);
  });

  test('evaluate if expression false branch', () => {
    const expr = [
      new LSymbol('if'), 
      new LBoolean(false), 
      new LNumber(1), 
      new LNumber(2)
    ];
    const result = evaluate(expr, env);
    expect(result).toBeInstanceOf(LNumber);
    expect(result.value).toEqual(2);
  });

  test('evaluate define expression', () => {
    const expr = [
      new LSymbol('define'), 
      new LSymbol('x'), 
      new LNumber(42)
    ];
    evaluate(expr, env);
    expect((env.lookup('x') as LNumber).value).toEqual(42);
  });

  test('evaluate lambda expression with one variable', () => {
    // Lambda expression that takes one parameter and returns it
    const lambdaExpr = [
      new LSymbol('lambda'),
      [new LSymbol('x')], // Parameter
      new LSymbol('x') // Body: return x
    ]

    // Call expression that applies the lambda to argument 5
    const callExpr = [lambdaExpr, new LNumber(5)];
    const result = evaluate(callExpr, env);
    expect(result.value).toEqual(5); // Expect the result to be 5
  });

  test('evaluate lambda expression with increment operation', () => {
    // Lambda expression that takes one parameter and increments it by 1
    const lambdaExpr = [
      new LSymbol('lambda'),
      [new LSymbol('x')], // Parameter
      [new LSymbol('+'), new LSymbol('x'), new LNumber(1)] // Body: x + 1
    ];

    // Call expression that applies the lambda to argument 1
    const callExpr =  [lambdaExpr, new LNumber(1)];
    const result = evaluate(callExpr, env);
    expect(result.value).toEqual(2); // Expect the result to be 1 + 1 = 2
  });

  test('evaluate lambda expression with two variables', () => {
    // Lambda expression that takes two parameters and adds them
    const lambdaExpr = [
      new LSymbol('lambda'),
      [new LSymbol('x'), new LSymbol('y')], // Parameters
      [new LSymbol('+'), new LSymbol('x'), new LSymbol('y')] // Body: x + y
    ];

    // Call expression that applies the lambda to arguments 5 and 3
    const callExpr = [lambdaExpr, new LNumber(5), new LNumber(3)];
    const result = evaluate(callExpr, env);
    expect(result.value).toEqual(8); // Expect the result of 5 + 3
  });

  test('evaluate lambda expression with three variables', () => {
    // Lambda expression that multiplies three parameters
    const lambdaMultExpr = [
      new LSymbol('lambda'),
      [new LSymbol('a'), new LSymbol('b'), new LSymbol('c')], // Parameters
      [new LSymbol('*'), new LSymbol('a'), new LSymbol('b'), new LSymbol('c')] // Body: a * b * c
    ];

    // Call expression that applies the lambda to arguments 2, 3, and 4
    const callMultExpr = [lambdaMultExpr, new LNumber(2), new LNumber(3), new LNumber(4)];
    const resultMult = evaluate(callMultExpr, env);
    expect(resultMult.value).toEqual(24); // Expect the result of 2 * 3 * 4
  });

  test('evaluate let expression', () => {
    const letExpr = [
      new LSymbol('let'), 
      [[new LSymbol('x'), new LNumber(5)]], 
      [new LSymbol('x')]
    ];
    const result = evaluate(letExpr, env);
    expect(result.value).toEqual(5);
  });

  test('evaluate quotation', () => {
    const quoteExpr = [
      new LSymbol('quote'), 
      new LSymbol('x')
    ];
    const result = evaluate(quoteExpr, env);
    expect(result).toBeInstanceOf(LSymbol);
    expect((result as LSymbol).value).toEqual('x');
  });
  test('evaluate addition with primitive functions', () => {
    const addExpr = [
      new LSymbol('+'), 
      new LNumber(3), 
      new LNumber(4)
    ];
    const result = evaluate(addExpr, env);
    expect(result.value).toEqual(7);
  });

  test('evaluate multiplication with primitive functions', () => {
    const multExpr = [
      new LSymbol('*'), 
      new LNumber(5), 
      new LNumber(6)
    ];
    const result = evaluate(multExpr, env);
    expect(result.value).toEqual(30);
  });

  test('evaluate subtraction with primitive functions', () => {
    const subExpr = [
      new LSymbol('-'), 
      new LNumber(10), 
      new LNumber(4)
    ];
    const result = evaluate(subExpr, env);
    expect(result.value).toEqual(6);
  });

  test('evaluate division with primitive functions', () => {
    const divExpr = [
      new LSymbol('/'), 
      new LNumber(20), 
      new LNumber(4)
    ];
    const result = evaluate(divExpr, env);
    expect(result.value).toEqual(5);
  });

  test('evaluate let expression with multiple variables and arithmetic operations', () => {
    // Test with addition
    const letAddExpr = [
      new LSymbol('let'),
      [
        ([new LSymbol('x'), new LNumber(5)]),
        ([new LSymbol('y'), new LNumber(3)])
      ],
      [new LSymbol('+'), new LSymbol('x'), new LSymbol('y')]
    ];
    const resultAdd = evaluate(letAddExpr, env);
    expect(resultAdd.value).toEqual(8);

    // Test with subtraction
    const letSubExpr = [
      new LSymbol('let'),
      [
        [new LSymbol('x'), new LNumber(10)],
        [new LSymbol('y'), new LNumber(4)]
      ],
      [new LSymbol('-'), new LSymbol('x'), new LSymbol('y')]
    ];
    const resultSub = evaluate(letSubExpr, env);
    expect(resultSub.value).toEqual(6);

    // Test with multiplication
    const letMultExpr = [
      new LSymbol('let'),
      [
        [new LSymbol('x'), new LNumber(7)],
        [new LSymbol('y'), new LNumber(6)]
      ],
      [new LSymbol('*'), new LSymbol('x'), new LSymbol('y')]
    ];
    const resultMult = evaluate(letMultExpr, env);
    expect(resultMult.value).toEqual(42);

    // Test with division
    const letDivExpr = [
      new LSymbol('let'),
      [
        [new LSymbol('x'), new LNumber(20)],
        [new LSymbol('y'), new LNumber(4)]
      ],
      [new LSymbol('/'), new LSymbol('x'), new LSymbol('y')]
    ];
    const resultDiv = evaluate(letDivExpr, env);
    expect(resultDiv.value).toEqual(5);
  });


// test uncovered, cond, begin set!


  // Add more tests for other expressions and error cases
});

