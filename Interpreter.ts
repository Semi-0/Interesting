// import { generic_procedure } from "./tools/GenericHandler";
// import type { LispElement } from "./definition/LispElement";


// class Environment{
//     public parent: Environment | null = null
//     public variables: {[key: string]: LispElement} = {}
// }

// class Eval extends generic_procedure{
//     constructor(){
//         super(2, (...args: any[]) => {
            
//         })
//     }
// }

// const evaluate = new Eval()

// function default_eval(expression: LispElement, env: Environment){
//     if (isApplication(expression)){
//         apply(advance(
//             (evaluate.execute(operator(expression), env)),
//             operands(expression),
//             environment))
//     }
//     else{
//         error("Unknown expression type: ", expression)
//     }
// }