import type { SchemeElement  } from "./SchemeElement"
import { Closure } from "./Closure"
import { PrimitiveFunctions } from "./PrimitiveFunction"
import { inspect } from "util"
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "generic-handler/GenericProcedure"
import type{ PrimitiveFunction } from "./PrimitiveFunction"
import { match_args } from "generic-handler/Predicates"
import { isString } from "effect/Predicate"
import { isArray } from "effect/Array"
// can also refacted with generic procedure

export class Environment{
    dict: {[key: string]: SchemeElement} = {}

    copy(): Environment {
        const newEnv = new Environment();
        newEnv.dict = { ...this.dict };
        return newEnv;
    }
}




const lookup = construct_simple_generic_procedure("lookup", 2, (key: string, env: any) =>{ throw Error("no arg match for lookup")})

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

const extend = construct_simple_generic_procedure("extend", 3, (key: string, value: SchemeElement, env: any) => { throw Error("no arg match for extend") });

define_generic_procedure_handler(
    extend,
    match_args(isString, (_: any) => true, is_environment),
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

        var c = env.copy()
        for (let i = 0; i < keys.length; i++){
            set(keys[i], values[1], c)
        }
        return c
    }
)

const set = construct_simple_generic_procedure("set", 3, (key: string, value: SchemeElement, env: any) => { throw Error("no arg match for set") });

define_generic_procedure_handler(
    set,
    match_args(isString, (_: any) => true, is_environment),
    (key: string, value: SchemeElement, env: Environment) => {
        env.dict[key] = value;
    }
);

export function is_environment(probablyEnv: any): boolean{
   return probablyEnv instanceof Environment
}