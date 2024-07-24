
import { construct_simple_generic_procedure} from 'generic-handler/GenericProcedure';
import { define_generic_matcher } from '../tools/expression_handler';
import { apply } from 'pmatcher/MatchResult/MatchGenericProcs';
import { match, P } from 'pmatcher/MatchBuilder';
import type { MatchResult } from 'pmatcher/MatchResult/MatchResult';

describe('Expression Handler', () => {
    test('test_eval adds two numbers correctly', () => {
        const test_eval = construct_simple_generic_procedure("test_eval", 2, (...args: any[]) => {
            return args[0] + args[1];
        });

        define_generic_matcher(test_eval, 
            [[P.element, "a"], "b"], 
            (result: MatchResult, other: number) => {
                console.log("match result", result)
                return apply((a: any) => { return Number(a) + other }, result);
            }
        );

        const result = test_eval([1, "b"], 2);
        console.log(result)
        expect(result).toBe(3);
    });
});