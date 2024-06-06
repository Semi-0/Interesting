export class MatchResult{
    public readonly success: boolean;
    public readonly dictionary: MatchDict;
    public readonly nEaten: number;

    constructor(public readonly _success: boolean, 
        public readonly _dictionary: MatchDict, 
        public readonly _nEaten: number) {
            this.success = _success;
            this.dictionary = _dictionary;
            this.nEaten = _nEaten;
        }
    
    public operation(callback: (...args: any[]) => any) : any{
         const keys = Array.from(this.dictionary.dict.keys())
         const values = keys.map((key) => this.dictionary.dict.get(key))
         return callback(...values)
    }

    public do(callback: (...args: any[]) => any) : any{
        // short for operation
        return this.operation(callback)
    }
}


export class MatchDict{
    public readonly dict: Map<string, any>;
    constructor(_dict: Map<string, any>) {
        this.dict = _dict;
    }

    public extend(key: string, value: any): MatchDict {
        const new_dict = new Map(this.dict);
        new_dict.set(key, value);
        return new MatchDict(new_dict);
    } 

    public get(key: string): any {
        return this.dict.get(key);
    }
}

export function emptyMatchDict(): MatchDict {
    return new MatchDict(new Map());
}

export interface MatchItem{
    name: string;
}

export class MatchConstant implements MatchItem{
    public readonly name: string;
    constructor(_name: string) {
        this.name = _name;
    }
}

export class MatchElement implements MatchItem{
    public readonly name: string;
    constructor(_name: string) {
        this.name = _name;
    }
}

export class MatchSegment implements MatchItem{
    public readonly name: string;
    constructor(_name: string) {
        this.name = _name;
    }
}

export function match_eqv(pattern_constant: MatchConstant): (data: string[], dictionary: MatchDict) => MatchResult {
    function e_match(data: string[], dictionary: MatchDict): MatchResult {
        if (data.length == 0) {
            return new MatchResult(false, emptyMatchDict(), 0);
        }
        if (data[0] === pattern_constant.name) {
            return new MatchResult(true, dictionary, 1);
        } else {
            return new MatchResult(false, emptyMatchDict(), 0);
        }
    }
    return e_match;
}

// function x_matcher(data: string[], dictionary: MatchDict): MatchResult {
//     return match_eqv(new MatchConstant("x"))(data, dictionary);
// }

// console.log(x_matcher(["x"], new MatchDict(new Map())))
// console.log(x_matcher(["y", "x"], new MatchDict(new Map())))

export function match_element(variable: MatchElement): (data: string[], dictionary: MatchDict) => MatchResult {
    function e_match(data: string[], dictionary: MatchDict): MatchResult {
        if (data.length == 0) {
            return new MatchResult(false, emptyMatchDict(), 0);
        }
        const binding_value = dictionary.get(variable.name);
        if (binding_value === undefined) {
            dictionary = dictionary.extend(variable.name, data[0]);
            return new MatchResult(true, dictionary, 1);
        }
        else if (binding_value === data[0]) {
            return new MatchResult(true, dictionary, 1);
        } else {
            return new MatchResult(false, emptyMatchDict(), 0);
        }
    }
    return e_match;
}




// console.log(match_element(new MatchElement("x"))(["a"], new MatchDict(new Map())))

// console.log(match_element(new MatchElement("x"))(["b", "a"], new MatchDict(new Map())))

