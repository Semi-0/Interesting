import { construct_feedback, is_scheme_element, is_scheme_symbol, map_procedure, type SchemeElement  } from "./SchemeElement"
import { Closure } from "./Closure"
import {  make_primitive_package } from "./PackageSystem"

import { construct_simple_generic_procedure, define_generic_procedure_handler } from "generic-handler/GenericProcedure"
import { match_args } from "generic-handler/Predicates"
import { isString } from "effect/Predicate"
import { isArray } from "effect/Array"
import { zip } from "effect/Array"
// can also refacted with generic procedure


// TODO: CHANGE TO LEXICIAL SCOPING

import { create_dict_value, set_scoped_value, get_largest_scope, get_value_in_largest_scope, has_scope, scope_not_exist_before, type scoped_value, type ScopeReference, summarize_scoped_value } from "./ScopedReference"
import { summarize_dict } from "../tools/utility"

export interface Env{
    name: string
    dict: {[key: string]: scoped_value}
    ref: ScopeReference

    has(key: string): boolean
    not_has(key: string): boolean
    summarize(): string
    copy(): Env
}




export function is_env(probablyEnv: any): boolean{
    return probablyEnv instanceof Object && typeof probablyEnv.name === "string" && typeof probablyEnv.dict === "object" && typeof probablyEnv.ref === "number"
}

export function construct_default_environment(name: string, dict: {[key: string]: scoped_value}, loaded_packages: Env[], ref: ScopeReference): DefaultEnvironment{
    const env = new DefaultEnvironment()
    env.name = name
    env.dict = dict
    env.loaded_packages = loaded_packages
    env.ref = ref
    return env
}


export class DefaultEnvironment implements Env {
    name: string = "global"
    dict: {[key: string]: scoped_value} = {}
    loaded_packages: Env[] = [make_primitive_package()]
    ref: ScopeReference = 0

    copy(): DefaultEnvironment {
        // CAUTIOUS!!!!
        return construct_default_environment(this.name, {...this.dict}, this.loaded_packages, this.ref)
    }

    load(pkg: Env): void {
        this.loaded_packages.push(pkg)
    }

    unload(pkg: Env): void {
        this.loaded_packages = this.loaded_packages.filter(p => p !== pkg)
    }

    has(key: string): boolean {
        return this.dict[key] !== undefined
    }

    not_has(key: string): boolean {
        return this.dict[key] === undefined
    }

    summarize(): string {
        return summarize_dict(this.dict, summarize_scoped_value) +
             "ref: " + this.ref
    }
}

export function is_default_environment(probablyEnv: any): boolean{
    return probablyEnv instanceof DefaultEnvironment && probablyEnv.name === "global" 
}

export function copy_environment(env: Env): Env {
    return env.copy();
} 

export function new_sub_environment(env: DefaultEnvironment): DefaultEnvironment {
    const newEnv = env.copy()
    newEnv.ref = env.ref + 1;
    return newEnv;
}



export function load(env: DefaultEnvironment, pkg: Env) {
    env.load(pkg)
}


export const lookup = construct_simple_generic_procedure("lookup", 2, (key: string, env: any) =>{ throw Error("no arg match for lookup")})


export function lookup_for_scoped_value(key: string, env: Env): any{
    // low level lookup, return the scoped value
  return env.dict[key]
}


define_generic_procedure_handler(
    lookup, 
    match_args(isString, is_env), 
    (key: string, env: Env) => {
        const v = env.dict[key];
        if (v !== undefined) {
            if (get_largest_scope(v) <= env.ref) {
                return get_value_in_largest_scope(v)
            }
            else {
                return v.get(env.ref)
            }
        } else {
            if (is_default_environment(env)) {
                //@ts-ignore
                return lookup(key, env.loaded_packages)
            }
            else {
                return undefined;
            }
        }
    }
);




function is_packages(probablyPackages: any): boolean {
    return probablyPackages instanceof Array && probablyPackages.every(is_env)
}



define_generic_procedure_handler(
    lookup,
    match_args(isString, is_packages),
    (key: string, packages: Env[]) => {
        for (const pkg of packages) {
            const value = lookup(key, pkg)
            if (value) {
                return value
            }
        }
        return undefined
    }
)

define_generic_procedure_handler(
    lookup,
    match_args(is_scheme_symbol, is_env),
    (key: SchemeElement, env: Env) => {
        const k = key.get_value()
  
        return lookup(k, env)
    }
);

export function define_value(env: Env, key: string, value: any){
    if (env.has(key))  {
        const existed = lookup_for_scoped_value(key, env)
        if (scope_not_exist_before(existed, env.ref)) {
            set_scoped_value(existed, env.ref, value)
        }
        else{
            throw Error("key " + key + " already exists in environment, " + env.summarize())
        }
    }
    else{
        env.dict[key] = create_dict_value(value, env.ref)
    }
}


export function set_value(env: Env, key: string, value: any){
    if (env.has(key))  {
        const existed = lookup_for_scoped_value(key, env)
        set_scoped_value(existed, env.ref, value)
    }
    else{
        env.dict[key] = create_dict_value(value, env.ref)
    }
}


export function extend_value(env: Env, key: string, value: any): Env{
    const new_env = copy_environment(env)

    define_value(new_env, key, value)

    return new_env
}



export const extend = construct_simple_generic_procedure("extend", 3, (key: string, value: SchemeElement, env: any) => { throw Error("no arg match for extend" + key + " " + value + " " + env) });

define_generic_procedure_handler(
    extend,
    match_args(isString, is_scheme_element, is_env),

    (key: string, value: SchemeElement, env: Env) => {
       return extend_value(env, key, value)
    }
);


define_generic_procedure_handler(
    extend,
    match_args(is_scheme_symbol, is_scheme_element, is_env),
    (key: SchemeElement, value: SchemeElement, env: Env) => {
        return extend(key.get_value(), value, env)
    }
)

define_generic_procedure_handler(
    extend,
    match_args(isArray, isArray, is_env),
    (keys: string[], values: any[], env: Env) => {
        if (keys.length !== values.length){
            throw Error(`failed extending env, key length ${keys.length} does not match value length ${values.length}`);
        }
  
        return zip(keys, values).reduce((acc, [key, value]) => {
            return extend(key, value, acc)
        }, env)
    }
)

export const set = construct_simple_generic_procedure("set", 3, (key: string, value: SchemeElement, env: any) => { throw Error("no arg match for set, key: " + key + " value: " + value + " env: " + env) });

define_generic_procedure_handler(
    set,
    match_args(isString, is_scheme_element, is_env),
    (key: string, value: SchemeElement, env: Env) => {
        set_value(env, key, value)
    }
);

define_generic_procedure_handler(
    set,
    match_args(is_scheme_symbol, is_scheme_element, is_env),
    (key: SchemeElement, value: SchemeElement, env: Env) => {
        return set(key.get_value(), value, env)
    }
)


export const define = construct_simple_generic_procedure("define", 2, 
    (key: string, value: SchemeElement) => { throw Error("no arg match for define, key: " + key + "value: " + value.toString()) });

define_generic_procedure_handler(
    // TODO: change to lexical scoping
    define,
    match_args(isString, is_scheme_element, is_env),
    (key: string, value: SchemeElement, env: Env) => {
        define_value(env, key, value)
        return construct_feedback(key + " defined" + " with " + value.toString())
    }
);

define_generic_procedure_handler(
    define,
    match_args(is_scheme_symbol, is_scheme_element, is_env),
    (key: SchemeElement, value: SchemeElement, env: Env) => {
        return define(key.get_value(), value, env)
    }
)