import { is_scheme_element, is_scheme_symbol, map_procedure, type SchemeElement  } from "./SchemeElement"
import { Closure } from "./Closure"
import {  is_package, make_primitive_package } from "./PrimitiveFunction"
import { inspect } from "util"
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "generic-handler/GenericProcedure"
import type{ PrimitiveFunction } from "./PrimitiveFunction"
import { match_args } from "generic-handler/Predicates"
import { isString } from "effect/Predicate"
import { isArray } from "effect/Array"
import { zip } from "effect/Array"
// can also refacted with generic procedure
import type { Package } from "./PrimitiveFunction"
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
    match_args(is_scheme_symbol, is_package),
    (key: SchemeElement, pkg: Package) => {
        return pkg.functions[key.get_value()];
    }
);

function is_packages(probablyPackages: any): boolean {
    return probablyPackages instanceof Array && probablyPackages.every(is_package)
}

define_generic_procedure_handler(
    lookup,
    match_args(is_scheme_symbol, is_packages),
    (key: SchemeElement, packages: Package[]) => {
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
        const v = env.dict[key.get_value()];
        if (v) {
            return v;
        }
        else {
            return lookup(key, env.loaded_packages)
        }
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