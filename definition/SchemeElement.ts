// export type LispElement = Atom | Expression | Array<LispElement> | string ;

// export type AtomValue = string | number | boolean 
import type { List } from 'effect';
// ATOM
import { inspect } from 'util';
import { construct_simple_generic_procedure, define_generic_procedure_handler } from 'generic-handler/GenericProcedure';
import { match_args } from 'generic-handler/Predicates';
import { isNumber, isString } from 'effect/Predicate';
import { match, P } from 'pmatcher/MatchBuilder';
export enum SchemeType{
    string = "String",
    number = "Number",
    boolean = "Boolean",
    symbol = "Symbol",
    quoted = "Quoted",
    list = "List",
    expression = "Expression",
    lambda = "Lambda",
    let = "Let",
    call = "Call",
    closure = "Closure",
    primitiveFunc = "PrimitiveFunc",
    unknown = "Unknown",
    feedback = "Feedback"
}


export class SchemeElement{
    readonly value: any 
    readonly type: SchemeType


    constructor(value : any, type: SchemeType){
        this.value = value
        this.type = type

    }

    toString(){
        if (this.type === SchemeType.list){
            return `(${this.value.map((e: SchemeElement) => e.toString()).join(' ')})`
        }
        return `${this.value}: ${this.type}`
    }

    get_value(){
        return this.value
    }

    get_type(){
        return this.type
    }

    is_type(type: SchemeType): boolean{
        return this.type === type
    }

    update_value(value: any): SchemeElement{
        return new SchemeElement(value, this.type)
    }

}

export function is_scheme_element(value: any): value is SchemeElement{
    return value instanceof SchemeElement
}


export const map_procedure = construct_simple_generic_procedure("map_proc",
    2,
    (element: SchemeElement, proc: (value: any) => any) => {
        throw new Error("Not implemented")
    }
)

define_generic_procedure_handler(map_procedure,
    match_args(isSchemeElement, (proc: (value: any) => any) => true),
    (element: SchemeElement, proc: (value: any) => any) => {
        const v = proc(element.get_value())
        const type = mapTypeIntoSchemeType(typeof v)
        return new SchemeElement(v, type)
    }
)

export function mapTypeIntoSchemeType(type: string): SchemeType{
    
    const t = SchemeType[type as keyof typeof SchemeType]
    if (t === undefined){
        return SchemeType.unknown
    }
    return t
}

export function construct_scheme_element_from_value(value: any): SchemeElement{
    return new SchemeElement(value, SchemeType.string)
}

export function is_self_evaluating(value: SchemeElement): boolean{
    return  is_scheme_symbol(value) || is_scheme_number(value) || is_scheme_boolean(value)
}

export function isSchemeElement(value: any): value is SchemeElement{
    return value instanceof SchemeElement
}

export function schemeStr(value: string): SchemeElement{
    return new SchemeElement(value, SchemeType.string)
}

export function isSchemeStr(value: SchemeElement): boolean{

    return is_scheme_element(value) && value.is_type(SchemeType.string)
}

export function schemeNumber(value: number): SchemeElement{
    return new SchemeElement(value, SchemeType.number)
}

export function is_scheme_number(value: SchemeElement): boolean{
    return is_scheme_element(value) && value.is_type(SchemeType.number)
}

export function schemeBoolean(value: boolean): SchemeElement{
    return new SchemeElement(value, SchemeType.boolean)
}

export function is_scheme_boolean(value: SchemeElement): boolean{
    return is_scheme_element(value) && value.is_type(SchemeType.boolean)
}


export function is_true(value: SchemeElement): boolean{
    return is_scheme_boolean(value) && value.get_value()
}

export function is_false(value: SchemeElement): boolean{
    return is_scheme_boolean(value) && !value.get_value()
}

export function is_scheme_symbol(value: SchemeElement): boolean{
    return is_scheme_element(value) && value.is_type(SchemeType.symbol)
}

export function schemeSymbol(value: string): SchemeElement{
    return new SchemeElement(value, SchemeType.symbol)
}

export function schemeList(value: SchemeElement[]): SchemeElement{
    return new SchemeElement(value, SchemeType.list)
}

export function isSchemeArray(value: SchemeElement): boolean{
        return is_scheme_element(value) && value.is_type(SchemeType.list)
}

export function construct_primitive_procedure(func: Function): SchemeElement{
    return new SchemeElement(func, SchemeType.primitiveFunc)
}

export function schemeClosure(parameters: SchemeElement[], body: SchemeElement, environment: Environment): SchemeElement{
    return new SchemeElement(new Closure(parameters, body, environment), SchemeType.closure)
}

export function construct_feedback(msg: string): SchemeElement{
    return new SchemeElement(msg, SchemeType.feedback)
}
// adaptor for generic_array

import { get_element as _get_element, set_element as _set_element, get_length as _get_length, isArray as _isArray } from 'pmatcher/GenericArray';

const get_element = construct_simple_generic_procedure("get_element", 2, _get_element)
const set_element = construct_simple_generic_procedure("set_element", 3, _set_element)
const get_length = construct_simple_generic_procedure("get_length", 1, _get_length)
const isArray = construct_simple_generic_procedure("isArray", 1, _isArray)


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


import { equal  as _equal } from 'pmatcher/utility'; 
import { Closure } from './Closure';
import type { Environment } from './Environment';

const equal = construct_simple_generic_procedure("equal", 2, _equal)


define_generic_procedure_handler(equal,
    match_args(is_scheme_symbol , isString),
    (a: SchemeElement , b: string) => {
        return a.get_value() === b
    }
)

// const test_array = new SchemeElement([schemeStr("a")], SchemeType.List)

// const test_result = match(test_array, ["a"])

// console.log(inspect(test_result, {showHidden: true, depth: 20}))