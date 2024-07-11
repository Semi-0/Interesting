import { build, P, run_matcher } from "pmatcher/MatchBuilder"
import { isMatchFailure, matchSuccess } from "pmatcher/MatchResult"
import type { matcher_callback } from "pmatcher/MatchCallback"
import { MatchEnvironment } from "pmatcher/MatchEnvironment"
import type { MatchFailure } from "pmatcher/MatchResult"

export function tryMatch(data: any[], pattern: any[]) : boolean{
    return new Matcher(pattern)
                    .match(data)
                    .onSuccess(() => true)
                    .onFailed(() => false)
                    .getValue()
}

export class Matcher{
    matchers: matcher_callback

    constructor( pattern: any[]){
        this.matchers = build(pattern)
    }

    match(data: any[]): MatchResult{
        const result = run_matcher(this.matchers, data, (env, nEaten) => {
            return env
        })

        return new MatchResult(result)
    }
}


export class MatchResult{
    result: MatchEnvironment | MatchFailure
    output?: any

    constructor(result: MatchEnvironment | MatchFailure){
        this.result = result
    }

    onSuccess(fn: (result: MatchEnvironment) => any): MatchResult{
        if (matchSuccess(this.result)) {
            // @ts-ignore
            this.output = fn(this.result)
        }
        return this
    }

    onFailed(fn: (result: MatchFailure) => any): MatchResult{
        if (isMatchFailure(this.result)) {
            this.output = fn(this.result)
        }
        return this
    }

    getValue(): any{
        if (this.output === undefined) {
            throw new Error("output is undefined")
        }
        else if (this.output === null) {
            throw new Error("output is null")
        }
        else{
            return this.output
        }
    }

}


console.log(new Matcher([
    [P.constant, "test"],
    [P.element, "a"],
    [P.choose, 
        [P.constant, "test"],
        [P.element, "b"]
    ]])
        .match([
            "test",
            "a",
            "cd1e"
        ])
        .onSuccess((result) => {
            return result
        })
        .onFailed((result) => {
            return result
        })
        .getValue())
