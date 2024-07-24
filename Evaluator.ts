import { construct_simple_generic_procedure } from "generic-handler/GenericProcedure"
import { SchemeType,  SchemeElement, is_self_evaluating, schemeSymbol, is_true } from "./definition/SchemeElement"
import { define_generic_matcher } from "./tools/ExpressionHandler"
import { define, lookup, type Environment } from "./definition/Environment"
import {P} from "pmatcher/MatchBuilder"
import { isSucceed } from "pmatcher/Predicates"
import { apply as apply_matched} from "pmatcher/MatchResult/MatchGenericProcs"
import { apply } from "./Apply"
import { schemeList } from "./definition/SchemeElement"
import { make_matcher } from "./tools/GenericWrapper"
import { is_scheme_symbol } from "./definition/SchemeElement"
import { Closure } from "./definition/Closure"
import { first, rest } from "pmatcher/GenericArray"
import { isEmpty as is_empty, get_length, isPair as is_pair } from "pmatcher/GenericArray"
import { set } from "./definition/Environment"
import { will_define } from "pmatcher/MatchDict/DictValue"

type EvalHandler = (exec: (...args: any[]) => any, env: Environment, continuation: (result: SchemeElement, env: Environment) => SchemeElement) => any;

export const evaluate = construct_simple_generic_procedure("evaluate", 3, (expr, env, continuation) => {
    return default_eval(expr, env, continuation)
})

export function is_continuation(any: any): boolean{
    return any instanceof Function
}

const match_application = make_matcher([P.begin, [P.wildcard, P.wildcard, "..."], 
                                                 [[P.element, "operator"], [P.segment, "operands"]]])


function default_eval(expression: SchemeElement, env: Environment, continuation: (result: SchemeElement, env: Environment) => SchemeElement): SchemeElement{
    const application = match_application(expression)

    if (isSucceed(application)){
        return apply_matched((operator: SchemeElement, operands: SchemeElement[]) => {
            return apply(operator, operands, env, continuation)
        }, application)
    }
    else{
        throw Error("unknown expression type" + expression.toString() + "in environment" + env.toString())
    }   
}

function make_application(operator: SchemeElement, operands: SchemeElement[]): SchemeElement{
    return schemeList([operator, ...operands])
}


const match_self_evaluating = make_matcher([P.element, "expr", is_self_evaluating])

define_generic_matcher(evaluate, match_self_evaluating, 
    ((exec, env, continuation): EvalHandler => {
        return exec((expr: SchemeElement) => {
            return expr;
        });
    }) as EvalHandler
)


const match_var = make_matcher([P.element, "expr", is_scheme_symbol])

define_generic_matcher(evaluate,
    match_var,
    ((exec, env, continuation): EvalHandler => {
        return exec((expr: SchemeElement) => {
            const v = lookup(expr, env)
            if (v !== undefined && v !== null){
                return v
            }
            else{
                throw Error("unknown variable" + v + "in environment" + env.toString())
            }
        });
    }) as EvalHandler
)


const match_quoted = make_matcher(["quote", [P.element, "expr"]])

define_generic_matcher(evaluate, match_quoted, ((exec, env, continuation): EvalHandler => {
    return exec((expr: SchemeElement) => {
        return expr
    });
}) as EvalHandler)


const match_if = make_matcher(["if", [P.element, "predicate"],  
                                     [P.element, "consequent"], 
                                     [P.element, "alternative"]])

function make_if(predicate: SchemeElement, consequent: SchemeElement, alternative: SchemeElement): SchemeElement{
    return schemeList([schemeSymbol("if"), predicate, consequent, alternative])
}

define_generic_matcher(evaluate, match_if, ((exec, env, continuation): EvalHandler => {
    return exec((predicate: SchemeElement, consequent: SchemeElement, alternative: SchemeElement) => {
        if (is_true(continuation(predicate, env))){
            return continuation(consequent, env)
        }
        else{
            return continuation(alternative, env)
        }
    });
}) as EvalHandler)


const match_lambda = make_matcher(["lambda", [[P.many, [P.element, "parameters"]]], [P.segment, "body"]])

