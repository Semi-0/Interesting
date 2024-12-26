import type {SchemeElement} from "./SchemeElement"

import {DefaultEnvironment} from "./Environment"

export class Closure{
    constructor(public readonly parameters: Array<SchemeElement>, public readonly body: SchemeElement, public readonly env: DefaultEnvironment){}
}

