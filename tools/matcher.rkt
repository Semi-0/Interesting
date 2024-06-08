(define (match:segment variable)
    (define (segment-match data dictionary succeed)
        (and (list? data)
            (let ((binding (match:lookup variable dictionary)))
                (if binding 
                (match:segment-equal? data 
                (match:binding-value binding) 
                (lambda (n) (succeed dictionary n)))
                    (let ((n (length data)))
                    (let lp ((i 0))
                      (and (<= i n)
                       (or (succeed (match:extend-dict variable (list-head data i) dictionary) i)
                       (lp (+ i 1))))))))))
    segment-match)


(define (match:segment-equal? data value ok)
    (let lp ((data data)
            (value value)
            (n 0))
        (cond ((pair? value)
            (if (and (pair? data)
                      (equal? (car data) (car value))) 
                      (lp (cdr data) (cdr value) (+ n 1))
                      #f)
            ((null? value) (ok n))
            (else #f)))))
)

