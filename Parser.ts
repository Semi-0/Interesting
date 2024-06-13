import { Parser, charCode, oneOf, skipMany1, space, seq, char, many, noneOf, parse, State, choice, letter, digit, fmap, many1, sepBy } from "parse-combinator"
import  { LString, LNumber, LSymbol, LBoolean, type LispElement, List } from "./definition/LispElement"
import * as util from 'util';

const symbol = oneOf("!#$%&|*+-/:<=>?@^_~\"")
const full_space = oneOf("\t\r\n ")
const spaces = skipMany1(full_space)

const parseString = seq(m =>{
    m(char('"'));
    const x = m(many(
        noneOf("\"")
    ));
    m(char('"'));
    if (x == undefined){
        return x
    }
    else{
        return new LString(x.join(""))
    }
})

const parseBoolean = seq(m => {
    const first = m(char("#"));
    const rest = m(choice([
        char("t"),
        char("f"),
    ]))
    return rest === "t" ? new LBoolean(true) : new LBoolean(false)
})

const parseAtom = seq(m =>{
   const all = m(many1(choice([
    letter,
    symbol,
    digit
   ])))
   if (all == undefined){
    return all
   }
   else{
    return new LSymbol(all.join(""))
   }
})

const parseNumber : Parser<LispElement> = fmap(x => new LNumber(Number(x.join(""))), many1(digit))

const parseQuoted : Parser<LispElement> = seq(m => {
    m(char("'"));
    const x = m(parseExpr);
    return new List([ new LSymbol("quote"), x])
})

const parseList : Parser<LispElement> = seq(m => {
    m(char("("));
    const x = m(sepBy(parseExpr, spaces));
    m(char(")"));
    return new List(x)
})


const parseExpr: Parser<LispElement> = choice([
    parseAtom,
    parseNumber,
    parseString,
    parseQuoted,
    parseList
])




const test = parse(parseExpr, new State("(lambda (x) (+ 1 2))"))
console.log(util.inspect(test, {showHidden: true, depth: 8}))