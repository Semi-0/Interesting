import { PrimitiveFunctions } from '../definition/PrimitiveFunction';

describe('PrimitiveFunctions', () => {
    let pf: PrimitiveFunctions;

    beforeEach(() => {
        pf = new PrimitiveFunctions();
    });

    test('adds numbers correctly', () => {
        expect(pf.applyFunction('+', 1, 2, 3)).toBe(6);
    });

    test('multiplies numbers correctly', () => {
        expect(pf.applyFunction('*', 2, 3, 4)).toBe(24);
    });

    test('subtracts numbers correctly', () => {
        expect(pf.applyFunction('-', 10, 5, 1)).toBe(4);
    });

    test('divides numbers correctly', () => {
        expect(pf.applyFunction('/', 20, 2, 2)).toBe(5);
    });

    test('throws error for undefined function', () => {
        expect(() => pf.applyFunction('sqrt', 9)).toThrow('No primitive function named \'sqrt\' found.');
    });
});