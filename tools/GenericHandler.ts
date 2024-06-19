// import { Number, type Static } from 'runtypes';




// export class GenericProcedureStore{
//     private metaDatas: Map<(...args: any) => any, GenericProcedureMetadata>
//     constructor(){
//         this.metaDatas = new Map()
//     }

//     public add_metadata(procedure: (...args: any) => any, metaData: GenericProcedureMetadata){
//         this.metaDatas.set(procedure, metaData)
//     }

//     public find_metadata(procedure: (...args: any) => any): GenericProcedureMetadata | undefined{
//         return this.metaDatas.get(procedure)
//     }

//     public get_length(): Int{
//         return this.metaDatas.size
//     }
// }

// // export type GenericProcedureStore = GenericProcedureMetadata[]

// const generic_procedure_store : GenericProcedureStore = new GenericProcedureStore()




// export function define_generic_procedure_handler(procedure: (...args: any) => any, predicate: (...args: any) => boolean, handler: (...args: any) => any){
//     const metaData = generic_procedure_store.find_metadata(procedure)
//     if(metaData === undefined){
//         throw new Error("Generic handler failed")
//     }
//     add_handler(metaData, predicate, handler)
// }


// export function add_handler(metaData: GenericProcedureMetadata, predicate: (...args: any) => boolean, handler: (...args: any) => any){
//     metaData.addHandler(predicate, handler);
// }

// export function simple_generic_procedure(name: string, arity: Int, handler: (...args: any) => any): (...args: any) => any {
//     return construct_generic_procedure(generic_procedure_store)(name, arity, handler)
// }

// export function construct_generic_procedure(generic_procedure_store: GenericProcedureStore): (name: string, arity: Int, handler: (args: any[]) => any) => (...args: any) => any {
//    const constructor = (name: string, arity: Int, handler: (args: any[]) => any) => {
//         const metaData = make_generic_metadata(name, arity, handler)
//         const the_generic_procedure = (...args: any) : any => {
//             return generic_procedure_dispatch(metaData, ...args)
//         }
//         generic_procedure_store.add_metadata(the_generic_procedure, metaData)
//         return the_generic_procedure
//    }

//    return constructor
// }

// function generic_procedure_dispatch(metaData: GenericProcedureMetadata, ...args: any): any{


//     if(metaData === undefined){
//         throw new Error("Generic handler failed")
//     }
//     const matched_metadata = metaData.metaData.find(rule => rule.predicate(...args))
//     if(matched_metadata === undefined){
//         return metaData.defaultHandler(...args)
//     }
//     return matched_metadata.handler(...args)
// }

// function make_generic_metadata(name: string, arity: Int, handler: (...args: any) => any): GenericProcedureMetadata{
//     const metaData : GenericProcedureMetadata =  new GenericProcedureMetadata(
//         name,
//         arity,
//         [],
//         handler
//     )
//     return metaData
// }


// // function testing(arg: Int){
// //     const generic_procedure = simple_generic_procedure("testing", 1, (...args: any) => "default response")
// //     return generic_procedure(arg)
// // }
// const testing = simple_generic_procedure("testing", 1, (...args: any) => "default response")

// define_generic_procedure_handler(testing, 
//             (args: any) => {console.log(args); 
//                             return args === 42}, 
//             (...args: any) => "specific response")
