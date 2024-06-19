import { GenericProcedureMetadata } from "./GenericProcedureMetadata";

const stores =  new Map<(...args: any) => any, GenericProcedureMetadata>()

export function set_metaData(procedure: (...args: any) => any, metaData: GenericProcedureMetadata){
    stores.set(procedure, metaData)
}

export function get_metaData(procedure: (...args: any) => any): GenericProcedureMetadata | undefined{
    return stores.get(procedure)
}

export function get_store(): Map<(...args: any) => any, GenericProcedureMetadata>{
    return stores
}