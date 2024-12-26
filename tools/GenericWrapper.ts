import { Parser, charCode, oneOf, skipMany, seq, char, many, noneOf, parse, State, choice, letter, digit, fmap, many1, optional } from "parse-combinator"
import { match } from "pmatcher/MatchBuilder"

export function make_matcher(expr: any[]){
  return (input: any) => {
    return match(input, expr)
  }
}

export function generic_wrapper(
    functionToWrap: (...args: any[]) => any,
    outputModifier: (result: any) => any,
    ...inputModifiers: ((...args: any[]) => any)[]
  ) {
    return (...args: any[]) => {

      const modifiedInputs = args.map((arg, index) => {
        const modifier = inputModifiers[index];
        return modifier ? modifier(arg) : arg;
      });
  
      // Apply the wrapped function
      const result = functionToWrap(...modifiedInputs);
  
      // Apply output modifier
      return outputModifier(result);
    };
  }
  



  function getArity(func: Function): number {
    return func.length;
  }
  
  function spread<T extends any[], R>(
    f: (...args: T) => any,
    ...functions: ((...args: any[]) => any)[]
  ): (...args: T) => R[] {
    const nf = getArity(f);
    const arities = functions.map(getArity);
  
    return function theSpreader(...args: T): R[] {
      if (args.length !== nf) {
        throw new Error(`${f.name} takes ${nf} arguments, but ${args.length} were given`);
      }
  
      const result = f(...args);
      if (!Array.isArray(result)) {
        throw new Error('Result of f must be an array');
      }
  
      if (arities.reduce((a, b) => a + b, 0) !== result.length) {
        throw new Error(`Expected sum of arities ${arities.reduce((a, b) => a + b, 0)} does not match result length ${result.length}`);
      }
  
      // Split the result into slices for each function
      const slices: any[][] = [];
      let start = 0;
      for (const arity of arities) {
        slices.push(result.slice(start, start + arity));
        start += arity;
      }
  
      // Apply each function to its corresponding slice
      return functions.map((func, index) => func(...slices[index])) as R[];
    };
  }
  
  function compose<T extends any[], R>(
    ...functions: ((...args: any[]) => any)[]
  ): (...args: T) => R {
    return function theComposer(...args: T): R {
      return functions.reduce((x, f) => {
        return Array.isArray(x) ? f(...x) : f(x);
      }, args as any) as R;
    };
  }
  

  function parallelCombine<T, U, V>(
    h: (x: T, y: U) => V,
    f: (...args: any[]) => T,
    g: (...args: any[]) => U
  ): (...args: any[]) => V {
    return function theCombination(...args: any[]): V {
      return h(f(...args), g(...args));
    };
  }
  
  function spreadCombine<T, U, V>(
    h: (x: T, y: U) => V,
    f: (...args: any[]) => T,
    g: (...args: any[]) => U
  ): (...args: any[]) => V {
    const n = getArity(f);
    const m = getArity(g);
    const t = n + m;
  
    function theCombination(...args: any[]): V {
      if (args.length !== t) {
        throw new Error(`Expected ${t} arguments, but got ${args.length}`);
      }
      return h(f(...args.slice(0, n)), g(...args.slice(n)));
    }
  
    return theCombination;
  }

  function discardArgument(i: number) {
    if (!Number.isInteger(i) || i < 0) {
      throw new Error("i must be a non-negative integer");
    }
  
    return function<T extends any[], R>(f: (...args: T) => R) {
      const m = getArity(f) + 1;
      
      if (i >= m) {
        throw new Error(`Index ${i} is out of bounds for a function with ${m} arguments`);
      }
  
      return function theCombination(...args: any[]): R {
        if (args.length !== m) {
          throw new Error(`Expected ${m} arguments, but got ${args.length}`);
        }
        
        const newArgs = listRemove(args, i);
        return f(...newArgs as T);
      };
    };
  }
  
  function listRemove<T>(lst: T[], index: number): T[] {
    return [...lst.slice(0, index), ...lst.slice(index + 1)];
  }
  


function curryArgument(i: number) {
    return function(...args: any[]) {
      return function<T extends any[], R>(f: (...args: T) => R) {
        if (args.length !== getArity(f) - 1) {
          throw new Error(`Expected ${getArity(f) - 1} arguments, but got ${args.length}`);
        }
        return function(x: any): R {
          const newArgs = listInsert(args, i, x);
          return f(...newArgs as T);
        };
      };
    };
  }
  
  function listInsert<T>(lst: T[], index: number, value: T): T[] {
    return [...lst.slice(0, index), value, ...lst.slice(index)];
  }
  

function makePermutation(permspec: number[]): (args: any[]) => any[] {
    return (args: any[]) => permspec.map(i => args[i]);
  }
  
  function permuteArguments(...permspec: number[]) {
    const permute = makePermutation(permspec);
  
    return function<T extends any[], R>(f: (...args: T) => R) {
      const n = getArity(f);
  
      if (n !== permspec.length) {
        throw new Error(`Expected ${n} arguments in permspec, but got ${permspec.length}`);
      }
  
      return function theCombination(...args: T): R {
        if (args.length !== n) {
          throw new Error(`Expected ${n} arguments, but got ${args.length}`);
        }
        return f(...permute(args) as T);
      };
    };
  }
  
//   // Example usage
//   const result = permuteArguments(1, 2, 0, 3)(
//     (x: string, y: string, z: string, w: string) => ['foo', x, y, z, w]
//   )('a', 'b', 'c', 'd');
  
//   console.log(result);
  // Example usage
//   const result = curryArgument(2)('a', 'b', 'c')(
//     (x: string, y: string, z: string, w: string) => ['foo', x, y, z, w]
//   )('d');
  
//   console.log(result);
  // Example usage
//   const result = spreadCombine(
//     (x, y) => ({ x, y }),
//     (x: string, y: string) => ['foo', x, y],
//     (u: string, v: string, w: string) => ['bar', u, v, w]
//   )('a', 'b', 'c', 'd', 'e');
  
//   console.log(result);