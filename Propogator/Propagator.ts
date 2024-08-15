import { combineLatestAll, of, type BehaviorSubject, type Observable, map, combineLatest, Subscription, tap } from "rxjs";
import { Relation, make_relation } from "./Relation";
import { Cell, add_cell_content, cell_id, cell_strongest } from "./Cell";
import { add_global_child, add_global_propagator, get_global_parent, set_global_parent } from "./PublicState";
import { type Either, right, left } from "fp-ts/Either";
export class Propagator{
 private relation : Relation; 
 private inputs_ids : string[] = []; 
 private outputs_ids : string[] = []; 
 

 constructor(name: string, 
            inputs: Cell[], 
            outputs: Cell[], 
            activate: () => void){

    this.relation = get_global_parent();
    add_global_child(this.relation);

    this.inputs_ids = inputs.map(cell => cell_id(cell));
    this.outputs_ids = outputs.map(cell => cell_id(cell));

    activate();
    add_global_propagator(this);
 }

 getRelation(){
    return this.relation;
 }

 getInputsID(){
    return this.inputs_ids;
 }

 getOutputsID(){
    return this.outputs_ids;
 }
}

export function primitive_propagator(f: (...inputs: any[]) => any, name: string){
    return (...cells: Cell[]): Either<string, Propagator> => {
        if (cells.length > 1){

            const output = cells[cells.length - 1];
            const inputs = cells.slice(0, -1);
            const inputs_pub = inputs.map(cell => cell_strongest(cell).asObservable());
            
            // @ts-ignore
            return right(new Propagator(name, inputs, [output], () => {
                combineLatest(inputs_pub).pipe(
                    map(values => {
                        return f(...values);
                    }),
                ).subscribe(result => {
                    add_cell_content(output, result);
                });
            }))
        }
        else{
            return left("Primitive propagator must have at least two inputs");
        }
    }
}


export function compound_propagator(inputs: Cell[], outputs: Cell[], to_build: () => void, name: string): Either<string, Propagator>{
    const me = new Propagator(name, inputs, outputs, () => {
        // TODO: this is not good, in typescript there is no equivalent of parameterize in scheme, perhaps use readerMonad?
        set_global_parent(me.getRelation());
        to_build();
    });
    return right(me);
}

export function constraint_propagator(cells: Cell[], to_build: () => void, name: string): Either<string, Propagator>{
    return right(new Propagator(name, cells, cells, to_build));
}