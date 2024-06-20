import { define_generic_procedure_handler, construct_simple_generic_procedure } from "./tools/GenericProcedure/GenericProcedure"; 

import type { LispElement } from "./definition/LispElement";
import { LBoolean, LNumber, LString, List, LSymbol, unwrapAtom } from "./definition/LispElement"
import { pipe } from "effect";
import { match_args } from "./tools/GenericProcedure/Predicates";
import type { Env } from "bun";
import { Environment, is_environment } from "./definition/Environment";
import { apply } from "./Apply";
import { Closure } from "./definition/Closure";

export const advance = construct_simple_generic_procedure("advance", 1, 
    (expr: LispElement) => {
       return expr 
    }
)

export const evaluate = construct_simple_generic_procedure("evaluate",
    2, default_eval
)

function default_eval(expression: LispElement, env: Environment){
    const isApplication = (expr: LispElement): boolean => {
        return expr instanceof List && expr.length() > 2
    }

    const operator = (expr: LispElement): LispElement => {
        let list = expr as List
        return list.get_element(0)
    }

    const operands = (expr: LispElement): LispElement => {
        let list = expr as List 
        return list.slice(1, list.length())
    }

    if (isApplication(expression)){
        apply(
            advance(evaluate(operator(expression), env)),
            operands(expression) as List,
            env)
    }
    else{
       throw Error("unknown expression type" + expression.toString() ) 
    }
}

function make_application(operator: LispElement, operands: List): LispElement{
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
    match_args(is_quoted, is_environment),
    (expr, env) => {
        if ((expr as List).length() != 2){
            throw Error("quote must be followed by exactly one argument, expr: " + expr.toString())
        }
        return (expr as List).get_element(1)
    }
)

function is_tagged_list(expr: LispElement, tag: string): boolean{
    const list = expr as List 
    return list.length() > 0 && unwrapAtom(list.get_element(0)) === tag
}

function is_quoted(expr: LispElement): boolean{
    return is_tagged_list(expr, "quote")
}


