import { Number, type Static } from 'runtypes';

const Integer = Number.withConstraint(n => n % 1 === 0, { name: 'Integer' });

type Int = Static<typeof Integer>;


export class generic_procedure{
    default_handler: (...args: any) => any
    metaData: generic_procedure_metadata
    constructor(arity: Int, default_handler: (...args: any) => any){
        this.metaData = make_generic_metadata(arity, default_handler)
        this.default_handler = default_handler
    }
    private dispatch(...args: any){
        const matched_metadata = this.metaData.metaData.find(rule => rule.predicate(...args))
        console.log("matched_metadata", matched_metadata)
        if(matched_metadata === undefined){
            throw new Error("Generic handler failed")
        }
    return matched_metadata.handler(...args)
    }

    public define_handler(predicate: (...args: any) => boolean, handler: (...args: any) => any){
        this.metaData.metaData.unshift({predicate, handler})
    }

    public execute(...args: any){
        if (args.length !== this.metaData.arity){
            throw new Error(`Generic handler failed, arity mismatch: ${args.length} !== ${this.metaData.arity}`)
        }
        return this.dispatch(...args)
    }
}

function make_generic_metadata( arity: Int, handler: (args: any[]) => any): generic_procedure_metadata{
    const metaData : generic_procedure_metadata = {
        arity: arity,
        metaData: [{predicate: () => true, handler: handler}],
        default_handler: handler
    }
    return metaData
}

export interface generic_procedure_metadata{
    arity: Int
    metaData: {predicate: (...args: any) => boolean, handler: (...args: any) => any}[]
    default_handler: (...args: any) => any
}

export interface generic_procedure_handler{
    generic_procedure: generic_procedure
    applicability: (...args: string[]) => boolean
    handler: (...args: any) => any
}

