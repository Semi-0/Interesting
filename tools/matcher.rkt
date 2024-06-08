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


(define (match:list matchers)
  (define (list-match data dictionary succeed)
    (and (pair? data)
         (let lp ((data-list (car data))
                  (matchers matchers)
                  (dictionary dictionary))
           (cond ((pair? matchers)
                  ((car matchers) data-list dictionary
                   (lambda (new-dictionary n)
                     ;; The essence of list matching:
                     (lp (list-tail data-list n) (cdr matchers) new-dictionary))))
                 ((pair? data-list) #f) ; unmatched data
                 ((null? data-list) (succeed dictionary 1))
                 (else #f))))))
