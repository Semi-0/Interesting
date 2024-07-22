export type PrimitiveFunction = (...args: any[]) => any

export class PrimitiveFunctions {

    private functions: {[key: string]: Function} = {
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

    registerFunction(name: string, func: Function) {
        this.functions[name] = func;
    }

    isPrimitiveFunction(name: string): boolean {
        return this.functions.hasOwnProperty(name);
    }

    applyFunction(name: string, ...args: any[]): any {
        if (!this.isPrimitiveFunction(name)) {
            throw new Error(`No primitive function named '${name}' found.`);
        }
        return this.functions[name](...args);
    }

}