import { construct_simple_generic_procedure, define_generic_procedure_handler } from "./tools/GenericProcedure/GenericProcedure"
import { match_args } from "./tools/GenericProcedure/Predicates"
import { LSymbol, type LispElement, List } from "./definition/LispElement"
import { is_environment, Environment } from "./definition/Environment"
import { PrimitiveFunctions } from "./definition/PrimitiveFunction"
import { evaluate, advance } from "./Evaluate"
import { LNumber, LString, LBoolean, wrapValueIntoLispElement, unwrapLispElement } from "./definition/LispElement"
import { Closure } from "./definition/Closure"
import { PrimitiveSymbol } from "./definition/LispElement"
import { inspect } from "util"

const primitive_environment = new PrimitiveFunctions()

export const apply = construct_simple_generic_procedure("apply",
    3, default_apply
)

function default_apply(procedure: LispElement, operands: LispElement[], env: Environment){
   throw Error("unknown procedure type" + procedure.toString() + "with operands" + operands.toString() + "in environment" + env.toString())
}

function is_operand(operand: LispElement): boolean{
    return operand instanceof List
}

function is_primitive_function(lispElement: LispElement): boolean{
    return lispElement instanceof PrimitiveSymbol 
}

define_generic_procedure_handler(apply,
    match_args( 
        is_primitive_function,
        is_operand,
        is_environment,
    ),
    (primitive_function, operand, env) => {
        return apply_primitive_procedure(primitive_function,  eval_operands(operand, env).mapToArray((v) => v))
    }
)

function apply_primitive_procedure(primitive_function: LSymbol, operands: LispElement[]): LispElement{
   let generalized_values = operands.map((value: LispElement) => {
        return unwrapLispElement(value)
    })
   return  wrapValueIntoLispElement(primitive_environment.applyFunction(primitive_function.value, ...generalized_values))
}


function eval_operands(operands: List, env: Environment): List{
    return operands.map(operand => advance(evaluate(operand, env)))
}


define_generic_procedure_handler(apply, 
    match_args(
        is_strict_compound_procedure,
        is_operand,
        is_environment
    ),
    (procedure: Closure, operands: List, env: Environment) => {
        return apply_compound_procedure(procedure, operands, env)
    }
)

function is_strict_compound_procedure(procedure: LispElement): boolean{
    return procedure instanceof Closure 
}

function apply_compound_procedure(procedure: Closure, operands: List, env: Environment): LispElement{
    if (procedure.parameters.length() !== operands.length()){
        throw Error("wrong number of arguments")
    }
    
    let new_env = env.extends_list(procedure.parameters, eval_operands(operands, env))
    return evaluate(procedure.body, new_env)
}