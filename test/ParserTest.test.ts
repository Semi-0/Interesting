import { parseExpr } from '../Parser';
import {parse} from "parse-combinator"
import { State } from 'parse-combinator';
import { LString, LNumber, LSymbol, LBoolean, List } from '../definition/LispElement';

describe('parseExpr', () => {
  test('parses symbols correctly', () => {
    const input = new State("hello");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(new LSymbol("hello"));
  });

  test('parses numbers correctly', () => {
    const input = new State("123");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(new LNumber(123));
  });

  test('parses strings correctly', () => {
    const input = new State('"hello"');
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(new LString("hello"));
  });

  test('parses booleans correctly', () => {
    const inputTrue = new State("#t");
    const resultTrue = parse(parseExpr, inputTrue);
    expect(resultTrue.value).toEqual(new LBoolean(true));

    const inputFalse =  new State("#f");
    const resultFalse = parse(parseExpr, inputFalse);
    expect(resultFalse.value).toEqual(new LBoolean(false));
  });

  test('parses quoted expressions correctly', () => {
    const input = new State("'x");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(new List([new LSymbol("quote"), new LSymbol("x")]));
  });

  test('parses lists correctly', () => {
    const input = new State("(a b c)");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(new List([new LSymbol("a"), new LSymbol("b"), new LSymbol("c")]));
  });

  test('parses complex expressions correctly', () => {
    const input = new State("(lambda (x) (+ 1 2))");
    const result = parse(parseExpr, input);
    expect(result.value).toEqual(new List([
      new LSymbol("lambda"),
      new List([new LSymbol("x")]),
      new List([
        new LSymbol("+"),
        new LNumber(1),
        new LNumber(2)
      ])
    ]));
  });
});