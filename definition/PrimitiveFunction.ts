import { construct_primitive_procedure, type SchemeElement } from "./SchemeElement";

export type PrimitiveFunction = (...args: any[]) => any



const intern_primitive_functions: {[key: string]: Function} = {
    ["+"]: (...args: any[]) => {
        return args.reduce((acc, curr) => acc + curr, 0);
    },
    ["*"]: (...args: any[]) => {
        return args.reduce((acc, curr) => acc * curr, 1);
    },
    ["-"]: (...args: any[]) => { 
        for (let i = 1; i < args.length; i++) {
        args[0] -= args[i];
        }
        return args[0];
    },
    ["/"]: (...args: any[]) => {
        for (let i = 1; i < args.length; i++) {
        args[0] /= args[i];
        }
        return args[0];
    },

    [">"]: (...args: any[]) => {
        if (args.length != 2) {
            throw new Error("> requires exactly two arguments");
        }
        return args[0] > args[1];
    },
    ["<"]: (...args: any[]) => {
        if (args.length != 2) {
            throw new Error("< requires exactly two arguments");
        }
        return args[0] < args[1];
    },

    };

type PackageFuncType = SchemeElement

   
export interface Package {
    name: string
    functions: {[key: string]: PackageFuncType}
}

// Type guard function
export function is_package(element: any): element is Package {
    return typeof element === 'object' && 
           element !== null && 
           typeof element.name === 'string' && 
           typeof element.functions === 'object' && 
           element.functions !== null;
}

export const make_primitive_package = (): Package => {
    return {
        name: "primitive",
        functions: Object.fromEntries(Object.entries(intern_primitive_functions).map(([name, func]) => [name, construct_primitive_procedure(func)]))
    }
}
