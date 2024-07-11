import type {LispElement, List} from "./LispElement"
import {Environment} from "./Environment"

export class Closure{
    constructor(public readonly parameters: List, public readonly body: LispElement, public readonly env: Environment){}
}

