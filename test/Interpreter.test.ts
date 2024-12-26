import { schemeList } from '../definition/SchemeElement';
import { DefaultEnvironment } from '../definition/Environment';
import { clear_env, interp, main } from '../Repl';
import { schemeSymbol, schemeBoolean, schemeNumber, SchemeElement, SchemeType } from '../definition/SchemeElement';

describe('Interpreter Tests', () => {
  let env: DefaultEnvironment;

  beforeEach(() => {
 
    clear_env()
  });

  test('evaluate if expression true branch', () => {
    const expr = "(if #t 1 2)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(1);
  });

  test('evaluate if expression false branch', () => {
    const expr = "(if #f 1 2)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(2);
  });

  test('evaluate define variable expression', () => {
    const expr = "(begin (define x 42) x)"
    const result = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(42);
  });

  test('evaluate define function expression', () => {
    const expr = "(begin (define (f x) (+ x 1)) (f 41))"
    const result = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(42);
  });

  test('evaluate define function with multiple parameters', () => {
    const expr = "(begin (define (f x y) (+ x y)) (f 41 1))"
    const result = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(42);
  });

  test('evaluate define function with lambda', () => {
    const expr = "(begin (define f (lambda (y) (+ 1 y))) (f 41))"
    const result = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(42);
  });

  test("define a variable and set!", () => {
    const expr = "(begin (define x 42) (set! x 43) x)"
    const result = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(43);
  });


  test('evaluate lambda expression with one variable', () => {
    const expr = "((lambda (x) x) 5)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(5);
  });

  test('evaluate lambda expression with increment operation', () => {
    const expr = "((lambda (x) (+ x 1)) 1)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(2);
  });

  test('evaluate lambda expression with two variables', () => {
    const expr = "((lambda (x y) (+ x y)) 5 3)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(8);
  });

  test('evaluate lambda expression with three variables', () => {
    const expr = "((lambda (a b c) (* a b c)) 2 3 4)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(24);
  });


  test('evaluate lambda expression with currying', () => {
    const expr = "(((lambda (y) (lambda (x) (+ x y))) 1) 2)"
    const result = main(expr)
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(3);
  })

  test('evaluate let expression', () => {
    const expr = "(let ((x 5)) x)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(5);
  });

  test('evaluate quotation', () => {
    const expr = "(quote x)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.symbol);
    expect(result.get_value()).toEqual('x');
  });

  test('evaluate addition with primitive functions', () => {
    const expr = "(+ 3 4)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(7);
  });

  test('evaluate multiplication with primitive functions', () => {
    const expr = "(* 5 6)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(30);
  });

  test('evaluate subtraction with primitive functions', () => {
    const expr = "(- 10 4)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(6);
  });

  test('evaluate division with primitive functions', () => {
    const expr = "(/ 20 4)"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(5);
  });

  test('evaluate let expression with multiple variables and arithmetic operations', () => {
    const expr = "(let ((x 5) (y 3)) (+ x y))"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(8);
  });


  test("evaluate multiple line args", () => {
    const expr = "(define x 1)\nx"
    const result: SchemeElement = main(expr);
    expect(result.get_type()).toEqual(SchemeType.number);
    expect(result.get_value()).toEqual(1);
  });

  // TODO: cond 
  // define apply
  // tail recursion
  // curring in 

  // Additional tests for cond, begin, and set! can be added here
});