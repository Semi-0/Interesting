import { forEach } from "effect/Array";
import { test_cell_content } from "./Cell";
import { get_all_cells, public_state } from "./PublicState";
import { Layer, LayeredObject } from "../LayerSystem/Layer";
import { get_support_layer, type SupportSet } from "../LayerSystem/Support";
import { pipe } from "fp-ts/lib/function";
import { compact } from "fp-ts/lib/Array";
import { map, filter } from "fp-ts/Array";

export enum BeliefState {
    Believed,
    NotBelieved,
}


 class PremiseMetaData {
    name : string;
    belief_state: BeliefState = BeliefState.Believed; 
    no_goods: Set<any> = new Set();
    roots: Set<any> = new Set();

    constructor(name: string){
        this.name = name;
    }

    get_name(): string{
        return this.name;
    } 

    is_believed(): boolean{
        return this.belief_state == BeliefState.Believed;
    }

    set_belief_state(state: BeliefState){
        this.belief_state = state;
    } 

    set_believed(){
        this.set_belief_state(BeliefState.Believed);
    }

    set_not_believed(){
        this.set_belief_state(BeliefState.NotBelieved);
    } 

    wake_up_roots(){
        forEach(get_all_cells(), cell => {
            test_cell_content(cell);
        });
        
       //TODO:  alert amb propagator
    }

    get_roots(): Set<any>{
        return this.roots;
    }

    add_root(root: any){
        this.roots.add(root);
    } 

    get_no_goods(): Set<any>{
        return this.no_goods;
    }

    set_no_goods(no_goods: Set<any>){
        this.no_goods = no_goods;
    } 

    summarize(){
        return `${this.name}: ${this.belief_state}`;
    }

}

// TODO: maybe using a map could making altering quicker 
export var premises_list : Map<string, PremiseMetaData> = new Map(); 

export function clear_premises(){
    premises_list.clear();  
}

export function register_premise(name: string, root: any): PremiseMetaData{
    const premise = new PremiseMetaData(name);
    premise.add_root(root);
    premises_list.set(name, premise);
    return premise;
}

export function is_premises(name: string): boolean{
    // THIS IS QUITE SLOW 
    return premises_list.has(name); 
}

export function _premises_metadata(name: string): PremiseMetaData{
    const premise = premises_list.get(name);
    if(premise){
        return premise;
    }
    else{
        throw new Error(name + " is not a premise");
    }
} 

export function is_premises_in(name: string): boolean{
    return _premises_metadata(name).is_believed();
} 

export function is_premises_out(name: string): boolean{
    return !_premises_metadata(name).is_believed();
} 

export function mark_premises_in(name: string){
    _premises_metadata(name).set_believed();
} 

export function mark_premises_out(name: string){
    _premises_metadata(name).set_not_believed();
} 


export function all_premises_in(set: LayeredObject[]) {
    pipe(set,
        map(obj => get_support_layer(obj)), 
        forEach((perhapsSupport: Layer | null) => {
            if(!perhapsSupport){
                return;
            }

            perhapsSupport.get_value().forEach((premise: PremiseMetaData) => {
                 mark_premises_in(premise.get_name());
            });
        }),
    )    
}

export function premises_nogoods(name: string): Set<any>{
    return _premises_metadata(name).get_no_goods();
} 

export function set_premises_nogoods(name: string, nogoods: Set<any>){
    _premises_metadata(name).set_no_goods(nogoods);
} 

// TODO: adjoin support with subsumption???

// TODO: hypothese
