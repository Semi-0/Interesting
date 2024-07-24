import {parseExpr} from "./Parser"
import {parse, State} from "parse-combinator"
import {evaluate} from "./Evaluate(deprecated)"
import { Environment } from "./definition/Environment"
import { unwrapLispElement } from "./definition/SchemeElement"


type returnType = [any, Environment]

export function main(input: string, environment: Environment): returnType {
    const parsed = parse(parseExpr, new State(input))
    return [unwrapLispElement(evaluate(parsed.value, environment)), environment]
}

console.log(main("(+ 1 3 2)", new Environment()))