import { construct_feedback, is_scheme_element, is_scheme_symbol, map_procedure, type SchemeElement  } from "./SchemeElement"
import { Closure } from "./Closure"
import {  is_package, make_primitive_package } from "./PackageSystem"
import { inspect } from "util"
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "generic-handler/GenericProcedure"
import type{ PrimitiveFunction } from "./PackageSystem"
import { match_args } from "generic-handler/Predicates"
import { isString } from "effect/Predicate"
import { isArray } from "effect/Array"
import { zip } from "effect/Array"
// can also refacted with generic procedure


// TODO: CHANGE TO LEXICIAL SCOPING

import type { Package } from "./PackageSystem"
export class Environment{
    dict: {[key: string]: SchemeElement} = {}
    loaded_packages: Package[] = [make_primitive_package()]

    copy(): Environment {
        const newEnv = new Environment();
        newEnv.dict = { ...this.dict };
        return newEnv;
    }

    load(pkg: Package): void {
        this.loaded_packages.push(pkg)
    }

    unload(pkg: Package): void {
        this.loaded_packages = this.loaded_packages.filter(p => p !== pkg)
    }
}


export function load(env: Environment, pkg: Package) {
    env.load(pkg)
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
    match_args(isString, is_package),
    (key: string, pkg: Package) => {
        return pkg.functions[key];
    }
);

function is_packages(probablyPackages: any): boolean {
    return probablyPackages instanceof Array && probablyPackages.every(is_package)
}

define_generic_procedure_handler(
    lookup,
    match_args(isString, is_packages),
    (key: string, packages: Package[]) => {
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
    match_args(is_scheme_symbol, is_environment),
    (key: SchemeElement, env: Environment) => {
        const k = key.get_value()
        const v = lookup(k, env)
        if (v) {
            return v;
        }
        else {
            return lookup(k, env.loaded_packages)
        }
    }
);

export const extend = construct_simple_generic_procedure("extend", 3, (key: string, value: SchemeElement, env: any) => { throw Error("no arg match for extend" + key + " " + value + " " + env) });

define_generic_procedure_handler(
    extend,
    match_args(isString, is_scheme_element, is_environment),

    (key: string, value: SchemeElement, env: Environment) => {
        var c = env.copy()
        set(key, value, c)
        return c;
    }
);


define_generic_procedure_handler(
    extend,
    match_args(is_scheme_symbol, is_scheme_element, is_environment),
    (key: SchemeElement, value: SchemeElement, env: Environment) => {
        return extend(key.get_value(), value, env)
    }
)

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
        return construct_feedback(key + " set to " + value)
    }
);

define_generic_procedure_handler(
    set,
    match_args(is_scheme_symbol, is_scheme_element, is_packages),
    (key: SchemeElement, value: SchemeElement, packages: Package[]) => {
        return set(key.get_value(), value, packages)
    }
)

export function is_environment(probablyEnv: any): boolean{
   return probablyEnv instanceof Environment
}

export const extend_def = construct_simple_generic_procedure("define", 2, (key: string, value: SchemeElement) => { throw Error("no arg match for define") });

define_generic_procedure_handler(
    extend_def,
    match_args(isString, is_scheme_element, is_environment),
    (key: string, value: SchemeElement, env: Environment) => {
        // temporary, TODO: check whether in current scope value has already been defined 
        set(key, value, env)
        return construct_feedback(key + " defined" + " with " + value)
    }
);

define_generic_procedure_handler(
    extend_def,
    match_args(is_scheme_symbol, is_scheme_element, is_packages),
    (key: SchemeElement, value: SchemeElement, packages: Package[]) => {
        return extend_def(key.get_value(), value, packages)
    }
)