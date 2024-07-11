import { build, run_matcher, first_equal_with, P } from "pmatcher/MatchBuilder";
import { match_constant, type matcher_callback } from "pmatcher/MatchCallback";
import { is_match_key, type MatchDict } from "pmatcher/MatchDict/MatchDict";
import { construct_simple_generic_procedure } from "generic-handler/GenericProcedure";
import type { MatchEnvironment } from "pmatcher/MatchEnvironment";
import { MatchResult, matchSuccess, type MatchFailure } from "pmatcher/MatchResult";
import { define_generic_procedure_handler } from "generic-handler/GenericProcedure";
import { first } from "pmatcher/utility";


const ExprStore = new Map<string[], (...args: any[]) => any>();

type evaluator = (expr: any[], 
    env: MatchEnvironment, 
    continuation: (expr: any[], env: MatchEnvironment) => any) => any


function get_symbol_constant(symbol: any): string{
    return "unimplemented";
}

function match_symbol(symbol: string): matcher_callback {
    return (data: any[], dictionary: MatchDict, matchEnv: MatchEnvironment, succeed: (dictionary: MatchDict, nEaten: number) => any): any  => {
       return match_constant(get_symbol_constant(symbol))(data, dictionary, matchEnv, succeed);
    }
}

function is_match_symbol(pattern: any[]): boolean{
    return first_equal_with(pattern, "symbol") && pattern.length === 2;
} 


define_generic_procedure_handler(build, is_match_symbol, 
    (pattern: any[]) => {
        // need to adapt scheme lisp to it
        return build(match_symbol(pattern[1]));
    }
)

function is_match_arg(pattern: any[]): boolean{
    return first_equal_with(pattern, "arg") && pattern.length === 3;
}

define_generic_procedure_handler(build, is_match_arg, 
    (pattern: any[]) => {
        return build([P.element, pattern[1], pattern[2]]);
    }
)


function construct_evaluator(default_handler: (data: any[], env: MatchEnvironment, continuation: (expr: any[], env: MatchEnvironment) => any) => any): evaluator {
   return (expr: any[], 
           env: MatchEnvironment, 
           continuation: (expr: any[], env: MatchEnvironment) => any) => {
            const result = expr_store_dispatch(expr);
            if (result) {
                return result(expr, env, continuation);
            }
            return default_handler(expr, env, continuation);
    };
}


function expr_store_dispatch(data: any[]):  evaluator | null {
    // how to handle expr mismatch?
    for (const [expr, handler] of ExprStore.entries()) {
            const matchResult = run_matcher(build(expr), data, (dict, nEaten) => {
                return dict
            });

            if (matchSuccess(matchResult)) {
                // @ts-ignore
                return handler;
            }


    }
    return null;
}

export function define_expr_handler(expr: any[], callback: evaluator) {
    ExprStore.set(expr, callback);
}