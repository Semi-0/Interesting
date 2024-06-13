import { generic_procedure } from '../tools/GenericHandler';

describe('generic_procedure', () => {
    let gp: generic_procedure;
    const defaultHandler = jest.fn(args => "default response");

    beforeEach(() => {
        gp = new generic_procedure(1, defaultHandler);
    });

    test('should execute default handler if no specific handler matches', () => {
        const result = gp.execute([42]);
        expect(defaultHandler).toHaveBeenCalledWith([42]);
        expect(result).toBe("default response");
    });

    test('should execute specific handler when predicate matches', () => {
        const specificHandler = jest.fn(args => "specific response");
        const predicate = jest.fn(args => args[0] === 42);
        gp.define_handler(predicate, specificHandler);

        const result = gp.execute([42]);
        expect(predicate).toHaveBeenCalledWith([42]);
        expect(specificHandler).toHaveBeenCalledWith([42]);
        expect(result).toBe("specific response");
    });

}
);