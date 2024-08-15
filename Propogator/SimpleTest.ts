import { isNumber } from "effect/Predicate";
import { Cell, add_cell_content } from "./Cell";

import { Propagator, constraint_propagator, primitive_propagator } from "./Propagator";  
import { get_all_cells } from "./PublicState";


import { combineLatestAll, of, type BehaviorSubject, type Observable, map, combineLatest, Subscription, tap } from "rxjs";

const p_multiply =  primitive_propagator((...inputs: any[]) => {
    console.log("multiple inputs", inputs);
    const result = inputs.reduce((acc, curr) => acc * curr, 1);
   inputs.forEach(input => {
    if (isNumber(input)) {
       console.log("input", input);
    }
    else{
        console.log("weird input")
    }
   })
   console.log("done");
    // console.log("multiply result", result);
    return result;
}, "multiply");

const p_subdivide = primitive_propagator((...inputs: any[]) => {
    // console.log("subdivide inputs", inputs);
    return inputs.slice(1).reduce((acc, curr) => acc / curr, inputs[0]);
}, "subdivide"); 


function c_multiply(x: Cell, y: Cell, product: Cell){
    return constraint_propagator([x, y, product], () => {
        p_multiply(x, y, product);
        p_subdivide(product, x, y);
        p_subdivide(product, y, x);
    }, "c:*")
}


function tell(cell: Cell, value: any){
   add_cell_content(cell, value);
}

const x = new Cell("x");
const y = new Cell("y");
const product = new Cell("product");

combineLatest([x.getStrongest(), y.getStrongest(), product.getStrongest()]).pipe(
    tap(values => console.log("values", values))
).subscribe();

x.getStrongest().subscribe(value => console.log("x update", value));


c_multiply(x, y, product);

tell(x, 4);
get_all_cells().forEach(cell => console.log(cell.summarize()));

tell(product, 40);
get_all_cells().forEach(cell => console.log(cell.summarize()));


// console.log(x.summarize());
// console.log(y.summarize());
// console.log(product.summarize());

// tell(x, 5);
// get_all_cells().forEach(cell => console.log(cell.summarize()));