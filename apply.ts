import { construct_simple_generic_procedure } from "./tools/GenericProcedure/GenericProcedure"
import type { LispElement } from "./definition/LispElement"
import { Environment } from "./definition/Environment"

export const apply = construct_simple_generic_procedure("apply",
    3, default_apply
)

function default_apply(procedure: LispElement, operands: LispElement[], env: Environment){
   throw Error("unknown procedure type" + procedure.toString())
}