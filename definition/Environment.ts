import type { LispElement } from "./LispElement"
import { Closure } from "./Closure"

export class Environment{
    private variables: {[key: string]: LispElement} = {}

    lookup(name: string): LispElement | null{
        if (this.variables[name] !== undefined){
            return this.variables[name]
        }
        return null
    }

    extend(name: string, value: LispElement){
        this.variables[name] = value
    }

    set(name: string, value: LispElement){
        this.variables[name] = value
    }

    define_closure(name: string, closure: Closure){
        this.variables[name] = closure
    }
}