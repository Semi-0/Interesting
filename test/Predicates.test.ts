import { match_args } from '../tools/GenericProcedure/predicates';
import { construct_simple_generic_procedure, define_generic_procedure_handler } from '../tools/GenericProcedure/GenericProcedure';

describe('matchArgs function', () => {
  test('should return true when all predicates match the arguments', () => {
    const isNumber = (arg: any): boolean => typeof arg === 'number';
    const isString = (arg: any): boolean => typeof arg === 'string';
    const match = match_args(isNumber, isString);

    expect(match(10, 'hello')).toBe(true);
  });

  test('should return false when a predicate does not match an argument', () => {
    const isNumber = (arg: any): boolean => typeof arg === 'number';
    const isString = (arg: any): boolean => typeof arg === 'string';
    const match = match_args(isNumber, isString);

    expect(match(10, 20)).toBe(false);
  });

  test('should throw an error when the number of predicates does not match the number of arguments', () => {
    const isNumber = (arg: any): boolean => typeof arg === 'number';
    const match = match_args(isNumber);

    expect(() => match(10, 'hello')).toThrow("Predicates and arguments length mismatch");
  });
});

describe('Generic Procedure Integration with define_generic_procedure_handler using match_args', () => {
  const defaultHandler = (...args: any[]) => "default";
  const numberStringHandler = (...args: any[]) => "handled number and string";

  // Construct a simple generic procedure
  const genericProcedure = construct_simple_generic_procedure("testProcedure", 2, defaultHandler);

  // Define a handler using define_generic_procedure_handler with match_args
  const numberStringPredicate = match_args(
    (arg: any) => typeof arg === 'number',
    (arg: any) => typeof arg === 'string'
  );
  define_generic_procedure_handler(genericProcedure, numberStringPredicate, numberStringHandler);

  test('should handle number and string input correctly', () => {
    expect(genericProcedure(10, "hello")).toBe("handled number and string");
  });

  test('should return default handler for unmatched types', () => {
    expect(genericProcedure(10, 20)).toBe("default");
    expect(genericProcedure("hello", "world")).toBe("default");
  });

  test('should throw an error for incorrect number of arguments', () => {
    expect(() => genericProcedure(10)).toThrow("Predicates and arguments length mismatch");
    expect(() => genericProcedure()).toThrow("Predicates and arguments length mismatch");
  });
});