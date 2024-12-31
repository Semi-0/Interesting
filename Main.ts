import {parseExpr} from "./Parser"
import {parse, State} from "parse-combinator"
import { define_expr, evaluate } from "./Evaluator"
import { DefaultEnvironment } from "./definition/Environment"
import { construct_feedback, SchemeElement } from "./definition/SchemeElement"

import { match, P } from "pmatcher/MatchBuilder"
import { Reply } from "parse-combinator"
import { loadFile, loadFileSync } from "./tools/utility"
import { define_generic_matcher } from "./tools/ExpressionHandler"
import type { EvalHandler } from "./Evaluator"
import path from 'path';

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

export var env = new DefaultEnvironment()
export const main = interp(env)

export function clear_env(){
    // for debug
    env.dict = {}
}


// var current_file_path = ""

// export async function evaluate_file(filePath: string, env: DefaultEnvironment): Promise<SchemeElement>{
//     const code = loadFileSync(filePath, {requiredExtension: ".interesting"})
//     current_file_path = filePath
//     return interp(env)(code)
// }

// const PROJECT_ROOT = path.resolve(__dirname, '..');

// function resolveRelativePath(basePath: string, relativePath: string): string {
//     const path = require('path');
//     // If the path starts with '/', treat it as relative to project root
//     if (relativePath.startsWith('/')) {
//         return path.join(PROJECT_ROOT, relativePath.slice(1));
//     }
//     // Otherwise, resolve relative to the current file
//     const baseDir = path.dirname(basePath);
//     return path.resolve(baseDir, relativePath);
// }

// // i know this is not a good way, but this is the way to prevent circular dependency 
// // file path would depending on the file path of the current file
// // load only works in node.js
// export const load_expr = ["load", [P.element, "file_path"]]

// define_generic_matcher(evaluate, load_expr, ((exec, env, continuation): EvalHandler => {
//     return exec((file_path: SchemeElement) => {
//        const resolvedPath = resolveRelativePath(current_file_path, file_path.value);
//        return evaluate_file(resolvedPath, env)
//     });
// }) as EvalHandler)


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


// console.log(await evaluate_file("./TestFiles/testLoad.pscheme", env))