
import { define_generic_procedure_handler } from "generic-handler/GenericProcedure";
import 'ts-array-extensions'
import { match } from "pmatcher/MatchBuilder"
import { isSucceed } from "pmatcher/Predicates";
import { MatchResult } from "pmatcher/MatchResult/MatchResult";
import { construct_advice, install_advice } from "./Advice";
import { apply } from "pmatcher/MatchResult/MatchGenericProcs"
export const no_change : (proc:any) => any =  (proc: any) => { return proc }

const make_exec = (result: MatchResult) => {
    return (proc: (...args: any[]) => any) => {
        return apply(proc, result)
    }
}

export function matcher_advice() : any[]{
    var matchResult: MatchResult | null = null 

    const input_modifers =  [no_change,
                             (expr: any[]) => { 
                                return (input: any[], ...args: any[]) => {
                                    matchResult = match(input, expr)
                                    return isSucceed(matchResult)
                                }
                              },
                              (handler: (exec: (...args: any[]) => any, ...args: any[]) => any) => { 
                                return (result: any, ...args: any[]) => {
                                    //@ts-ignore
                                    return handler(make_exec(matchResult), ...args)
                                }}]
    return construct_advice(input_modifers, no_change)
}

export function log_advice(){
    var input: any[] = []
    return construct_advice([ 
        no_change,
        (expr: any[], ...args: any[]) => { input = expr; return expr},
        (handler: any) => {return (mresult: MatchResult, ...args:any[]) => {
            console.log("input", input)
            console.log("match result", mresult)
            return handler(mresult, ...args)
        }}], 
        no_change)
}

export const define_generic_matcher = install_advice(matcher_advice(), define_generic_procedure_handler)




