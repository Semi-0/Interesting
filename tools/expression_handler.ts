import {  compile,  run_matcher, first_equal_with, P} from "pmatcher/MatchBuilder";
import {  type matcher_instance } from "pmatcher/MatchCallback";
import { is_match_key, type MatchDict } from "pmatcher/MatchDict/MatchDict";
import { construct_simple_generic_procedure } from "generic-handler/GenericProcedure";
import type { MatchEnvironment } from "pmatcher/MatchEnvironment";
import { define_generic_procedure_handler } from "generic-handler/GenericProcedure";
import { first, isArray } from "pmatcher/GenericArray";
import { inspect } from "bun";
import 'ts-array-extensions'
import { v4 as uuidv4} from 'uuid';
import { isString } from "effect/Predicate";
import { match_constant } from "pmatcher/MatchCombinator";
import { equal } from "pmatcher/utility";
import { SchemeElement, isSchemeStr } from "../definition/SchemeElement";
// const ExprStore = new Map<string[], (...args: any[]) => any>();
import { match_args } from "generic-handler/Predicates";
import { GenericProcedureMetadata } from "generic-handler/GenericProcedureMetadata";
import { SimpleDispatchStore } from "generic-handler/DispatchStore";
import type { MatchResult } from "./MatcherWrapper";
import type { MatchPartialSuccess } from "pmatcher/MatchResult/PartialSuccess";


// // console.log(compile_to_matcher(["test", [E.arg, "a"], [[[E.arg, "b"], [E.arg, "c"]], "..."], [[E.arg, "c"], [E.arg, "d"]]]))


// // TODO: adapt our short expression language to matcher language in the evaluator
type evaluator = (expr: any[], 
    env: MatchEnvironment, 
    continuation: (expr: any[], env: MatchEnvironment) => any) => any

type ExprStore = Map<string[], evaluator>

define_generic_procedure_handler(
    equal, 
    match_args(isString, isSchemeStr), 
    (a: string, b: SchemeElement) => {
        return a === b.value
    }
)



// const expr_store = new Map<string[], evaluator>()

// function construct_evaluator(store: Map<(...args: any) => any, GenericProcedureMetadata>){
//     const constructor = (name: string, arity: number, defaultHandler: (expression: MatchResult | MatchPartialSuccess) => any) => {
//         const metaData = new GenericProcedureMetadata(name, arity, new SimpleDispatchStore(), defaultHandler)
//         const the_evaluator = (expression: SchemeElement[], ...args: any[]) => {
//             const result = evaluator_dispatch(metaData, expression)
//             const matchResult = first(result)
//             const argHandler = second(result)
//             return argHandler(matchResult, ...args)
//         }
//         if (expr_store !== undefined){
//             set_store(generic_procedure_store)
//             set_metaData(the_generic_procedure, metaData)
//         }
//         else{
//             set_metaData(the_generic_procedure, metaData)
//         }
//         return the_generic_procedure
//     }
//     return constructor
//     }
// }


// function expr_store_dispatch(data: any[]):  evaluator | null {


//     // how to handle expr mismatch?
//     for (const [expr, handler] of ExprStore.entries()) {
//             const matchResult = run_matcher(expr_to_matcher(expr), data, (dict, nEaten) => {
//                 return dict
//             });

//             if (matchSuccess(matchResult)) {
//                 // @ts-ignore
//                 return handler;
//             }


//     }
//     return null;
// }

// export function define_expr_handler(expr: any[], callback: evaluator) {
//     ExprStore.set(expr, callback);
// }