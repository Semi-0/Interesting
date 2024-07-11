import { define_generic_procedure_handler, construct_simple_generic_procedure } from "generic-handler/GenericProcedure"; 

import type { LispElement, Atom } from "./definition/LispElement";
import { LBoolean, LNumber, LString , LSymbol, unwrapAtom, isAtom } from "./definition/LispElement"
import { pipe } from "effect";
import { match_args } from "generic-handler/Predicates";
import type { Env } from "bun";
import { Environment, is_environment } from "./definition/Environment";
import { apply } from "./Apply";
import { Closure } from "./definition/Closure";
import { inspect } from "util";
import { PrimitiveFunctions } from "./definition/PrimitiveFunction";
import { isArray } from "pmatcher/utility";
import { tryMatch, Matcher, MatchResult } from "./tools/MatcherWrapper"

export const advance = construct_simple_generic_procedure("advance", 1, 
    (expr: LispElement) => {
       return expr 
    }
)

export const evaluate = construct_simple_generic_procedure("evaluate",
    2, default_eval
)

function default_eval(expression: LispElement, env: Environment): LispElement{
    const isApplication = (expr: LispElement): boolean => {
        const list = expr as Array<LispElement> 
        return  list.length >= 1
    }

    const operator = (expr: LispElement): LispElement => {
        let list = expr as Array<LispElement>
        return list[0]
    }

    const operands = (expr: LispElement): LispElement => {
        let list = expr as Array<LispElement> 
        return list.slice(1, list.length)
    }


    if (isApplication(expression)){
        return apply(
            advance(evaluate(operator(expression), env)),
            operands(expression) as Array<LispElement>,
            env)
    }
    else{
       throw Error("unknown expression type" + inspect(expression, { showHidden: true, depth: 5})) 
    }
}

function make_application(operator: LispElement, operands:  Array<LispElement>): LispElement{
    return operands.unshift(operator)
}

define_generic_procedure_handler(evaluate,
   match_args(is_self_evaluating, is_environment),
   (expr, env) => {
       return expr
   }
)

function is_self_evaluating(expr: LispElement): boolean{
    return expr instanceof LNumber || expr instanceof LString || expr instanceof LBoolean 
}



define_generic_procedure_handler(evaluate,
    match_args(is_variable, is_environment),
    (expr, env) => {
        const v = env.lookup(unwrapAtom(expr) as string)
        if (v !== undefined && v !== null){
            return v
        }
        else{
            throw Error("unbound variable: " + expr.toString())
        }
    }
)

function is_variable(expr: LispElement): boolean{
    return expr instanceof LSymbol
}


define_generic_procedure_handler(evaluate,
    match_args(is_quoted, is_environment),
    (expr, env) => {
        if ((expr as  Array<LispElement>).length != 2){
            throw Error("quote must be followed by exactly one argument, expr: " + expr.toString())
        }
        return (expr as  Array<LispElement>)[1]
    }
)

function is_tagged_list(expr: LispElement, tag: string): boolean{
    if (!(expr instanceof  Array )) return false;
    const l = expr as  Array<LispElement>;

    const a = l[0];
    if (!(a instanceof LSymbol)) return false;
    return (a as LSymbol).value === tag;
}

function is_quoted(expr: LispElement): boolean{
    return is_tagged_list(expr, "quote")
}


define_generic_procedure_handler(evaluate,
    match_args(is_if, is_environment),
    (expr, env) => {
        const result: LBoolean = advance(evaluate(if_predicate(expr), env))
 
        if (result.isTrue()) {
            return evaluate(if_consequent(expr), env)
        }
        else{
            return evaluate(if_alternative(expr), env)
        }
    }
)

function is_if(expr: LispElement): boolean{
    return is_tagged_list(expr, "if")
}

function if_predicate(expr: LispElement): LispElement{
    if (expr instanceof  Array && (expr as Array<LispElement>).length == 4){
        return (expr as Array<LispElement>)[1]
    }
    else{
        throw Error("if must be followed by exactly three arguments, expr: " + expr.toString())
    }
}

function if_consequent(expr: LispElement): LispElement{
    if (expr instanceof Array && (expr as Array<LispElement>).length == 4){
        return (expr as Array<LispElement>)[2]
    }
    else{
        throw Error("if must be followed by exactly three arguments, expr: " + expr.toString())
    }
}

function if_alternative(expr: LispElement): LispElement{
    if (expr instanceof Array && (expr as Array<LispElement>).length == 4){
        return (expr as Array<LispElement>)[3]
    }
    else{
        throw Error("if must be followed by exactly three arguments, expr: " + expr.toString())
    }
}

function make_if(predicate: LispElement, consequent: LispElement, alternative: LispElement): LispElement{
    return [new LSymbol("if"), predicate, consequent, alternative]
}

