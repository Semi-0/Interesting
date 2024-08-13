import { v4 as uuidv4 } from 'uuid';
import { Cell } from './Cell';
import { make_relation, Relation } from './Relation';
import type { Propagator } from './Propagator';

export class PublicState{
    parent: Relation = make_relation("root", null);
    allCells: Cell[] = [];
    allPropagators: Propagator[] = [];

    addCell(cell: Cell){
        this.allCells.push(cell);
    }

    addChild(child: Relation){
        this.parent.addChild(child);
    }
}

export function add_global_cell(cell: Cell){
    public_state.addCell(cell);
} 

export function add_global_propagator(propagator: Propagator){
    public_state.allPropagators.push(propagator);
}

export function add_global_child(relation: Relation){
    public_state.addChild(relation);
}

export function get_global_parent(){
    return public_state.parent;
}

export function set_global_parent(relation: Relation){
    public_state.parent = relation;
}

export const public_state = new PublicState();

export const get_all_cells = (): Cell[] => {
    return public_state.allCells;
}


export var the_nothing = "the_nothing";

export function is_nothing(obj: any): obj is typeof the_nothing{
    return obj === the_nothing;
}