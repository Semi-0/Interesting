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

// console.log("result", main("(cond (((equal? 1 2) 'a) ((equal? 1 1) (+ 1 2)) (else  'b)))"))


// const t = match(parse(parseExpr, new State("(define x 42)")).value, ["define", [[P.element, "x", (x) => x !== undefined]], [P.element, "y"]])
// console.log(inspect(t))