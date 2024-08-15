import { define_generic_procedure_handler } from "generic-handler/GenericProcedure"
import { is_equal } from "./PublicState"
import { match_args } from "generic-handler/Predicates"

export var CellValue = ["cell_value", []]

export type CellValue = any[]

export function is_cell_value(value: any): boolean {
    return typeof value === "object" && value[0] === "cell_value"
} 

export function construct_cell_value(value: any): any[] {
    return ["cell_value", [value]]
}

export function get_cell_value(value: any): any {
    return value[1][0]
}

export const the_nothing = construct_cell_value("&&the_nothing&&")

export function is_nothing(value: any): boolean {
    return is_cell_value(value) && get_cell_value(value) === "&&the_nothing&&"
} 

export const the_contradiction = construct_cell_value("&&the_contradiction&&") 

export function is_contradiction(value: any): boolean {
    return is_cell_value(value) && get_cell_value(value) === "&&the_contradiction&&"
}


define_generic_procedure_handler(
    is_equal,
    match_args(is_cell_value, is_cell_value),
    (a: any, b: any) => {
        return get_cell_value(a) === get_cell_value(b)
    }
)