define_generic_procedure_handler(evaluate,
    match_args(is_if, is_environment),
    (expr, env) => {
        if (advance(evaluate(if_predicate(expr), env))) {
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
    if (expr instanceof List && (expr as List).length() == 4){
        return (expr as List).get_element(1)
    }
    else{
        throw Error("if must be followed by exactly three arguments, expr: " + expr.toString())
    }
}

function if_consequent(expr: LispElement): LispElement{
    if (expr instanceof List && (expr as List).length() == 4){
        return (expr as List).get_element(2)
    }
    else{
        throw Error("if must be followed by exactly three arguments, expr: " + expr.toString())
    }
}

function if_alternative(expr: LispElement): LispElement{
    if (expr instanceof List && (expr as List).length() == 4){
        return (expr as List).get_element(3)
    }
    else{
        throw Error("if must be followed by exactly three arguments, expr: " + expr.toString())
    }
}

function make_if(predicate: LispElement, consequent: LispElement, alternative: LispElement): LispElement{
    return new List([new LSymbol("if"), predicate, consequent, alternative])
}

define_generic_procedure_handler(evaluate,
    match_args(is_lambda, is_environment),
    (expr, env) => {
        const parameters = lambda_parameters(expr) as List
        const body = lambda_body(expr)

        if (parameters instanceof List){
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
    if (expr instanceof List && (expr as List).length() > 2){
        return (expr as List).get_element(1)
    }
    else{
        throw Error("lambda must be followed by exactly two arguments, expr: " + expr.toString())
    }
}

// to fix with begin
function lambda_body(expr: LispElement): LispElement{
    if (expr instanceof List && (expr as List).length() > 2){
        const full_body = (expr as List).get_element(2)
        return sequence_to_begin(full_body)
    }
    else{
        throw Error("lambda must be followed by exactly two arguments, expr: " + expr.toString())
    }
}

// to fix with begin
function make_lambda(parameters: LispElement, body: LispElement): LispElement{
    return new List([new LSymbol("lambda"), parameters, flatten_begin(body)])
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
    if (seq instanceof List && (seq as List).length() > 0){
        return (seq as List)
    }
    else if (seq instanceof List && (seq as List).length() == 1){
        return (seq as List).get_element(0)
    }
    else{
        const seq_list = seq as List 
        return make_begin(seq_list.map(flatten_begin))
    }
}

function make_compound_procedure(parameters: List, body: LispElement, env: Environment): LispElement{
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

function cond_clauses(expr: LispElement): LispElement{
    if (expr instanceof List && (expr as List).length() > 1){
        return (expr as List).slice(1, (expr as List).length())
    }
    else{
        throw Error("cond must be followed by at least one clause")
    }
}

function cond_clause_predicate(clause: LispElement): LispElement{
    if (clause instanceof List && (clause as List).length() > 1){
        return (clause as List).get_element(0)
    }
    else{
        throw Error("clause must be a list of exactly two elements")
    }
}

function cond_clause_consequent(clause: LispElement): LispElement{
    if (clause instanceof List && (clause as List).length() > 1){
        return sequence_to_begin((clause as List).get_element(1))
    }
    else{
        throw Error("clause must be a list of exactly two elements")
    }
}

function is_else_clause(clause: LispElement): boolean{
    return is_tagged_list(clause, "else")
}

function cond_to_if(cond_expr: LispElement): LispElement{
    function expand(clauses: LispElement): LispElement{
        if (clauses instanceof List && (clauses as List).length() == 0){
            throw Error("COND: no value matched" + cond_expr.toString())
        }
        else if (is_else_clause(clauses)){
            if ((clauses as List).length() != 2){
                throw Error("else clause must be followed by exactly one argument, expr: " + clauses.toString())
            }
            return cond_clause_consequent(clauses)
        }
        else{
            return make_if(cond_clause_predicate(clauses), cond_clause_consequent(clauses), expand(clauses))
        }
    }
    return expand(cond_clauses(cond_expr))
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

function let_bound_variables(let_expr: LispElement): List{
    if (let_expr instanceof List && (let_expr as List).length() == 3){
        const let_exprs = (let_expr as List).get_element(1) as List 
        return let_exprs.map((expr: LispElement) => {
            return (expr as List).get_element(0)
        })
    }
    else{
        throw Error("let must be followed by exactly two arguments, expr: " + let_expr.toString())
    }
}

function let_bound_values(let_expr: LispElement): List{
    if (let_expr instanceof List && (let_expr as List).length() == 3){
        const let_exprs = (let_expr as List).get_element(2) as List 
        return let_exprs.map((expr: LispElement) => {
            return (expr as List).get_element(1)
        })
    }
    else{
        throw Error("let must be followed by exactly two arguments, expr: " + let_expr.toString())
    }
}

function let_body(let_expr: LispElement): LispElement{
    if (let_expr instanceof List && (let_expr as List).length() == 3){
        return sequence_to_begin((let_expr as List).get_element(2))
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
        if (begin_expr instanceof List){
            return evaluate_sequence(begin_expr as List, env)
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
    return (expr as List).slice(1, (expr as List).length())
}

function make_begin(actions: List): LispElement{
    return actions.unshift(new LSymbol("begin"))
}

function evaluate_sequence(actions: List, environment: Environment): LispElement{
    if (actions.length() == 0){
        throw Error("empty sequence" + actions.getString())
    }
    if (actions.length() == 1){
        return evaluate(actions.get_element(0), environment)
    }
    else{
        evaluate(actions.get_element(0), environment)
        return evaluate_sequence(actions.slice(1, actions.length()), environment)
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
    if (expr instanceof List && (expr as List).length() == 2){
        return (expr as List).get_element(0).toString()
    }
    else{
        throw Error("assignment must be followed by exactly two arguments, expr: " + expr.toString())
    }
}

function assignment_value(expr: LispElement): LispElement{
    if (expr instanceof List && (expr as List).length() == 2){
        return (expr as List).get_element(1)
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
    return expr instanceof List && (expr as List).length() > 1
}

function definition_variable(expr: LispElement): string{
    const l = (expr as List).get_element(1)
    if (has_variable(l)){
        return (l as List).get_element(0).toString()
    }
    else if (l instanceof LSymbol){
        return l.toString()
    }
    else{
        throw Error("definition must be followed by a variable, expr: " + expr.toString())
    }
}

function definition_value(expr: LispElement): LispElement{
   const l = (expr as List).get_element(1)
   if (has_variable(l)){
    return make_lambda(l, (expr as List).get_element(2))
   }
   else{
    return (expr as List).get_element(2)
   }
}