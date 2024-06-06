export type LispElement = Atom | Expression;

export type AtomValue = String | number | boolean 
// ATOM

export interface Atom{
    value : AtomValue
}

export class LSymbol implements Atom{
    // stands for lisp symbol
    constructor(public readonly value: string) {}
}

export class LNumber implements Atom{
    // stands for lisp number
    constructor(public readonly value: number) {}
} 

export class LBoolean implements Atom{
    // stands for lisp boolean
    constructor(public readonly value: boolean) {}
}
// LIST

export interface Expression{
}

export class Lambda implements Expression{
    constructor(public readonly parameters: Atom[], public readonly body: LispElement) {}
}

export class Let implements Expression{
    constructor(public readonly bindings: {var: Atom, value: LispElement}[], public readonly body: LispElement) {}
}

export class Call implements Expression{
    constructor(public readonly func: LispElement, public readonly args: LispElement[]) {}
}
