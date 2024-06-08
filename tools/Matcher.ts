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

type matcher_callback =  (data: string[], dictionary: MatchDict, succeed: (dictionary: MatchDict, nEaten: number) => any) => any
// needs more precise error handler

export function match_eqv(pattern_constant: MatchConstant): matcher_callback {
    return (data: string[], dictionary: MatchDict, succeed: (dictionary: MatchDict, nEaten: number) => any): any => {
        if (data.length === 0) {
            return false;
        }
        if (data[0] === pattern_constant.name) {
            return succeed(dictionary, 1);
        } else {
            return false;
        }
    };
}

export class MatchElement implements MatchItem{
    public readonly name: string;
    constructor(_name: string) {
        this.name = _name;
    }
}

export function match_element(variable: MatchElement): matcher_callback {
    return (data: string[], dictionary: MatchDict, succeed: (dictionary: MatchDict, nEaten: number) => any): any => {
        if (data.length === 0) {
            return false;
        }
        const binding_value = dictionary.get(variable.name);
        if (binding_value === undefined) {
            const extendedDictionary = dictionary.extend(variable.name, data[0]);
            return succeed(extendedDictionary, 1);
        } else if (binding_value === data[0]) {
            return succeed(dictionary, 1);
        } else {
            return false;
        }
    };
}

export class MatchSegment implements MatchItem{
    public readonly name: string;
    constructor(_name: string) {
        this.name = _name;
    }
}


export function match_segment(variable: MatchSegment): matcher_callback {
    const loop = (index: number, data: string[], dictionary: MatchDict, succeed: (dictionary: MatchDict, nEaten: number) => any): any => {
        if (index >= data.length) {
            return false;
        }
        const result = succeed(dictionary.extend(variable.name, data.slice(0, index + 1)), index + 1);
        return result !== false ? result : loop(index + 1, data, dictionary, succeed);
    };

    const match_segment_equal = (data: string[], value: string[], ok: (i: number) => any): any => {
        for (let i = 0; i < data.length; i++) {
            if (data[i] !== value[i]) {
                return false;
            }
        }
        return ok(data.length);
    };

    return (data: string[], dictionary: MatchDict, succeed: (dictionary: MatchDict, nEaten: number) => any): any => {
        if (data.length === 0) {
            return false;
        }

        const binding = dictionary.get(variable.name);
        if (binding === undefined) {
            return loop(0, data, dictionary, succeed);
        } else {
            return match_segment_equal(data, binding, (i) => succeed(dictionary, i));
        }
    };
}


export function match_list(matchers: matcher_callback[]) : matcher_callback {
    return (data: string[], dictionary: MatchDict, succeed: (dictionary: MatchDict, nEaten: number) => any): any => {
        const loop = (data_index: number, matcher_index: number, dictionary: MatchDict): any => {
            if (matcher_index < matchers.length){
                const matcher = matchers[matcher_index] 
                const result = matcher(data.slice(data_index), dictionary, (new_dict, nEaten) => loop(data_index + nEaten, matcher_index + 1, new_dict))
                return result
            } 
            else if (data_index < data.length){
               return false  
            } 
            else if (data_index >= data.length){
                return succeed(dictionary, data_index)
            }
            else {
                return false
            }
        };

        if (data.length === 0) {
            return false;
        }
        return loop(0, 0, dictionary)
    };
}

