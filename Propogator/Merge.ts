import { construct_simple_generic_procedure } from "generic-handler/GenericProcedure";
import { is_cell_value, get_cell_value, CellValue, is_nothing, is_contradiction, the_contradiction } from "./CellValue";
import { is_equal } from "./PublicState";




export const merge = construct_simple_generic_procedure("merge", 2,
    (content: CellValue, increment: CellValue) => {
        if (is_nothing(content)) {
            return increment
        }
        else if (is_nothing(increment)) {
            return content
        }
        else if (is_contradiction(content)) {
            return content
        }
        else if (is_contradiction(increment)) {
            return increment
        }
        else if (is_equal(content, increment)) {
            return content
        }
        else {
            return the_contradiction
        }
    }
)