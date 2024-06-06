import { MatchDict, MatchResult, match_eqv, MatchConstant, match_element, MatchElement } from '../tools/Matcher';
import {test, expect, describe, beforeEach} from "bun:test";
describe('MatchResult', () => {
    let dictionary: MatchDict;
    let matchResult: MatchResult;

    beforeEach(() => {
        // Create a new dictionary and MatchResult before each test
        dictionary = new MatchDict(new Map([
            ['key1', 10],
            ['key2', 20]
        ]));
        matchResult = new MatchResult(true, dictionary, 2);
    });

    test('do function should apply a callback to the dictionary values', () => {
        // Define a callback that sums numbers
        const sumCallback = (...numbers: number[]) => numbers.reduce((a, b) => a + b, 0);

        // Use the `do` function with the sumCallback
        const result = matchResult.do(sumCallback);

        // Expect the result to be the sum of the values in the dictionary
        expect(result).toBe(30); // 10 + 20
    });

    test('do function should handle callbacks that concatenate strings', () => {
        // Adjust the dictionary for string testing

        const testMatchResult = new MatchResult(true, new MatchDict(new Map([
            ['first', 'Hello, '],
            ['second', 'World!']
        ])), 2);

   

        // Define a callback that concatenates strings
        const concatCallback = (...strings: string[]) => strings.join('');

        // Use the `do` function with the concatCallback
        const result = testMatchResult.do(concatCallback);

        // Expect the result to be a concatenation of the values
        expect(result).toBe('Hello, World!');
    });
});

test('x_matcher matches correctly', () => {
    const x_matcher = (data: string[], dictionary: MatchDict): MatchResult => {
        return match_eqv(new MatchConstant("x"))(data, dictionary);
    };

    // Test case where the input matches the pattern "x"
    let result = x_matcher(["x"], new MatchDict(new Map()));
    expect(result.success).toBe(true);
    expect(result.nEaten).toBe(1);

    // Test case where the input does not match the pattern "x"
    result = x_matcher(["y", "x"], new MatchDict(new Map()));
    expect(result.success).toBe(false);
    expect(result.nEaten).toBe(0);
});

test('match_element handles variable binding and matching correctly', () => {
    const elementMatcher = match_element(new MatchElement("x"));

    // Test case where "x" is bound to "a"
    let result = elementMatcher(["a"], new MatchDict(new Map()));
    expect(result.success).toBe(true);
    expect(result.nEaten).toBe(1);
    expect(result.dictionary.get("x")).toBe("a");

    // Test case where "x" is already bound to "a", and input is "b"
    let preBoundDict = new MatchDict(new Map([["x", "a"]]));
    result = elementMatcher(["b"], preBoundDict);
    expect(result.success).toBe(false);
    expect(result.nEaten).toBe(0);

    // Test case where "x" is already bound to "a", and input is "a"
    result = elementMatcher(["a"], preBoundDict);
    expect(result.success).toBe(true);
    expect(result.nEaten).toBe(1);
});