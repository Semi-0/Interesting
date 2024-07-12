import {  build_matcher_expr, run_matcher, first_equal_with, P} from "pmatcher/MatchBuilder";
import { match_constant, type matcher_callback } from "pmatcher/MatchCallback";
import { is_match_key, type MatchDict } from "pmatcher/MatchDict/MatchDict";
import { construct_simple_generic_procedure } from "generic-handler/GenericProcedure";
import type { MatchEnvironment } from "pmatcher/MatchEnvironment";
import { MatchResult, matchSuccess, type MatchFailure } from "pmatcher/MatchResult";
import { define_generic_procedure_handler } from "generic-handler/GenericProcedure";
import { first, isArray } from "pmatcher/utility";
import { inspect } from "bun";

import { v4 as uuidv4} from 'uuid';

const ExprStore = new Map<string[], (...args: any[]) => any>();



export const EP = {
    symbol : uuidv4()
}

export const  E = {
    constant : uuidv4(),
    arg : uuidv4(),
}

const compile_to_matcher = construct_simple_generic_procedure("compare_to_matchers", 1, (pattern: any[]) => {
    throw Error(`unrecognized pattern in the build procedure: ${inspect(pattern)}`)
})


define_generic_procedure_handler(compile_to_matcher,
    isArray,
    (pattern: any[]) => {
        return pattern.map((item: any) => compile_to_matcher(item))
    }
)


export function is_match_constant(pattern: any): boolean {
    return first_equal_with(pattern, E.constant) || typeof pattern === "string"
}

define_generic_procedure_handler(compile_to_matcher,
    is_match_constant,
    (pattern: any[]) => {
        return  [EP.symbol, pattern[0]]
    }
)

define_generic_procedure_handler(compile_to_matcher,
    is_match_arg,
    (pattern: any[]) => {
        if (pattern.length === 2){
            const arg_var = pattern[1]
            return [P.element, arg_var]
        }
        else if (pattern.length === 3 ){
            const arg_var = pattern[1]
            const critics = pattern[2]
            return [P.element, arg_var, critics]
        }
    }
)

export function is_many(pattern: any[]): boolean{
        return isArray(pattern) && pattern[pattern.length - 1] === "..."

}

export function get_var_name(pattern: any[]): any[] {
    const result: any[] = [];

    function extract_var_names(subPattern: any[]) {
        for (const item of subPattern) {
            if (is_match_arg(item)) {
                result.push(item[1]);
            } 
            else if (is_many(item)){
                extract_var_names(item.slice(0, -1))
            }
            else if (isArray(item)) {
                extract_var_names(item);
            }
        }
    }

    extract_var_names(pattern);
    return result;
}



define_generic_procedure_handler(compile_to_matcher, is_many,
    (pattern: any[]) => {
        const matchers = pattern.slice(0, -1)
        const vars = get_var_name(matchers)

        if (vars.length > 0){
            return [P.many, [P.new, vars, matchers]]
        }
        else{
            return [P.many, matchers]
        }
    }
)


console.log(compile_to_matcher(["test", [E.arg, "a"], [[[E.arg, "b"], [E.arg, "c"]], "..."], [[E.arg, "c"], [E.arg, "d"]]]))


// TODO: adapt our short expression language to matcher language in the evaluator
type evaluator = (expr: any[], 
    env: MatchEnvironment, 
    continuation: (expr: any[], env: MatchEnvironment) => any) => any


function get_symbol_constant(symbol: any): string{
    return "unimplemented";
}

function is_match_symbol(pattern: any[]): boolean{
    return first_equal_with(pattern, EP.symbol) && pattern.length === 2;
}

function match_symbol(symbol: string): matcher_callback {
    return (data: any[], dictionary: MatchDict, matchEnv: MatchEnvironment, succeed: (dictionary: MatchDict, nEaten: number) => any): any  => {
       return match_constant(get_symbol_constant(symbol))(data, dictionary, matchEnv, succeed);
    }
}


define_generic_procedure_handler(build_matcher_expr,
    is_match_symbol,
    (pattern: any[]) => {
        return match_symbol(pattern[1])
    }
)

function is_match_arg(pattern: any[]): boolean{
    return first_equal_with(pattern, E.arg) && (pattern.length === 2 || pattern.length === 3);
}


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
            const matchResult = run_matcher(build_matcher_expr(expr), data, (dict, nEaten) => {
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