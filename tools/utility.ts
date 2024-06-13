export function guard(condition: boolean, else_branch: () => void): void {
    if (condition) {
        return
    } else {
        else_branch()
    }
}

import {MatcherBuilder} from "pmatcher/MatchBuilder"

export const match = new MatcherBuilder()

