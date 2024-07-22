import type {SchemeElement} from "./SchemeElement"

import {Environment} from "./Environment"

export class Closure{
    constructor(public readonly parameters: Array<SchemeElement>, public readonly body: SchemeElement, public readonly env: Environment){}
}

