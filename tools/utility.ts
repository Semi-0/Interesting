export function guard(condition: boolean, else_branch: () => void): void {
    if (condition) {
        return
    } else {
        else_branch()
    }
}

export function deepCopy<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        const arrCopy = [] as any[];
        for (const item of obj) {
            arrCopy.push(deepCopy(item));
        }
        return arrCopy as unknown as T;
    }

    const objCopy = {} as { [key: string]: any };
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            objCopy[key] = deepCopy((obj as { [key: string]: any })[key]);
        }
    }
    return objCopy as T;
}

export function deepCompare(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
        return true;
    }

    if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return false;
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!keys2.includes(key) || !deepCompare(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}


// Example usage
const original = { a: 1, b: { c: 2 } };


export function summarize_dict(dict: any, value_string: (value: any) => string): string{
    return Object.entries(dict).map(([key, value]) => `${key}: ${value_string(value)}`)
    .join(", ")
}

interface FileValidationOptions {
    requiredExtension?: string;
    caseSensitive?: boolean;
    allowedExtensions?: string[];
}

export function validateFile(filePath: string, options: FileValidationOptions = {}): boolean {
    const {
        requiredExtension = '.interesting',
        caseSensitive = false,
        allowedExtensions = ['.interesting']
    } = options;

    // Basic path validation
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path');
    }

    // Get the file extension
    const fileExt = filePath.slice(filePath.lastIndexOf('.'));
    
    // Compare extensions based on case sensitivity
    const compare = (a: string, b: string): boolean => caseSensitive 
        ? a === b 
        : a.toLowerCase() === b.toLowerCase();

    // Check if extension is in allowed list
    const isValidExt = allowedExtensions.some(ext => 
        compare(fileExt, ext.startsWith('.') ? ext : `.${ext}`)
    );

    if (!isValidExt) {
        throw new Error(
            `Invalid file type. File must end with: ${allowedExtensions.join(', ')}`
        );
    }

    return true;
}

export async function loadFile(filePath: string, options: FileValidationOptions = {}): Promise<string> {
    // Validate file before attempting to load
    validateFile(filePath, options);

    try {
        if (typeof process !== 'undefined' && process.versions?.node) {
            const { readFile } = await import('fs/promises');
            return await readFile(filePath, 'utf-8');
        } else {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        }
    } catch (error) {
        throw new Error(`Failed to load file: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export function loadFileSync(filePath: string, options: FileValidationOptions = {}): string {
    // Validate file before attempting to load
    validateFile(filePath, options);

    try {
        if (typeof process !== 'undefined' && process.versions?.node) {
            const fs = require('fs');
            return fs.readFileSync(filePath, 'utf-8');
        } else {
            throw new Error('Synchronous file loading is only available in Node.js environment');
        }
    } catch (error) {
        throw new Error(`Failed to load file: ${error instanceof Error ? error.message : String(error)}`);
    }
}