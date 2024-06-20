import type {LispElement} from "./LispElement"
import {Environment} from "./Environment"

export class Closure{
    constructor(public readonly parameters: LispElement, public readonly body: LispElement, public readonly env: Environment){}
}