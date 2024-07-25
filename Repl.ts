import {parseExpr} from "./Parser"
import {parse, State} from "parse-combinator"
import { evaluate } from "./Evaluator"
import { Environment } from "./definition/Environment"
import { SchemeElement } from "./definition/SchemeElement"
import { inspect } from "bun"

type returnType = [any, Environment]

function continuation(exp: SchemeElement, env: Environment): returnType {
    console.log("continuation", exp.toString(), inspect(env))
    return evaluate(exp, env, continuation)
}

export function main(input: string): returnType {
    const parsed = parse(parseExpr, new State(input))
    console.log("parsed", parsed.value?.toString())
    return evaluate(parsed.value, new Environment(), continuation)
}

console.log("result", main("(cond (((equal? 1 2) 'a) ((equal? 1 1) (+ 1 2)) (else  'b)))"))