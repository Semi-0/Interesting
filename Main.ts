import {parseExpr} from "./Parser"
import {parse, State} from "parse-combinator"
import { define_expr, evaluate } from "./Evaluator"
import { DefaultEnvironment } from "./definition/Environment"
import { SchemeElement } from "./definition/SchemeElement"

import { match, P } from "pmatcher/MatchBuilder"
import { Reply } from "parse-combinator"
import { loadFile } from "./tools/utility"
import { define_generic_matcher } from "./tools/ExpressionHandler"
import type { EvalHandler } from "./Evaluator"
type returnType = [any, DefaultEnvironment]

function continuation(exp: SchemeElement, env: DefaultEnvironment): SchemeElement {
    // console.log("continuation", exp.toString(), inspect(env))
    return evaluate(exp, env, continuation)
}

export function skip_return(input: string): string {
    if (input.startsWith(" ")){
        return input.slice(1)
    }
    else{
        return input
    }
}

export function jump_to_next_paren(parsed: Reply<any, any>, input: string): string {
    return skip_return(input.slice(parsed.state.position))
}

export function interp(env: DefaultEnvironment): (input: string) => SchemeElement {
    return (input: string) => {
        const cleanedInput = preprocessInput(input);
        const parsed = parse(parseExpr, new State(cleanedInput))
        // console.log("parsed", parsed.value?.toString())

        if (parsed.success){
            const last_result = evaluate(parsed.value, env, continuation)
            if (parsed.state.position === cleanedInput.length){
                return last_result
            }
            else{
                return interp(env)(jump_to_next_paren(parsed, cleanedInput))
            }
        }
        else{
            console.error("Parsing error:", parsed.expected);
            throw Error("parsing failed: " + parsed.expected);
        }
    }
}

const env = new DefaultEnvironment()
export const main = interp(env)

export function clear_env(){
    // for debug
    env.dict = {}
}




export async function evaluate_file(filePath: string, env: DefaultEnvironment): Promise<SchemeElement>{
    const code = await loadFile(filePath, {requiredExtension: ".pscheme"})

    return interp(env)(code)
}

// i know this is not a good way, but this is the way to prevent circular dependency 

export const load_expr = ["load", [P.element, "file_path"]]

define_generic_matcher(evaluate, load_expr, ((exec, env, continuation): EvalHandler => {
    return exec((file_path: SchemeElement) => {
        return evaluate_file(evaluate(file_path, env, continuation).value, env)
    });
}) as EvalHandler)


// // todo contious evaluation if parsing is not totally exhausted
// console.log(main(`(define x 1)
// x`));

// Before parsing, let's clean up the input
function preprocessInput(input: string): string {
    return input
        .split('\n')
        .filter(line => {
            const trimmedLine = line.trim();
            return trimmedLine && !trimmedLine.startsWith('//');  // Skip empty lines and comments
        })
        .join(' ');
}


// console.log(await evaluate_file("./TestFiles/primitivePair.pscheme", env))