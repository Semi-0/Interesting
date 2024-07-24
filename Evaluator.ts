import { construct_simple_generic_procedure } from "generic-handler/GenericProcedure"
import { SchemeType,  SchemeElement } from "./definition/SchemeElement"
import { define_generic_matcher } from "./tools/expression_handler"
import type { Environment } from "./definition/Environment"
import { match } from "pmatcher/MatchBuilder"
import {P} from "pmatcher/MatchBuilder"
export const evaluate = construct_simple_generic_procedure("evaluate", 3, (...args: any[]) => {
    return args[0]
})

function default_eval(expression: SchemeElement, env: Environment, continuation: (result: SchemeElement) => SchemeElement): SchemeElement{
    const application_expr = match(expression,
        [[P.element, "operator"], [P.segment, "operands"]]
    )
}