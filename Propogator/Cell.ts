import {  public_state, the_nothing, PublicState, is_nothing, add_global_cell, add_global_child, get_global_parent } from "./PublicState";
import { Propagator } from "./Propagator";
import { BehaviorSubject, pipe } from "rxjs";
import { construct_simple_generic_procedure } from "generic-handler/GenericProcedure";
import { isArray } from "effect/Array";
import { construct } from "pmatcher/GenericArray";
import { filter, map } from "rxjs/operators";
import { Relation, make_relation } from "./Relation";
import { inspect } from "bun";

const cell_merge = construct_simple_generic_procedure("cell_merge", 2, (a, b) => {
  console.log("a", a);
  console.log("b", b);
if (is_nothing(a) && !isNaN(b)) {
    return b;
  }
  else if (is_nothing(b)) {
    return a;
  }
  else if (a === b){
    return a;
  }
  else if (isArray(a)){
    return a.concat(b);
  }
  else if (isArray(b)){
    return [a].concat(b);
  }
  else if (isNaN(b)){
    return a;
  }
  else {
    return [a, b];
  }
});

const strongest_value = construct_simple_generic_procedure("strongest_value", 1, (a: any[]) => {
  if (isArray(a) && a.length > 0) {
    return a[a.length - 1];
  }
  else if (is_nothing(a)) {
    return the_nothing;
  }

  else {
    return a;
  }
})

const general_contradiction = construct_simple_generic_procedure("general_contradiction", 1, (a: any) => {
  return false;
})

const handle_contradiction = construct_simple_generic_procedure("handle_contradiction", 1, (a: any) => {
  return null;
})

const compactMap = <T, R>(fn: (value: T) => R) => pipe(
  map(fn),
  filter(value => value !== null && value !== undefined)
);

class Cell{
  private relation : Relation 
  private neighbors : Map<string, Propagator> = new Map();
  private content : BehaviorSubject<any> = new BehaviorSubject<any>(the_nothing);
  private strongest : BehaviorSubject<any> = new BehaviorSubject<any>(the_nothing);

  constructor(name: string){
    this.relation = make_relation(name, get_global_parent());

    this.content
        .pipe(
          compactMap(content => this.testContent(content))
        )
        .subscribe(content => {
          console.log("content in strongest", content);
          this.strongest.next(content);
        });

    add_global_cell(this);
    add_global_child(this.relation);
  }

  getRelation(){
    return this.relation;
  }

  getContent(){
    return this.content;
  } 

  getStrongest(){
    return this.strongest;
  } 

  getNeighbors(){
    return this.neighbors;
  }

  addContent(increment:any){
    this.content.next(cell_merge(this.content.getValue(), increment));
  }

  testContent(content: any): any | null {
    console.log("test content", content);
    const _strongest = strongest_value(content);
    if (_strongest === this.strongest.getValue()){
      return null;
    }
    else if (general_contradiction(_strongest)){
      handle_contradiction(this);
      return _strongest;
    }
    else {
      return _strongest
    }
  }

  addNeighbor(propagator: Propagator){
    this.neighbors.set(propagator.getRelation().getID(), propagator);
  }

  summarize(){
    const name = this.relation.getName();
    const strongest = this.strongest.getValue();
    const content = this.content.getValue();
    return `name: ${name}\nstrongest: ${strongest}\ncontent: ${content}`;
  }
}


function add_cell_neighbour(cell: Cell, propagator: Propagator){
  cell.addNeighbor(propagator);
}

function add_cell_content(cell: Cell, content: any){
  cell.addContent(content);
}

function cell_strongest(cell: Cell){
  return cell.getStrongest();
}

function cell_id(cell: Cell){
  if (cell === undefined){
    console.log("cell is undefined");
    return "undefined";
  }

  return cell.getRelation().getID();
}

export { Cell, cell_merge, strongest_value, general_contradiction, handle_contradiction, add_cell_neighbour, add_cell_content, cell_strongest, cell_id };