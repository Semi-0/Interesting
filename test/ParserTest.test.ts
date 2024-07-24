import { parseExpr } from '../Parser';
import { parse, State } from "parse-combinator";
import { SchemeElement, schemeStr, schemeNumber,  schemeBoolean, schemeList, schemeSymbol } from '../definition/SchemeElement';

describe('parseExpr', () => {
  test('parses symbols correctly', () => {
    const input = new State("hello");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(schemeSymbol("hello"));
  });

  test('parses numbers correctly', () => {
    const input = new State("123");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(schemeNumber(123));
  });

  test('parses strings correctly', () => {
    const input = new State('"hello"');
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(schemeStr("hello"));
  });

  test('parses booleans correctly', () => {
    const inputTrue = new State("#t");
    const resultTrue = parse(parseExpr, inputTrue);
    expect(resultTrue.value).toEqual(schemeBoolean(true));

    const inputFalse = new State("#f");
    const resultFalse = parse(parseExpr, inputFalse);
    expect(resultFalse.value).toEqual(schemeBoolean(false));
  });

  test('parses quoted expressions correctly', () => {
    const input = new State("'x");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(schemeList([schemeSymbol("quote"), schemeSymbol("x")]));
  });

  test('parses lists correctly', () => {
    const input = new State("(a b c)");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(schemeList([
      schemeSymbol("a"),
      schemeSymbol("b"),
      schemeSymbol("c")
    ]));
  });

  test('parses complex expressions correctly', () => {
    const input = new State("(lambda (x) (+ 1 2))");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(schemeList([
      schemeSymbol("lambda"),
      schemeList([schemeSymbol("x")]),
      schemeList([
        schemeSymbol("+"),
        schemeNumber(1),
        schemeNumber(2)
      ])
    ]));
  });
});

import { main } from '../Repl';
import { Environment } from '../definition/Environment';
import {  SchemeType } from '../definition/SchemeElement';
import { match, P } from 'pmatcher/MatchBuilder';
import { inspect } from 'util';

describe('REPL Functionality', () => {
    // ... existing tests ...

    test('matches SchemeElement with pattern', () => {
        const test_array = new SchemeElement(["1", "2", "3"], SchemeType.List);
        const test_result = match(test_array, [[P.element, "a"], "2", "3"]);
        console.log(inspect(test_result, { showHidden: true, depth: 20 }));

        // Add assertions based on the expected structure of test_result
        expect(test_result).toBeDefined();
        expect(test_result._dictionary).toBeDefined();
        expect(test_result._dictionary.dict).toBeInstanceOf(Map);
        expect(test_result._dictionary.dict.size).toBe(1);
        expect(test_result._dictionary.dict.get('a')).toBeDefined();
        expect(test_result._dictionary.dict.get('a').referenced_definition).toBeInstanceOf(Map);
        expect(test_result._dictionary.dict.get('a').referenced_definition.get(0)).toBe('1');
        expect(test_result._nEaten).toBe(1);
        expect(test_result.dictionary).toBeDefined();
        expect(test_result.dictionary.dict).toBeInstanceOf(Map);
        expect(test_result.dictionary.dict.size).toBe(1);
        expect(test_result.dictionary.dict.get('a')).toBeDefined();
        expect(test_result.dictionary.dict.get('a').referenced_definition).toBeInstanceOf(Map);
        expect(test_result.dictionary.dict.get('a').referenced_definition.get(0)).toBe('1');
        expect(test_result.nEaten).toBe(1);
    });

    test('matches SchemeElement with simple pattern', () => {
      const test_array = new SchemeElement([schemeStr("a")], SchemeType.List);
      const test_result = match(test_array, ["a"]);
      console.log(inspect(test_result, { showHidden: true, depth: 20 }));

      // Add assertions based on the expected structure of test_result
      expect(test_result).toBeDefined();
      expect(test_result._dictionary).toBeDefined();
      expect(test_result._dictionary.dict).toBeInstanceOf(Map);
      expect(test_result._dictionary.dict.size).toBe(0);
      expect(test_result._nEaten).toBe(1);
      expect(test_result.dictionary).toBeDefined();
      expect(test_result.dictionary.dict).toBeInstanceOf(Map);
      expect(test_result.dictionary.dict.size).toBe(0);
      expect(test_result.nEaten).toBe(1);
  });

    // ... existing tests ...
});