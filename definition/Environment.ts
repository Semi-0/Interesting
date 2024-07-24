import { is_scheme_element, is_scheme_symbol, map_procedure, type SchemeElement  } from "./SchemeElement"
import { Closure } from "./Closure"
import { PrimitiveFunctions } from "./PrimitiveFunction"
import { inspect } from "util"
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "generic-handler/GenericProcedure"
import type{ PrimitiveFunction } from "./PrimitiveFunction"
import { match_args } from "generic-handler/Predicates"
import { isString } from "effect/Predicate"
import { isArray } from "effect/Array"
import { zip } from "effect/Array"
// can also refacted with generic procedure

export class Environment{
    dict: {[key: string]: SchemeElement} = {}

    copy(): Environment {
        const newEnv = new Environment();
        newEnv.dict = { ...this.dict };
        return newEnv;
    }
}




export const lookup = construct_simple_generic_procedure("lookup", 2, (key: string, env: any) =>{ throw Error("no arg match for lookup")})

define_generic_procedure_handler(
    lookup, 
    match_args(isString, is_environment), 
    (key: string, env: Environment) => {
        const v = env.dict[key];
        if (v) {
            return v;
        } else {
            return null;
        }
    }
);


define_generic_procedure_handler(
    lookup,
    match_args(is_scheme_symbol, is_environment),
    (key: SchemeElement, env: Environment) => {
        return env.dict[key.get_value()];
    }
);

export const extend = construct_simple_generic_procedure("extend", 3, (key: string, value: SchemeElement, env: any) => { throw Error("no arg match for extend") });

define_generic_procedure_handler(
    extend,
    match_args(isString, is_scheme_element, is_environment),

    (key: string, value: SchemeElement, env: Environment) => {
        var c = env.copy()
        set(key, value, c)
        return env;
    }
);

define_generic_procedure_handler(
    extend,
    match_args(isArray, isArray, is_environment),
    (keys: string[], values: any[], env: Environment) => {
        if (keys.length !== values.length){
            throw Error(`failed extending env, key length ${keys.length} does not match value length ${values.length}`);
        }

        return zip(keys, values).reduce((acc, [key, value]) => {
            return extend(key, value, acc)
        }, env)
    }
)

export const set = construct_simple_generic_procedure("set", 3, (key: string, value: SchemeElement, env: any) => { throw Error("no arg match for set") });

define_generic_procedure_handler(
    set,
    match_args(isString, is_scheme_element, is_environment),
    (key: string, value: SchemeElement, env: Environment) => {
        env.dict[key] = value;
    }
);

export function is_environment(probablyEnv: any): boolean{
   return probablyEnv instanceof Environment
}

export const define = construct_simple_generic_procedure("define", 2, (key: string, value: SchemeElement) => { throw Error("no arg match for define") });

define_generic_procedure_handler(
    define,
    match_args(isString, is_scheme_element, is_environment),
    (key: string, value: SchemeElement, env: Environment) => {
        // temporary, TODO: check whether in current scope value has already been defined 
        set(key, value, env)
    }
);