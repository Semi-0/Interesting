export type LispElement = Atom | Expression | List | string;

export type AtomValue = string | number | boolean 
// ATOM
import { inspect } from 'util';


export function wrapValueIntoLispElement(value: any): LispElement{
    if (typeof value === "string") return new LSymbol(value)
    else if (typeof value === "number") return new LNumber(value)
    else if (typeof value === "boolean") return new LBoolean(value)
    else return new LString(value)
}

export function unwrapLispElement(lispElement: LispElement): any{
    if (lispElement instanceof LSymbol) {
        throw Error("unwrapLispElement: LSymbol")
    }
    else if (lispElement instanceof LNumber) return lispElement.value
    else if (lispElement instanceof LBoolean) return lispElement.value
    else if (lispElement instanceof LString) return lispElement.value
    else{
        throw Error("unwrapLispElement: unsupported type: " + lispElement.toString())
    }
}


export class List{

    constructor(private readonly elements: LispElement[]) {}

    get_element(index: number): LispElement {
        if (index < 0 || index >= this.elements.length) {
            throw Error("Index out of bounds")
        }
        return this.elements[index]
    }

    slice(start: number, end: number): List{
        return new List(this.elements.slice(start, end))
    }

    append(element: LispElement): List{
        return new List([...this.elements, element])
    }

    unshift(element: LispElement): List{
        return new List([element, ...this.elements])
    }

    length(): number{
        return this.elements.length
    }

    map(func: (element: LispElement) => LispElement): List{
        return new List(this.elements.map(func))
    }

    filter(func: (element: LispElement) => boolean): List{
        return new List(this.elements.filter(func))
    }

    flatmap(func: (element: LispElement) => LispElement[]): List{
        return new List(this.elements.flatMap(func))
    }

    mapToArray(func: (element: LispElement) => any): any[]{
        return this.elements.map(func)
    }

    getString(): string {
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
    return list.getString()
}

export function appendItem(list: List, item: LispElement): List{
    return list.append(item)
}

export interface Atom{
    value : AtomValue
}

export function isAtom(atom: LispElement): boolean{
    return atom instanceof LSymbol || atom instanceof LNumber || atom instanceof LBoolean || atom instanceof LString
}

export function unwrapAtom(atom: any): AtomValue{
    if (atom instanceof LSymbol) return (atom as LSymbol).value
    else if (atom instanceof LNumber) return (atom as LNumber).value
    else if (atom instanceof LBoolean) return (atom as LBoolean).value
    else if (atom instanceof LString) return (atom as LString).value
    else throw Error("unwrapAtom: not an atom:" + inspect(atom, { showHidden: true, depth: 5}))
}

export function createAtom(value: string): string{
    // if (typeof value === "string") return new LSymbol(value)
    // else if (typeof value === "number") return new LNumber(value)
    // else if (typeof value === "boolean") return new LBoolean(value)
    // else return new LString(value)
    return value
}

export class LSymbol implements Atom{
    // stands for lisp symbol
    constructor(public readonly value: string) {}
    toString() {
        return `LSymbol(${this.value})`;
    }
}

export class PrimitiveSymbol implements Atom{
    constructor(public readonly value: string) {}
    toString() {
        return `PrimitiveSymbol(${this.value})`;
    }
}

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
    
    isTrue(): boolean{
        return this.value
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
