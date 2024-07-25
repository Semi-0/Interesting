import {parseExpr} from "./Parser"
import {parse, State} from "parse-combinator"
import { evaluate } from "./Evaluator"
import { Environment } from "./definition/Environment"
import { SchemeElement } from "./definition/SchemeElement"
import { inspect } from "bun"

type returnType = [any, Environment]

function continuation(exp: SchemeElement, env: Environment): returnType {
    // console.log("continuation", exp.toString())
    return evaluate(exp, env, continuation)
}

export function main(input: string): returnType {
    const parsed = parse(parseExpr, new State(input))
    // console.log(parsed.value)
    return evaluate(parsed.value, new Environment(), continuation)
}

console.log("result", main("((lambda (x) (+ x 1)) 1)"))