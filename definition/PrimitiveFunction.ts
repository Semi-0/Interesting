export class PrimitiveFunctions {
    private functions: {[key: string]: Function} = {};

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