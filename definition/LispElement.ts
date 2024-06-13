export type LispElement = Atom | Expression | List | string;

export type AtomValue = string | number | boolean 
// ATOM

export class List{

    constructor(public readonly elements: LispElement[]) {}
    getString(): string {
        console.log("called")
        var result = "("
       for (const element of this.elements) {
        if (element instanceof List){
            result += element.toString() + " "
        }
        else if (element instanceof LSymbol){
            result += element.toString() + " "
        }
        else if (element instanceof LNumber){
            result += element.toString() + " "
        }
        else if (element instanceof LBoolean){
            result += element.toString() + " "
        }
        else if (element instanceof LString){
            result += element.toString() + " "
        }

        else if (element instanceof Lambda){
            result += element.toString() + " "
        }
        else if (element instanceof Let){
            result += element.toString() + " "
        }
        else if (element instanceof Call){
            result += element.toString() + " "
        }
        else {
            result += "unknown" + " "
        }
        result += ")"
        }
        return result
    }
}           


export function createList(elements: LispElement[]): List{
    return new List(elements)
}

export function displayList(list: List): string{
    return `(${list.elements.map(e => e.toString()).join(' ')})`
}

export function appendItem(list: List, item: LispElement): List{
    return new List([...list.elements, item])
}

export interface Atom{
    value : AtomValue
}

export function createAtom(value: string): string{
    // if (typeof value === "string") return new LSymbol(value)
    // else if (typeof value === "number") return new LNumber(value)
    // else if (typeof value === "boolean") return new LBoolean(value)
    // else return new LString(value)
    console.log("createAtom", value)
    return value
}

export class LSymbol implements Atom{
    // stands for lisp symbol
    constructor(public readonly value: string) {}
    toString() {
        return `LSymbol(${this.value})`;
    }
}
console.log(new LSymbol("example")); 
export class LNumber implements Atom{
    // stands for lisp number
    constructor(public readonly value: number) {}
    toString() {
        return `LNumber(${this.value})`;
    }
} 

export class LBoolean implements Atom{
    // stands for lisp boolean
    constructor(public readonly value: boolean) {}
    toString() {
        return `LBoolean(${this.value})`;
    }
}


export class LString implements Atom{
    constructor(public readonly value: string) {}
    toString() {
        return `LString(${this.value})`;
    }
}
// LIST

export interface Expression{
}

export class Lambda implements Expression{
    constructor(public readonly parameters: Atom[], public readonly body: LispElement) {}
    toString() {
        return `Lambda(params: [${this.parameters.map(p => p.toString()).join(', ')}], body: ${this.body.toString()})`;
    }
}

export class Let implements Expression{
    constructor(public readonly bindings: {var: Atom, value: LispElement}[], public readonly body: LispElement) {}
    toString() {
        const bindingsStr = this.bindings.map(b => `${b.var.toString()}=${b.value.toString()}`).join(', ');
        return `Let(bindings: [${bindingsStr}], body: ${this.body.toString()})`;
    }
}

export class Call implements Expression{
    constructor(public readonly func: LispElement, public readonly args: LispElement[]) {}
    toString() {
        return `Call(func: ${this.func.toString()}, args: [${this.args.map(arg => arg.toString()).join(', ')}])`;
    }
}
