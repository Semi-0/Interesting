
export function guard(condition: boolean, else_branch: () => void): void {
    if (condition) {
        return
    } else {
        else_branch()
    }
}


export function isArray<T>(x: any): x is Array<T> {
    return Array.isArray(x)
}


