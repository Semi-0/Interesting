


export interface Package{
    name: string
    functions: {[key: string]: (...args: any[]) => any}
}

export function is_package(probablyPackage: any): boolean {
    return probablyPackage instanceof Object && typeof probablyPackage.name === "string" && typeof probablyPackage.functions === "object"
}

export function make_primitive_package(): Package {
    return {
        name: "primitive",
        functions: {
            "+": (a: number, b: number) => a + b,
            "-": (a: number, b: number) => a - b,
            "*": (a: number, b: number) => a * b,
            "/": (a: number, b: number) => a / b,
            "eq?": (a: any, b: any) => a === b,
            "null?": (a: any) => a === null,
            "car": (a: any[]) => a[0],
            "cdr": (a: any[]) => a.slice(1),
            "cons": (a: any, b: any[]) => [a, ...b],
            "list": (...a: any[]) => a,
            "display": (a: any) => console.log(a),
            "error": (a: string) => {throw Error(a)},
        }
    }
}