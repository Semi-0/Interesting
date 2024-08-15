import { construct_simple_generic_procedure, define_generic_procedure_handler } from "generic-handler/GenericProcedure";
import { match_args } from "generic-handler/Predicates";
import { is_support_set, SupportSet } from "./Support";

export const smaller_than_or_equal = construct_simple_generic_procedure("smaller_than_or_equal", 2, (a: any, b: any) => {
    return a <= b;
})

define_generic_procedure_handler(smaller_than_or_equal,
    match_args(is_support_set, is_support_set),
    (a: SupportSet, b: SupportSet) => {
        return a.is_subset(b);
    }
)
