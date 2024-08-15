import { define_layered_procedure_handler, Layer, LayeredObject } from "./Layer";




export class SupportSet{
    private set: Map<string, any> = new Map();
    private comparator: (a: any) => string;

    constructor(comparator: (a: any) => string ){
        this.comparator = comparator;
    }

    public add(item: any){
        this.set.set(this.comparator(item), item);
    }

    public has(item: any){
        return this.set.has(this.comparator(item));
    } 

    public merge(other: SupportSet){
        for(const item of other.set.values()){
            this.add(item);
        }
        return this;
    }

    public remove(item: any){
        this.set.delete(this.comparator(item));
    }

    public get_comparator(){
        return this.comparator;
    }

    public filter(predicate: (a: any) => boolean){
        const new_set = new SupportSet(this.comparator);
        for(const item of this.set.values()){
            if(predicate(item)){
                new_set.add(item);
            }
        }
        return new_set;
    }

    public map(procedure: (a: any) => any){
        const new_set = new SupportSet(this.comparator);
        for(const item of this.set.values()){
            new_set.add(procedure(item));
        }
        return new_set;
    } 

    public reduce(procedure: (acc: any, item: any) => any, initial: any){
        let acc = initial;
        for(const item of this.set.values()){
            acc = procedure(acc, item);
        }
        return acc;
    }

    public any(predicate: (a: any) => boolean): boolean{
        for(const item of this.set.values()){
            if(predicate(item)){
                return true;
            }
        }
        return false;
    }

    public every(predicate: (a: any) => boolean): boolean{
        for(const item of this.set.values()){
            if(!predicate(item)){
                return false;
            }
        }
        return true;
    }

    public is_subset(other: SupportSet): boolean{
        return this.set.size <= other.set.size && this.every((item) => other.set.has(this.comparator(item)));
    }
}

export class SupportLayer extends Layer{
    value: SupportSet;

    constructor(value: SupportSet){
        super("support", value);
        this.value = value;
    }

    override get_procedure(name: string, arity: number) {
        return (base_value: any, ...supports: SupportSet[]) => {
            return merge_supports(supports);
        }
    }
}



function merge_supports(supports: SupportSet[]): SupportSet{
    return supports.reduce((acc: SupportSet, support: SupportSet) => {
        return acc.merge(support);
    }, new SupportSet(supports[0].get_comparator()));
}



export function get_support_layer(object: LayeredObject): SupportLayer | null{
    return object.get_layer("support") as SupportLayer | null;
}

export function get_support_layer_value(object: LayeredObject): SupportSet | null{
    const layer = get_support_layer(object);
    return layer ? layer.value : null;
}

export function is_support_layer(layer: Layer): layer is SupportLayer{
    return layer.name === "support";
}

export function is_support_set(set: any): set is SupportSet{
    return set instanceof SupportSet;
}