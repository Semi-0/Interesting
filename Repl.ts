import {parseExpr} from "./Parser"
import {parse, State} from "parse-combinator"
import { define_expr, evaluate } from "./Evaluator"
import { Environment } from "./definition/Environment"
import { SchemeElement } from "./definition/SchemeElement"

import { match, P } from "pmatcher/MatchBuilder"
import { Reply } from "parse-combinator"
type returnType = [any, Environment]

function continuation(exp: SchemeElement, env: Environment): SchemeElement {
    // console.log("continuation", exp.toString(), inspect(env))
    return evaluate(exp, env, continuation)
}

export function skip_return(input: string): string {
    if (input.startsWith("\n")){
        return input.slice(1)
    }
    else{
        return input
    }
}

export function jump_to_next_paren(parsed: Reply<any, any>, input: string): string {
    return skip_return(input.slice(parsed.state.position))
}

export function interp(env: Environment): (input: string) => SchemeElement {
    return (input: string) => {
        const parsed = parse(parseExpr, new State(input))
        // console.log("parsed", parsed.value?.toString())

        if (parsed.success){
            const last_result = evaluate(parsed.value, env, continuation)
            if (parsed.state.position === input.length){
                return last_result
            }
            else{
                return interp(env)(jump_to_next_paren(parsed, input))
            }
        }
        else{
            console.log(parsed)
            throw Error("parsing failed")
        }
    }
}

export const main = interp(new Environment())

// // todo contious evaluation if parsing is not totally exhausted
// console.log(main(`(define x 1)
// x`));