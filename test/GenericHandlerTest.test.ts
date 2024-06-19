import { simple_generic_procedure, define_generic_procedure_handler } from '../tools/GenericProcedure/GenericProcedure';

describe('generic_procedure', () => {
 
    const defaultHandler = jest.fn(args => "default response");

    const testFunc = simple_generic_procedure("testFunc", 1, defaultHandler)
    

    // beforeEach(() => {

    test('should execute default handler if no specific handler matches', () => {
       
        const result = testFunc(42);
        expect(defaultHandler).toHaveBeenCalledWith(42);
        expect(result).toBe("default response");
    });

    test('should execute specific handler when predicate matches', () => {
        const specificHandler = jest.fn((...args) => "specific response");
        const predicate = jest.fn((...args) => args[0] === 42);
        define_generic_procedure_handler(testFunc, predicate, specificHandler);

        const result = testFunc(42);
        expect(predicate).toHaveBeenCalledWith(42);
        expect(specificHandler).toHaveBeenCalledWith(42);
        expect(result).toBe("specific response");
    });

}
);