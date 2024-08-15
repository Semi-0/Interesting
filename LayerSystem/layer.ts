import { string } from "parse-combinator"
import { array } from "fp-ts"
import { compose } from "fp-ts/lib/pipeable"
import { flow, pipe } from "fp-ts/lib/function"
import type { Option } from 'fp-ts/Option'
import { filterMap } from "fp-ts/Array"
import { some } from "fp-ts/lib/OptionT"
import { option } from "fp-ts"
import { inspect } from "bun"
import { map } from "fp-ts/Array"
import { construct_simple_generic_procedure } from "generic-handler/GenericProcedure"

export class Layer{
    name: string
    value: any | undefined


    constructor(name: string, value: any | undefined, procedure: any | undefined = undefined){
        this.name = name
        this.value = value

    }

    get_name(): string{
        return this.name
    }

    has_value(): boolean{
        return this.value !== undefined
    }

    get_value(): any{
        return this.value
    }

    get_procedure(name: string, arity: number): any | undefined{
        return undefined
    }
}


export class BaseLayer extends Layer{
    constructor(value: any){
        super("base", value)
    }
}

export class AnnotationLayer extends Layer{
    constructor(name: string, value: any){
        super(name, value)
    }
}

export function get_unit_procedure(name: string, arity: number){
    if (name === "square" && arity === 1){
        return (b: any, ...vs: any) => {
                return  vs
        }
    }
    else{
        return undefined
    }
}

export class UnitLayer extends Layer{
    constructor( value: any){
        super("unit", value, (b: any, ...v: any) => v)
    }

    override get_procedure(name: string, arity: number): any | undefined{
        const proc = get_unit_procedure(name, arity)
        if (proc){
            return proc
        }
        else{
            return undefined
        }
    }
}


export class ReferenceLayer extends Layer{

    constructor(value: string){
        super("reference", value)
    }

    override  get_procedure(name: string, arity: number) {
        return (base_value: any, ...references: string[]) => { 
            return references.reduce((a: string, b: string) => { return a + " " + b }, "")
        }
    }
}

export class LayeredObject{
    alist: Layer[]

    constructor(base_value: any, alist: Layer[] | null){
        if (alist === null){
            this.alist = [new Layer("base", base_value)]
        } else {
            console.log("alist = ", alist)
            this.alist = [new Layer("base", base_value), ...alist]
        }
    }

    has_layer(): boolean{
        return this.alist.length > 0
    }

    get_layer(name: string): Layer | undefined{
        return this.alist.find(l => l.get_name() === name)
    }

    get_layer_value(layer: string): any | undefined{
        return this.get_layer(layer)?.get_value()
    }

    get_annotations(): string[] {
        return this.alist.map(l => l.get_name())
    }

    get_annotation_layers(): Layer[]{
        return this.alist.filter(l => l.get_name() !== "base")
    }

    map(proc: (base: any, value: any) => any): any{
        //@ts-ignore
        const base_value = this.get_layer_value("base")
        return new LayeredObject(base_value, 
                this.alist.map((v: any) => {
                    return proc(base_value, v)
                })
            )
    }
}

export const get_base_value = construct_simple_generic_procedure("get_base_value", 1, (a: any) => get_base_layer_value(a))

function get_base_layer_value(obj: LayeredObject): any{
    if (obj instanceof LayeredObject){
        return obj.get_layer_value("base")
    }
    else{
        throw new Error(`get_base_layer_value: obj is not a LayeredObject, obj = ${obj}, type = ${typeof obj}`)
    }
}

class LayeredProcedureMetadata{
    name: string 
    arity: number
    base_procedure: (...args: any) => any
    handlers: Map<string, (b:any, ...v:any) => any>

    constructor(name: string, arity: number, base_proc: (v: any) => any){
        this.name = name
        this.arity = arity
        this.base_procedure = base_proc
        this.handlers = new Map<string, (b:any, v:any) => any>()
    }


    get_name(): string{
        return this.name
    }

