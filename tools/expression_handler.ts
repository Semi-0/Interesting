
import { define_generic_procedure_handler } from "generic-handler/GenericProcedure";
import 'ts-array-extensions'
import { match } from "pmatcher/MatchBuilder"
import { isSucceed } from "pmatcher/Predicates";
import { MatchResult } from "pmatcher/MatchResult/MatchResult";
import { construct_advice, install_advice } from "./Advice";

export function matcher_advice() : any[]{
    var matchResult: MatchResult | null = null 

    const input_modifers =  [(proc: any) =>{ return proc },
                             (expr: any[]) => { 
                                return (input: any[], ...args: any[]) => {
                               
                                    matchResult = match(input, expr)
                                    if (isSucceed(matchResult)){
                                        return true
                                    }
                                    else{
                                        return false
                                    }
                                }
                              },
                              (handler: (mresult: MatchResult, ...args: any[]) => any) => { 
                                return (result: any, ...args: any[]) => {
                                    // @ts-ignore
                                    return handler(matchResult, ...args)
                                }}]
    return construct_advice(input_modifers, (result: any) => { return result})
}

export function log_advice(){
    var input: any[] = []
    return construct_advice([ 
        (proc: any) => {  return proc},
        (expr: any[], ...args: any[]) => { input = expr; return expr},
        (handler: any) => {return (mresult: MatchResult, ...args:any[]) => {
            console.log("input", input)
            console.log("match result", mresult)
            return handler(mresult, ...args)
        }}], 
        (a: any) => {  return a})
}

export const define_generic_matcher = install_advice(matcher_advice(), define_generic_procedure_handler)




