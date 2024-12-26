import { construct_primitive_procedure, SchemeElement } from "./SchemeElement"



export interface Package{
    name: string
    functions: {[key: string]: SchemeElement}
}

export function is_package(probablyPackage: any): boolean {
    return probablyPackage instanceof Object && typeof probablyPackage.name === "string" && typeof probablyPackage.functions === "object"
}

export function make_primitive_package(): Package {
    const procedures = {
        "+": (...args: number[]) => args.reduce((a, b) => a + b, 0),
        "-": (...args: number[]) => args.slice(1).reduce((a, b) => a - b, args[0]),
        "*": (...args: number[]) => args.reduce((a, b) => a * b, 1),
        "/": (...args: number[]) => args.slice(1).reduce((a, b) => a / b, args[0]),
        "eq?": (a: any, b: any) => a === b,
        "null?": (a: any) => a === null,
        "car": (a: any[]) => a[0],
        "cdr": (a: any[]) => a.slice(1),
        "cons": (a: any, b: any[]) => [a, ...b],
        "list": (...a: any[]) => a,
        "display": (a: any) => console.log(a),
        "error": (a: string) => {throw Error(a)},
    }

    return {
        name: "primitive",
        functions: Object.fromEntries(Object
                            .entries(procedures)
                            .map(([key, value]) => 
                                [key, construct_primitive_procedure(value)])),
    }
}