define_generic_matcher(evaluate, match_lambda, ((exec, env, continuation): EvalHandler => {
    return exec((parameters: SchemeElement[], body: SchemeElement[]) => {
        return  new Closure(parameters, seq_to_begin(body), env)
    });
}) as EvalHandler)

function make_lambda(parameters: SchemeElement[], body: SchemeElement[]): SchemeElement{
    return schemeList([schemeSymbol("lambda"), schemeList(parameters), seq_to_begin(body)])
}

function seq_to_begin(seq: SchemeElement[]): SchemeElement{
    const already_begin = match_begin(seq)
    if (isSucceed(already_begin)){
        return already_begin
    }
    else if (get_length(seq) === 1){
        return first(seq)
    }
    else{
        return schemeList([schemeSymbol("begin"), ...seq])
    }
}


const match_begin = make_matcher(["begin", [P.segment, "actions"]])

define_generic_matcher(evaluate, match_begin, ((exec, env, continuation): EvalHandler => {
    return exec((actions: SchemeElement[]) => {
        return continuation_sequence(actions, env, continuation)
    });
}) as EvalHandler)

function continuation_sequence(actions: SchemeElement[], env: Environment, continuation: (result: SchemeElement, env: Environment) => SchemeElement): SchemeElement{
    if (is_empty(actions)){
        throw Error("empty sequence in evaluate_sequence")
    }
    else if (get_length(actions) === 1){
        return continuation(first(actions), env)
    }
    else{
        continuation(first(actions), env)
        return continuation_sequence(rest(actions), env, continuation)
    }
}


const match_cond = make_matcher(["cond", [[P.many, [[P.element, "predicates"], [P.element, "consequents"]]]]])

define_generic_matcher(evaluate, match_cond, 
    ((exec, env, continuation): EvalHandler => {
    return exec((predicates: SchemeElement[], consequents: SchemeElement[]) => {
        return continuation(cond_to_if(predicates, consequents), env)
    });
}) as EvalHandler)

function cond_to_if(predicates: SchemeElement[], consequents: SchemeElement[]): SchemeElement{
    function expand(predicates: SchemeElement[], consequents: SchemeElement[]): SchemeElement{
        if (is_empty(predicates)){
            throw Error("empty predicates in cond_to_if")
        }
        else if (get_length(predicates) === 1){
            if (first(predicates) == schemeSymbol("else")){
                return first(consequents)
            }
            else{
                throw Error("no else in cond_to_if")
            }
        }
        else{
            return make_if(first(predicates), first(consequents), expand(rest(predicates), rest(consequents)))
        }
    }
    return expand(predicates, consequents)
}


const match_let = make_matcher(["let", [[P.many, [[P.element, "names"], [P.element, "values"]]]], [P.segment, "body"]])

define_generic_matcher(evaluate, match_let, ((exec, env, continuation): EvalHandler => {
    return exec((names: SchemeElement[], values: SchemeElement[], body: SchemeElement[]) => {
        return continuation(let_to_combination(names, values, body), env);
    });
}) as EvalHandler);

function let_to_combination(names: SchemeElement[], values: SchemeElement[], body: SchemeElement[]): SchemeElement{
    return make_application(make_lambda(names, body), values)
}

const match_assignment = make_matcher(["set!", [P.element, "name"], [P.element, "value"]])

define_generic_matcher(evaluate, match_assignment, ((exec, env, continuation): EvalHandler => {
    return exec((name: SchemeElement, value: SchemeElement) => {
        set(name, continuation(value, env), env)
    });
}) as EvalHandler);


const match_define = make_matcher(
    [P.new, ["parameters"], 
        [P.choose,
            ["define", [P.element, "name"], [P.element, "body"]],
            ["define", [[P.element, "name"], [P.segment, "parameters"]], [P.segment, "body"]]]])

define_generic_matcher(evaluate, match_define, ((exec, env, continuation): EvalHandler => {
    return exec((name: SchemeElement, parameters: SchemeElement[] | string, body: SchemeElement[]) => {
        if (parameters === will_define){
            define(name, continuation(seq_to_begin(body), env), env)
        }
        else{
            // @ts-ignore
            define(name, make_lambda(parameters, body), env)
        }
    });
}) as EvalHandler);