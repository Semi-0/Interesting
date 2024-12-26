import { construct_simple_generic_procedure, define_generic_procedure_handler } from "generic-handler/GenericProcedure"
import { match_args } from "generic-handler/Predicates"
import { SchemeElement, is_scheme_boolean, is_scheme_element, is_scheme_symbol  } from "./definition/SchemeElement"

import { is_environment, Environment } from "./definition/Environment"

import { SchemeType } from "./definition/SchemeElement"

import { map_procedure } from "./definition/SchemeElement"
import { is_continuation } from "./Evaluator"
import { extend } from "./definition/Environment"

export const apply = construct_simple_generic_procedure("apply_eval",
    4, default_apply
)

function default_apply(procedure: SchemeElement, operands: SchemeElement[], env: Environment, continuation: (result: SchemeElement, env: Environment) => SchemeElement){
   throw Error("unknown procedure type" + procedure.toString() + "with operands" + operands.toString() + "in environment" + env.toString())
}

function is_operands(operands: SchemeElement[]): boolean{
    return operands instanceof Array
}

function is_primitive_func(operator: SchemeElement): boolean{
    return is_scheme_element(operator) && operator.is_type(SchemeType.primitiveFunc)
}

define_generic_procedure_handler(apply,
    match_args( 
        is_primitive_func,
        is_operands,
        is_environment,
        is_continuation,
    ),
    (operator, operands, env, continuation) => {
        return apply_primitive_function(operator,  ...eval_operands(operands, env, continuation))
    }
)

export function apply_primitive_function(func: SchemeElement, ...args: SchemeElement[]): SchemeElement{
    return map_procedure(func, (f: (...args: any[]) => any) => f(...args.map((arg: SchemeElement) => arg.get_value())))
}

function eval_operands(operands: SchemeElement[], env: Environment, continuation: (result: SchemeElement, env: Environment) => SchemeElement): SchemeElement[]{
    return operands.map(operand => continuation(operand, env))
}


define_generic_procedure_handler(apply, 
    match_args(
        is_strict_compound_procedure,
        is_operands,
        is_environment,
        is_continuation,
    ),
    (procedure: SchemeElement, operands: SchemeElement[], env: Environment, continuation: (result: SchemeElement, env: Environment) => SchemeElement) => {
        return apply_compound_procedure(procedure, eval_operands(operands, env, continuation), env, continuation)
    }
)

function is_strict_compound_procedure(procedure: SchemeElement): boolean{
    return procedure instanceof SchemeElement && procedure.is_type(SchemeType.closure)
}

function apply_compound_procedure(procedure: SchemeElement, operands: SchemeElement[], env: Environment, continuation: (result: SchemeElement, env: Environment) => SchemeElement): SchemeElement{
    if (procedure.value.parameters.length !== operands.length){
        throw Error("wrong number of arguments")
    }
    
    let new_env = extend(procedure.value.parameters, operands, env)
    return continuation(procedure.value.body, new_env)
}