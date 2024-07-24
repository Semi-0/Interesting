// export type LispElement = Atom | Expression | Array<LispElement> | string ;

// export type AtomValue = string | number | boolean 
import type { List } from 'effect';
// ATOM
import { inspect } from 'util';
import { define_generic_procedure_handler } from 'generic-handler/GenericProcedure';
import { match_args } from 'generic-handler/Predicates';
import { isNumber, isString } from 'effect/Predicate';
import { match, P } from 'pmatcher/MatchBuilder';
export enum SchemeType{
    String = "String",
    Number = "Number",
    Boolean = "Boolean",
    Reserved = "Reserved",
    Quoted = "Quoted",
    List = "List",
    Expression = "Expression",
    Lambda = "Lambda",
    Let = "Let",
    Call = "Call",
    PrimitiveSymbol = "PrimitiveSymbol",
    Closure = "Closure",
    PrimitiveFunc = "PrimitiveFunc"
}


export class SchemeElement{
    readonly value: any 
    readonly type: SchemeType
    readonly reference : string | null
    readonly Error: String | null

    constructor(value : any, type: SchemeType, reference: string | null = null, Error: String | null = null){
        this.value = value
        this.type = type
        this.reference = reference
        this.Error = Error
    }

    toString(){
        if (this.type === SchemeType.List){
            return `(${this.value.map((e: SchemeElement) => e.toString()).join(' ')})`
        }
        return `${this.value}: ${this.type}`
    }

    get_value(){
        return this.value
    }

    update_value(value: any): SchemeElement{
        return new SchemeElement(value, this.type, this.reference, this.Error)
    }
}

export function isSchemeElement(value: any): value is SchemeElement{
    return value instanceof SchemeElement
}

export function schemeStr(value: string): SchemeElement{
    return new SchemeElement(value, SchemeType.String)
}

export function isSchemeStr(value: SchemeElement): boolean{
    return value.type === SchemeType.String
}

export function schemeNumber(value: number): SchemeElement{
    return new SchemeElement(value, SchemeType.Number)
}

export function schemeBoolean(value: boolean): SchemeElement{
    return new SchemeElement(value, SchemeType.Boolean)
}

export function schemeReserved(value: string): SchemeElement{
    return new SchemeElement(value, SchemeType.Reserved)
}

export function schemeList(value: SchemeElement[]): SchemeElement{
    return new SchemeElement(value, SchemeType.List)
}

export function isSchemeArray(value: SchemeElement): boolean{
    return value.type === SchemeType.List
}

// adaptor for generic_array

import { get_element, set_element, get_length, isArray } from 'pmatcher/GenericArray';


define_generic_procedure_handler(get_element, 
    match_args(isSchemeArray, (index: number) => true),
    (element: SchemeElement, index: number) => {
        return element.get_value()[index]
    }
)

define_generic_procedure_handler(set_element,
    match_args(isSchemeArray, (index: number) => true, (value: SchemeElement) => true),
    (element: SchemeElement, index: number, value: SchemeElement) => {
        return element.update_value(element.get_value().map((e: SchemeElement, i: number) => i === index ? value : e))
    }
)

define_generic_procedure_handler(get_length,
    match_args(isSchemeArray, (index: number) => true),
    (element: SchemeElement) => {
        return element.get_value().length
    }
)

define_generic_procedure_handler(isArray,
    match_args(isSchemeArray, (index: number) => true),
    (element: SchemeElement) => {
        return true
    }
)


import { equal } from 'pmatcher/utility'; 


define_generic_procedure_handler(equal,
    match_args(isSchemeStr, isString),
    (a: SchemeElement , b: string) => {
        return a.get_value() === b
    }
)

const test_array = new SchemeElement([schemeStr("a")], SchemeType.List)

const test_result = match(test_array, ["a"])

console.log(inspect(test_result, {showHidden: true, depth: 20}))