    get_base_procedure(): (...args: any) => any{
        return this.base_procedure
    }

    private has(name: string): boolean{
        return this.handlers.has(name)
    }

    private get(name: string): ((b:any, ...v: any) => any) | undefined{
        if (this.has(name)){
            return this.handlers.get(name)
        }
        else{
            return undefined
        }
    }

    set_handler(name: string, handler: (b:any, ...v: any) => any){
        this.handlers.set(name, handler)
    }

    get_handler(layer: Layer): ((b:any, ...v: any) => any) | undefined{
        if (this.has(layer.get_name())){
            return this.get(layer.get_name())
        }
        else{
            return layer.get_procedure(this.name, this.arity)
        }
    }

}

function removeDuplicates<T>(array: T[], compare: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
    return array.filter((item, index) => 
        array.findIndex(element => compare(item, element)) === index
    );
}


const compactMap = <A, B>(f: (a: A) => Option<B>) => flow(array.map(f), array.compact)

const meta_data_store = new Map< ( arg: any ) =>any, LayeredProcedureMetadata>()

function set_layered_procedure_metadata(proc: (arg: any) => any, metadata: LayeredProcedureMetadata){
    meta_data_store.set(proc, metadata)
}

export function make_layered_procedure(name: string, arity: number, base_proc: (...v: any) => any): (...args : any) => any{
    const metadata = new LayeredProcedureMetadata(name, arity, base_proc)
    set_layered_procedure_metadata(base_proc, metadata)
    return layed_procedure_dispatch(metadata)
}

function get_layered_procedure_metadata(proc: (...args: any) => any): LayeredProcedureMetadata | undefined{
    return meta_data_store.get(proc)
}



export function define_layered_procedure_handler(procedure: (...args: any) => any, layer: string, handler: (b: any, ...v: any) => any){
    const metadata = get_layered_procedure_metadata(procedure)
    if (metadata){
        metadata.set_handler(layer, handler)
    }
    else{
        throw new Error(`define_layered_procedure_handler: procedure = ${procedure} not found`)
    }
}

function layed_procedure_dispatch(metaData: LayeredProcedureMetadata) {
    return (...args: LayeredObject[]) => {
        const base_procedure = metaData.get_base_procedure();
        const base_values = args.map(get_base_layer_value)
        const _base_value = base_procedure(...base_values)
        const annotation_layers : Layer[] = removeDuplicates(
            args.map(a => a.get_annotation_layers()).flat(),
            (a, b) => a.get_name() === b.get_name()
        );        

        return new LayeredObject(
            _base_value,

            pipe(annotation_layers, filterMap((layer: Layer) => {
                const handler = metaData.get_handler(layer);
                if (handler) {
                    return  option.some( new Layer(layer.get_name(), handler(_base_value, ...args.map(a => a.get_layer_value(layer.get_name())))))
                }
                else{
                    return  option.none
                }
            })
        ));
    };
}



// function square (b: any){
//     return b * b
// }

// const layered_square = make_layered_procedure("square", 1, square)

// console.log(inspect(layered_square(new LayeredObject(1, [new UnitLayer("kilo")])), {depth: 10}))

function plus(a: number, b: number){
    return a + b
}

const layered_plus = make_layered_procedure("plus", 2, plus)

function fib(n: number, continue_with: (v: number) => any): number{
    if (n === 0){
        return 0
    }
    else if (n === 1){
        return 1
    }
    else{
        return layered_plus(continue_with(n - 1), continue_with(n - 2))
    }
}

const continue_fib = (v: number) => fib(v, continue_fib)


const layered_fib = make_layered_procedure("fib", 2, fib)

const continue_layed_fib = make_layered_procedure("continue_layed_fib", 1, continue_fib)

// console.log(fib(10, continue_fib))

console.log(layered_fib(new LayeredObject(10, [new ReferenceLayer("n")]) , new LayeredObject(continue_layed_fib, [new ReferenceLayer("c")])))