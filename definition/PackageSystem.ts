import { compose } from "effect/Function"
import { construct_primitive_procedure, SchemeElement } from "./SchemeElement"
import { create_dict_value, summarize_scoped_value, type scoped_value } from "./ScopedReference"
import type { Env } from "./Environment"
import { summarize_dict } from "../tools/utility"
import { isString } from "pmatcher/utility"


// export interface Package{
//     name: string
//     functions: {[key: string]: scoped_value}
// }

// export function is_package(probablyPackage: any): boolean {
//     return probablyPackage instanceof Object && typeof probablyPackage.name === "string" && typeof probablyPackage.functions === "object"
// }

export const create_default_scoped_primtive_func = compose(construct_primitive_procedure, (value: any) => create_dict_value(value, 0))





function is_null(pair: any[]): boolean{
    return pair.length === 0
}

export function make_primitive_package(): Env {
    const procedures = {
        "+": (...args: number[]) => args.reduce((a, b) => a + b, 0),
        "-": (...args: number[]) => args.slice(1).reduce((a, b) => a - b, args[0]),
        "*": (...args: number[]) => args.reduce((a, b) => a * b, 1),
        "/": (...args: number[]) => args.slice(1).reduce((a, b) => a / b, args[0]),
        "<": (a: number, b: number) => a < b,
        "<=": (a: number, b: number) => a <= b,
        ">": (a: number, b: number) => a > b,
        ">=": (a: number, b: number) => a >= b,
        "==": (a: number, b: number) => a === b,
        "eq?": (a: any, b: any) => a === b,
        "null?": (a: any) => a === null,
        "display": (a: any) => console.log(a),
        "error": (a: string) => {throw Error(a)},
 
        "is_null": is_null,
    }


    const dict = Object.fromEntries(Object
                            .entries(procedures)
                            .map(([key, value]) => 
                                [key, create_default_scoped_primtive_func(value)]))
    return {
        name: "primitive",
        dict: dict,
        ref: 0,
        has: (key: string) => dict[key] !== undefined,
        not_has: (key: string) => dict[key] === undefined,
        summarize: () => summarize_dict(dict, summarize_scoped_value),
        copy: () => make_primitive_package(),
    }
}