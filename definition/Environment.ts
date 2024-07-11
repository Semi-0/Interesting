import type { LispElement, List } from "./LispElement"
import { Closure } from "./Closure"
import { LSymbol, PrimitiveSymbol } from "./LispElement"
import { PrimitiveFunctions } from "./PrimitiveFunction"
import { inspect } from "util"
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../tools/GenericProcedure/GenericProcedure"
 
// can also refacted with generic procedure





export class Environment{
    private variables: {[key: string]: LispElement | Closure} = {}
    private primitive_functions = new PrimitiveFunctions()
    lookup(name: string): LispElement | null{

        if (this.primitive_functions.isPrimitiveFunction(name)){
            return new PrimitiveSymbol(name)
        }

        if (this.variables[name] !== undefined){
            return this.variables[name]
        }
        return null
    }

    lookup_symbol(name: LSymbol): LispElement | null{
        return this.lookup(name.value)
    }

    extend(name: string, value: LispElement): Environment{
        this.variables[name] = value
        return this
    }

    extend_symbol(name: LSymbol, value: LispElement): Environment{
        this.variables[name.value] = value
        return this
    }

    extends(names: string[], values: LispElement[]): Environment{
        for (let i = 0; i < names.length; i++){
            this.variables[names[i]] = values[i]
        }
        return this
    }

    extends_symbols(names: LSymbol[], values: LispElement[]): Environment{
        for (let i = 0; i < names.length; i++){
            this.variables[names[i].value] = values[i]
        }
        return this
    }

    extends_list(names: List, values: List): Environment{
        for (let i = 0; i < names.length(); i++){
            if (names.get_element(i) instanceof LSymbol){
                this.variables[(names.get_element(i) as LSymbol).value] = values.get_element(i)
            }
            else{
                throw Error("wrong number of arguments: " + names.get_element(i).toString())
            }
        }
        console.log("variables: " + inspect(this.variables, {showHidden: true, depth: 5}))
        return this
    }

    set(name: string, value: LispElement){
        this.variables[name] = value
    }

    define_closure(name: string, closure: Closure){
        this.variables[name] = closure
    }
}

export function is_environment(probablyEnv: any): boolean{
   return probablyEnv instanceof Environment
}

