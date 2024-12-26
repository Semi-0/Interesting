import {parseExpr} from "./Parser"
import {parse, State} from "parse-combinator"
import { define_expr, evaluate } from "./Evaluator"
import { Environment } from "./definition/Environment"
import { SchemeElement } from "./definition/SchemeElement"

import { match, P } from "pmatcher/MatchBuilder"

type returnType = [any, Environment]

function continuation(exp: SchemeElement, env: Environment): SchemeElement {
    // console.log("continuation", exp.toString(), inspect(env))
    return evaluate(exp, env, continuation)
}

export function main(input: string): SchemeElement {
    const parsed = parse(parseExpr, new State(input))
    // console.log("parsed", parsed.value?.toString())
    return evaluate(parsed.value, new Environment(), continuation)
}


console.log(main("(((lambda (x) (lambda (y) (+ x y))) 2) 3)"))