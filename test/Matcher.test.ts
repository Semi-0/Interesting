import { MatchDict, MatchResult, match_eqv, MatchConstant, match_element, MatchElement, match_segment, MatchSegment } from '../tools/Matcher';
import {test, expect, describe, beforeEach, mock, jest} from "bun:test";

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

describe('match_eqv', () => {
    test('should call succeed with correct parameters when match is found', () => {
        const pattern_constant = new MatchConstant("x");
        const matcher = match_eqv(pattern_constant);
        const mockData = ["x"];
        const mockDictionary = new MatchDict(new Map());
        const mockSucceed = mock();

        matcher(mockData, mockDictionary, mockSucceed);

        expect(mockSucceed).toHaveBeenCalledWith(mockDictionary, 1);
    });

    test('should return false when no data is provided', () => {
        const pattern_constant = new MatchConstant("x");
        const matcher = match_eqv(pattern_constant);
        const mockData : string[] = [];
        const mockDictionary = new MatchDict(new Map());
        const mockSucceed = mock();

        const result = matcher(mockData, mockDictionary, mockSucceed);

        expect(result).toBe(false);
        expect(mockSucceed).not.toHaveBeenCalled();
    });

    test('should return false when the first element does not match', () => {
        const pattern_constant = new MatchConstant("x");
        const matcher = match_eqv(pattern_constant);
        const mockData = ["y"];
        const mockDictionary = new MatchDict(new Map());
        const mockSucceed = mock();

        const result = matcher(mockData, mockDictionary, mockSucceed);

        expect(result).toBe(false);
        expect(mockSucceed).not.toHaveBeenCalled();
    });
});

describe('match_element', () => {
    test('should handle variable binding correctly when unbound', () => {
        const element = new MatchElement("x");
        const matcher = match_element(element);
        const mockData = ["a"];
        const mockDictionary = new MatchDict(new Map());
        const mockSucceed = jest.fn();

        matcher(mockData, mockDictionary, mockSucceed);

        expect(mockSucceed).toHaveBeenCalledWith(expect.any(MatchDict), 1);
        expect(mockSucceed.mock.calls[0][0].get("x")).toBe("a");
    });

    test('should handle variable binding correctly when already bound to the same value', () => {
        const element = new MatchElement("x");
        const matcher = match_element(element);
        const mockData = ["a"];
        const mockDictionary = new MatchDict(new Map([["x", "a"]]));
        const mockSucceed = jest.fn();

        matcher(mockData, mockDictionary, mockSucceed);

        expect(mockSucceed).toHaveBeenCalledWith(mockDictionary, 1);
    });

    test('should return false when already bound to a different value', () => {
        const element = new MatchElement("x");
        const matcher = match_element(element);
        const mockData = ["b"];
        const mockDictionary = new MatchDict(new Map([["x", "a"]]));
        const mockSucceed = jest.fn();

        const result = matcher(mockData, mockDictionary, mockSucceed);

        expect(result).toBe(false);
        expect(mockSucceed).not.toHaveBeenCalled();
    });
});

describe('match_segment', () => {
    test('should handle segment matching correctly when unbound', () => {
        const segment = new MatchSegment("segment");
        const matcher = match_segment(segment);
        const mockData = ["hello", "world"];
        const mockDictionary = new MatchDict(new Map());
        const mockSucceed = jest.fn((result: any) => {
            console.log(result)
            return false
        });

        matcher(mockData, mockDictionary, mockSucceed);

        expect(mockSucceed).toHaveBeenCalledTimes(2);
        expect(mockSucceed.mock.calls[1][0].get("segment")).toEqual(["hello", "world"]);
        expect(mockSucceed).toHaveBeenCalledWith(expect.any(MatchDict), 2);
    });

    test('should handle segment matching correctly when already bound to the same value', () => {
        const segment = new MatchSegment("segment");
        const matcher = match_segment(segment);
        const mockData = ["hello", "world"];
        const mockDictionary = new MatchDict(new Map([["segment", ["hello", "world"]]]));
        const mockSucceed = jest.fn();

        matcher(mockData, mockDictionary, mockSucceed);

        expect(mockSucceed).toHaveBeenCalledWith(mockDictionary, 2);
    });

    test('should return false when already bound to a different value', () => {
        const segment = new MatchSegment("segment");
        const matcher = match_segment(segment);
        const mockData = ["different", "input"];
        const mockDictionary = new MatchDict(new Map([["segment", ["hello", "world"]]]));
        const mockSucceed = jest.fn();

        const result = matcher(mockData, mockDictionary, mockSucceed);

        expect(result).toBe(false);
        expect(mockSucceed).not.toHaveBeenCalled();
    });
});
