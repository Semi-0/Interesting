class Layer{
    name: string
    value: any | undefined

    constructor(name: string, value: any | undefined){
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
}


class LayeredObject{
    alist: Layer[]

    constructor(base_value: any, alist: Layer[] | null){
        if (alist === null){
            this.alist = [new Layer("base", base_value)]
        } else {
            this.alist = [...alist, new Layer("base", base_value)]
        }
    }

    has_layer(): boolean{
        return this.alist.length > 0
    }

    get_layer_value(layer: string): any | undefined{
        return this.alist.find(l => l.get_name() === layer)?.get_value()
    }

    get_annotations(): string[] {
        return this.alist.map(l => l.get_name())
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

class LayeredProcedureMetadata{
    name: string 
    arity: number
    base_procedure: (v: any) => any
    handlers: Map<string, (b:any, v:any) => any>

    constructor(name: string, arity: number, base_proc: (v: any) => any){
        this.name = name
        this.arity = arity
        this.base_procedure = base_proc
        this.handlers = new Map<string, (b:any, v:any) => any>()
    }


    get_name(): string{
        return this.name
    }

    get_base_procedure(): (v: any) => any{
        return this.base_procedure
    }

    has(name: string): boolean{
        return this.handlers.has(name)
    }

    get(name: string): ((b:any, v: any) => any) | undefined{
        return this.handlers.get(name)
    }

    set_handler(name: string, handler: (v:any) => any){
        this.handlers.set(name, handler)
    }

    get_handler(layer: Layer): ((b:any, v: any) => any) | undefined{
        if (this.has(layer.get_name())){
            return this.get(layer.get_name())
        }
        else{
            return undefined
        }
    }

}

class LayeredProcedure{
    metaData: LayeredProcedureMetadata

    constructor(name: string, arity: number, base_proc: (v: any) => any){
        this.metaData = new  LayeredProcedureMetadata( name, arity, base_proc)
    }

    dispatch(obj: LayeredObject): LayeredObject{
        // compactMap!!
        return obj.map((entity: Layer) => {
            const proc = this.metaData.get(entity.get_name())
            //@ts-ignore
            return proc(obj.get_layer_value("base"), entity.get_value)
        })
    }
}

