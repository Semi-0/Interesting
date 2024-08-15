// -*- TypeScript -*-

import { define_generic_procedure_handler } from "generic-handler/GenericProcedure";
import { get_base_value, type LayeredObject } from "../LayerSystem/Layer";
import  { get_support_layer, get_support_layer_value, SupportSet } from "../LayerSystem/Support";
import { get_cell_value, is_nothing, type CellValue } from "./CellValue";
import { match_args } from "generic-handler/Predicates";
import { is_unusable_value, merge_layered, value_imples } from "./PublicState";
import { map } from "fp-ts/Array";
import { smaller_than_or_equal } from "../LayerSystem/LayerGenrics";
// Copyright (C) 2019, 2020, 2021 Chris Hanson and Gerald Jay Sussman

// This file is part of SDF.  SDF is software supporting the book
// "Software Design for Flexibility", by Chris Hanson and Gerald Jay
// Sussman.

// SDF is free software: you can redistribute it and/or modify it
// // under the terms of the GNU General Public License as published by
// // the Free Software Foundation, either version 3 of the License, or
// // (at your option) any later version.

// // SDF is distributed in the hope that it will be useful, but
// // WITHOUT ANY WARRANTY; without even the implied warranty of
// // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// // General Public License for more details.
// {
//     return new Propaga
// }
// // You should have received a copy of the GNU General Public License
// // along with SDF.  If not, see <https://www.gnu.org/licenses/>.
// {
//     return new Propaga
// }
// import { define_generic_procedure_handler } from 'generic-handler/GenericProcedure';
// import { match_args } from 'generic-handler/Predicates';
// import { map, reduce, filter } from 'fp-ts/Array';
// import { isArray } from 'effect/Array';
// import { type Option, none, some } from 'fp-ts/Option';


class ValueSet{
    public elements: SupportSet = new SupportSet((a: CellValue) => get_cell_value(a));

    constructor(elements: CellValue[]){
        
        this.elements = new SupportSet((a: CellValue) => get_cell_value(a));
        for(const element of elements){
            this.elements.add(element);
        }
    }

    public map(procedure: (a: any) => any){
        this.elements = this.elements.map(procedure);
        return this;
    }

    public reduce(procedure: (acc: any, item: any) => any, initial: any){
        this.elements = this.elements.reduce(procedure, initial);
        return this;
    } 

    public filter(predicate: (a: any) => boolean){
        this.elements = this.elements.filter(predicate);
        return this;
    } 

    public merge(set: ValueSet){
       this.elements.merge(set.elements); 
       return this;
    }
}

function reduce(set: ValueSet, procedure: (acc: any, item: any) => any, initial: any){
    return set.elements.reduce(procedure, initial);
}

function any(predicate: (a: any) => boolean, set: SupportSet): boolean {
    // THIS SHOULD BE MORE GENERIC
    return set.any(predicate)
}

function isValueSet(value: any): value is ValueSet {
  return value instanceof ValueSet;
}

function makeValueSet(elements: CellValue[]): ValueSet {
  return new ValueSet(elements);
}

function toValueSet(value: any): ValueSet {
  return isValueSet(value) ? value : makeValueSet(value);
}

define_generic_procedure_handler(get_base_value,
    match_args(isValueSet),
    (set: ValueSet) => get_base_value(strongest_consequence(set)))

define_generic_procedure_handler(is_unusable_value,
    match_args(isValueSet),
    (set: ValueSet) => is_unusable_value(strongest_consequence(set)))


function map_value_set(procedure: (a: any) => any, ...sets: ValueSet[]): ValueSet {
    return sets.reduce((acc, set) => acc.merge(set.map(procedure)), new ValueSet([]));
}

function merge_value_sets(content: any, increment: CellValue[]): ValueSet {
    return is_nothing(increment) ? toValueSet(content) : value_set_adjoin(toValueSet(content), increment);
}

function value_set_adjoin(set: ValueSet, elt: CellValue[]): ValueSet {
    if(any(oldElt => element_subsumes(oldElt, elt), set.elements)) {
        return set;
    }
    else{
        return set.merge(new ValueSet(elt));
    }
}

function element_subsumes(elt1: any, elt2: any): boolean {
    return (
        value_imples(get_base_value(elt1), get_base_value(elt2)) &&
        smaller_than_or_equal(get_support_layer_value(elt1), get_support_layer_value(elt2))
    );
}


function strongest_consequence(set: ValueSet): CellValue{
    return reduce(set, (acc, item) => merge_layered(acc, item), new ValueSet([]));
}

 



// define_generic_procedure_handler(
//   'getBaseValue',
//   match_args(isValueSet),
//   (set: ValueSet) => getBaseValue(strongestConsequence(set))
// );

// define_generic_procedure_handler(
//   'unusableValue',
//   match_args(isValueSet),
//   (set: ValueSet) => unusableValue(strongestConsequence(set))
// );

// define_generic_procedure_handler(
//   'strongestValue',
//   match_args(isValueSet),
//   (set: ValueSet) => strongestConsequence(set)
// );

// function mapValueSet(procedure: Function, ...sets: ValueSet[]): ValueSet {
//   return makeValueSet(map(procedure, ...sets.map(set => set.elements)));
// }

// function mergeValueSets(content: any, increment: any): ValueSet {
//   return nothing(increment) ? toValueSet(content) : valueSetAdjoin(toValueSet(content), increment);
// }

// function valueSetAdjoin(set: ValueSet, elt: any): ValueSet {
//   if (any(oldElt => elementSubsumes(oldElt, elt), set.elements)) {
//     return set;
//   }
//   return makeValueSet(
//     lsetAdjoin(
//       equivalent,
//       remove(oldElt => elementSubsumes(elt, oldElt), set.elements),
//       elt
//     )
//   );
// }

// function elementSubsumes(elt1: any, elt2: any): boolean {
//   return (
//     valueImplies(baseLayerValue(elt1), baseLayerValue(elt2)) &&
//     supportSetLessThanOrEqual(supportLayerValue(elt1), supportLayerValue(elt2))
//   );
// }

// function strongestConsequence(set: ValueSet): any {
//   return reduce(
//     theNothing,
//     (content, increment) => mergeLayered(content, increment),
//     filter(elt => allPremisesIn(supportLayerValue(elt)), set.elements)
//   );
// }