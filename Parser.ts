
import { pipe } from "effect"
import type { LispElement } from "./definition/LispElement"

function tokenizer(input: string) : string[]{
    let tokens : string[] = []
    let current_token : string = ""
    for (const char of input) {
        if (char === '(' || char === ')') {
            if (current_token !== "") {
                tokens.push(current_token);
                current_token = "";
            }
            tokens.push(char);
        } else if (char === " ") {
           if (current_token !== ""){
                console.log("pushing token: " + current_token)
                tokens.push(current_token)
                current_token = ""
           } else{
                current_token += char
           }
        }
        else{
            current_token += char
        }
    }
    
    return tokens
}


// function parseTokens(tokens: string[]): LispElement {
// }


let expression = "(add 2 (sub 1 3)) (lambda (x) (add x 2))  "
pipe(
    tokenizer(expression),
    console.log
)

