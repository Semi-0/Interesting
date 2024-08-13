// -*- TypeScript -*-

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

// type ValueSet = {
//   elements: any[]{
//     return new Propaga
// };

// function isValueSet(value: any): value is ValueSet {
//   return value && Array.isArray(value.elements);
// }

// function makeValueSet(elements: any[]): ValueSet {
//   return { elements: filter(e => e !== nothing, elements) };
// }

// function valueSet(...elements: any[]): ValueSet {
//   return { elements: filter(e => e !== nothing, elements) };
// }

// function toValueSet(value: any): ValueSet {
//   return isValueSet(value) ? value : valueSet(value);
// }

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