define_generic_procedure_handler(evaluate,
    match_args(is_lambda, is_environment),
    (expr, env) => {

        const parameters = lambda_parameters(expr) as Array<LispElement>
        const body = lambda_body(expr)

        if (parameters instanceof Array){
            return make_compound_procedure(parameters, body, env)
        }
        else{
            throw Error("lambda must be followed by a list of parameters, expr: " + expr.toString())
        }
    }
)

function is_lambda(expr: LispElement): boolean{
    return is_tagged_list(expr, "lambda")
}

function lambda_parameters(expr: LispElement): LispElement{
    if (expr instanceof Array && (expr as Array<LispElement>).length > 2){
        return (expr as Array<LispElement>)[1]
    }
    else{
        throw Error("lambda must be followed by exactly two arguments, expr: " + expr.toString())
    }
}

// to fix with begin
function lambda_body(expr: LispElement): LispElement{
    if (expr instanceof Array && (expr as Array<LispElement>).length > 2){
        const full_body = (expr as Array<LispElement>).slice(2, (expr as Array<LispElement>).length)
        return sequence_to_begin(full_body)
    }
    else{
        throw Error("lambda must be followed by exactly two arguments, expr: " + expr.toString())
    }
}

// to fix with begin
function make_lambda(parameters: LispElement, body: LispElement): LispElement{
    return [new LSymbol("lambda"), parameters, flatten_begin(body)]
}

const flatten_begin = (expr: LispElement): LispElement => {
    if (is_begin(expr)){
        return begin_actions(expr)
    }
    else{
        return expr
    }
}


function sequence_to_begin(seq: LispElement): LispElement{
    if (seq instanceof  Array){
        if ((seq as  Array<LispElement>).length == 0){
            return (seq as  Array<LispElement>)
        }
        else if ((seq as  Array<LispElement>).length == 1){
            // so it must be [[a]] but that is in valid, if only have one element it should be a
            return (seq as  Array<LispElement>)[0] 
        }
        else{
            // [a b c d e]
            const seq_list = seq as  Array<LispElement>
            return make_begin(seq_list.map(flatten_begin))
        }
    }
    else if (isAtom(seq)){
        return seq
    }
    else{
        throw Error("sequence_to_begin: expected a list or atom, got: " + seq.toString())
    }
}

function make_compound_procedure(parameters:  Array<LispElement>, body: LispElement, env: Environment): LispElement{
    return new Closure(parameters , body, env)
}


define_generic_procedure_handler(evaluate,
    match_args(is_cond, is_environment),
    (expr, env) => {
        return evaluate(cond_to_if(expr), env)
    }
)

function is_cond(expr: LispElement): boolean{
    return is_tagged_list(expr, "cond")
}

function cond_clauses(expr: LispElement):  Array<LispElement>{
    if (expr instanceof  Array && (expr as  Array<LispElement>).length > 1){
        return (expr as  Array<LispElement>)[1] as  Array<LispElement>
    }
    else{
        throw Error("cond must be followed by at least one clause")
    }
}

function cond_clause_predicate(clause: LispElement): LispElement{
    if (clause instanceof Array && (clause as  Array<LispElement>).length > 1){
        return (clause as  Array<LispElement>)[0]
    }
    else{
        throw Error("clause must be a list of exactly two elements")
    }
}

function cond_clause_consequent(clause: LispElement): LispElement{
    if (clause instanceof Array && (clause as  Array<LispElement>).length > 1){
        return sequence_to_begin((clause as  Array<LispElement>).slice(1))
    }
    else{
        throw Error("clause must be a list of exactly two elements")
    }
}

function is_else_clause(clause: LispElement): boolean{
    return is_tagged_list(clause, "else")
}

function cond_to_if(cond_expr: LispElement): LispElement{
    function expand(clauses:  Array<LispElement>): LispElement{
        if (clauses.length == 0){
            throw Error("COND: no value matched" + cond_expr.toString())
        }
        else if (is_else_clause(clauses[0])){
            if ((clauses[0] as  Array<LispElement>).length != 2){
                throw Error("else clause must be followed by exactly one argument, expr: " + clauses[0]).toString()
            } 
            return cond_clause_consequent(clauses[0])
        }
        else{
            return make_if(cond_clause_predicate(clauses[0]), cond_clause_consequent(clauses[0]), expand(clauses.slice(1)))
        }
    }
    if (cond_clauses(cond_expr) instanceof  Array){
        return expand(cond_clauses(cond_expr) as  Array<LispElement>)
    }
    else{
        throw Error("cond must be followed by a list of clauses, expr: " + cond_expr.toString())
    }
}

define_generic_procedure_handler(evaluate,
    match_args(is_let, is_environment),
    (expr, env) => {
        return evaluate(let_to_combination(expr), env)
    }
)

function is_let(expr: LispElement): boolean{
    return is_tagged_list(expr, "let")
}

