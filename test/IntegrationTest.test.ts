import { main } from '../Repl';
import { Environment } from '../definition/Environment';

describe('REPL Functionality', () => {
    test('evaluates simple arithmetic expressions', () => {
        expect(main('(+ 1 2 3)', new Environment())[0]).toEqual(6);
        expect(main('(* 2 3 4)', new Environment())[0]).toEqual(24);
        expect(main('(- 10 5 1)', new Environment())[0]).toEqual(4);
        expect(main('(/ 20 2 2)', new Environment())[0]).toEqual(5);
    });

    test('evaluates complex expressions', () => {
        const complexExpr = '(let ((x 2) (y 3)) (* x y))';
        expect(main(complexExpr, new Environment())[0]).toEqual(6);
    });

    test('handles undefined functions', () => {
        const input = '(sqrt 9)';
        expect(() => main(input, new Environment())).toThrow('unbound variable: LSymbol(sqrt)');
    });

    test('evaluates boolean expressions', () => {
        expect(main('(if (> 2 1) #t #f)', new Environment())[0]).toEqual(true);
        expect(main('(if (< 2 1) #t #f)', new Environment())[0]).toEqual(false);
    });

    test('evaluates lambda expressions', () => {
        const lambdaExpr = '((lambda (x) (+ x 1)) 5)';
        expect(main(lambdaExpr, new Environment())[0]).toEqual(6);
    });

    test('handles variable definitions', () => {
        const defineExpr = '(define x 42)';
        const env = new Environment()
        main(defineExpr, env); // Define x in the environment
        expect(main('x', env)[0]).toEqual(42); // Retrieve x
    });

    test('handles errors for unbound variables', () => {
        const unboundVar = 'y';
        expect(() => main(unboundVar, new Environment())).toThrow('unbound variable');
    });

    test('evaluates cond expressions', () => {
        const condExpr = '(cond (((> 3 2) 1) ((< 3 2) 2) (else 3)))';
        expect(main(condExpr, new Environment())[0]).toEqual(1);
    });

    test('evaluates begin expressions', () => {
        const beginExpr = '(begin (define x 10) (+ x 1))';
        const env = new Environment();
        expect(main(beginExpr, env)[0]).toEqual(11);
    });

    test('handles set! expressions', () => {
        const setExpr = '(begin (define x 10) (set! x 20) x)';
        const env = new Environment();
        expect(main(setExpr, env)[0]).toEqual(20);
    });

    // test('evaluates quoted expressions', () => {
    //     expect(main("(quote (1 2 3))", new Environment())[0]).toEqual([1, 2, 3]);
    // });
});