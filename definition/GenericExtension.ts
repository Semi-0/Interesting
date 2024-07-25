import { define_generic_procedure_handler } from 'generic-handler/GenericProcedure';
import { isSchemeElement, isSchemeArray } from './SchemeElement';
import { match_args } from 'generic-handler/Predicates';
import { isNumber } from 'effect/Predicate';
import {isArray, get_element, set_element, get_length} from "pmatcher/GenericArray"
import { SchemeElement } from './SchemeElement';

define_generic_procedure_handler(isArray, isSchemeArray, (value: SchemeElement) => {
    return true
})

define_generic_procedure_handler(get_element, match_args(isSchemeArray, isNumber), (s: SchemeElement, index: number) => {
    console.log("executed")
    return s.value[index]
})

define_generic_procedure_handler(set_element, match_args(isSchemeArray, isNumber, isSchemeElement), (s: SchemeElement, index: number, value: SchemeElement) => {
    s.value[index] = value
    return s
})

define_generic_procedure_handler(get_length, isSchemeArray, (s: SchemeElement) => {
    return s.value.length
})