function let_bound_variables(let_expr: LispElement):  Array<LispElement>{
    if (let_expr instanceof Array && (let_expr as  Array<LispElement>).length == 3){
        const let_exprs = (let_expr as  Array<LispElement>[1]) as  Array<LispElement> 
        return let_exprs.map((expr: LispElement) => {
            return (expr as  Array<LispElement>)[0]
        })
    }
    else{
        throw Error("let must be followed by exactly two arguments, expr: " + let_expr.toString())
    }
}

function let_bound_values(let_expr: LispElement):  Array<LispElement>{
    if (let_expr instanceof  Array && (let_expr as  Array<LispElement>).length == 3){
        const let_exprs = (let_expr as  Array<LispElement>)[1] as  Array<LispElement> 
        return let_exprs.map((expr: LispElement) => {
            return (expr as  Array<LispElement>)[1]
        })
    }
    else{
        throw Error("let must be followed by exactly two arguments, expr: " + let_expr.toString())
    }
}

function let_body(let_expr: LispElement): LispElement{
    if (let_expr instanceof Array && (let_expr as  Array<LispElement>).length == 3){
        return sequence_to_begin((let_expr as  Array<LispElement>)[2])
    }
    else{
        throw Error("let must be followed by exactly two arguments, expr: " + let_expr.toString())
    }
}

function let_to_combination(let_expr: LispElement): LispElement{
    const names = let_bound_variables(let_expr)
    const values = let_bound_values(let_expr)
    const body = let_body(let_expr)
    return make_application(make_lambda(names, body), values)
}


define_generic_procedure_handler(evaluate,
    match_args(is_begin, is_environment),
    (expr, env) => {
        const begin_expr = begin_actions(expr)
        if (begin_expr instanceof Array){
            return evaluate_sequence(begin_expr as  Array<LispElement>, env)
        }
        else{
            throw Error("begin must be followed by a list of expressions, expr: " + expr.toString())
        }
    }
)

function is_begin(expr: LispElement): boolean{
    return is_tagged_list(expr, "begin")
}

function begin_actions(expr: LispElement): LispElement{
    return (expr as  Array<LispElement>).slice(1, (expr as  Array<LispElement>).length)
}

function make_begin(actions:  Array<LispElement>): LispElement{
    return actions.unshift(new LSymbol("begin"))
}

function evaluate_sequence(actions:  Array<LispElement>, environment: Environment): LispElement{
    if (actions.length == 0){
        throw Error("empty sequence" + actions.toString())
    }
    if (actions.length == 1){
        return evaluate(actions[0], environment)
    }
    else{
        evaluate(actions[0], environment)
        return evaluate_sequence(actions.slice(1, actions.length), environment)
    }
}

define_generic_procedure_handler(evaluate,
    match_args(is_assignment, is_environment),
    (expr, env) => {
        const name = assignment_variable(expr)
        const value = evaluate(assignment_value(expr), env)
        env.set(name, value)
        return value
    }
)

function is_assignment(expr: LispElement): boolean{
    return is_tagged_list(expr, "set!")
}

function assignment_variable(expr: LispElement): string{
    if (expr instanceof Array && (expr as  Array<LispElement>).length == 3){
        return unwrapAtom((expr as  Array<LispElement>)[1]) as string
    }
    else{
        throw Error("assignment must be followed by exactly two arguments, expr: " + expr.toString())
    }
}

function assignment_value(expr: LispElement): LispElement{
    if (expr instanceof Array && (expr as Array<LispElement>).length == 3){
        return (expr as Array<LispElement>)[2]
    }
    else{
        throw Error("assignment must be followed by exactly two arguments, expr: " + expr.toString())
    }
}

define_generic_procedure_handler(evaluate,
    match_args(is_definition, is_environment),
    (expr, env) => {
        const name = definition_variable(expr)
        const value = evaluate(definition_value(expr), env)
        env.define_closure(name, value)
        return value
    }
)

function is_definition(expr: LispElement): boolean{
    return is_tagged_list(expr, "define")
}

function has_variable(expr: LispElement): boolean{
    return expr instanceof Array && (expr as Array<LispElement>).length > 1
}

function definition_variable(expr: LispElement): string{
    const l = (expr as Array<LispElement>)[1]
    if (has_variable(l)){
        return unwrapAtom((l as Array<LispElement>)[0]) as string
    }
    else if (l instanceof LSymbol){
        return unwrapAtom(l) as string
    }
    else{
        throw Error("definition must be followed by a variable, expr: " + expr.toString())
    }
}

function definition_value(expr: LispElement): LispElement{
   const l = (expr as Array<LispElement>)[1]
   if (has_variable(l)){
    return make_lambda(l, (expr as Array<LispElement>)[2])
   }
   else{
    return (expr as Array<LispElement>)[2]
   }
}