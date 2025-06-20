import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

/**
 * Merge Function
 * 
 * Merges data with an existing template object and returns the result as a serialized JSON string.
 * This function takes a template (JSON string or plain text) and data (JSON string) and merges them together.
 * 
 * @param {HttpRequest} request - HTTP request containing template and data in the body
 * @param {InvocationContext} context - Function execution context
 * @returns {HttpResponseInit} - HTTP response with the merged result as JSON string (Content-Type: text/plain)
 */
export async function Merge(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Get the request body
        const requestBody = await request.text();
        
        if (!requestBody) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Request body is required. Please provide template and data to merge." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        let requestData;
        try {
            requestData = JSON.parse(requestBody);
        } catch (parseError) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Invalid JSON in request body. Please provide valid JSON with 'template' and 'data' properties." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Validate required properties
        if (!requestData.template) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Missing 'template' property. Please provide a template object or string." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        if (!requestData.data) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Missing 'data' property. Please provide data to merge with the template." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Parse template - can be JSON string or plain text
        let template;
        if (typeof requestData.template === 'string') {
            try {
                // Try to parse as JSON first
                template = JSON.parse(requestData.template);
            } catch {
                // If parsing fails, treat as plain text template
                template = requestData.template;
            }
        } else {
            template = requestData.template;
        }

        // Parse data - should be JSON string
        let data;
        if (typeof requestData.data === 'string') {
            try {
                data = JSON.parse(requestData.data);
            } catch (parseError) {
                return {
                    status: 400,
                    body: JSON.stringify({ 
                        error: "Invalid JSON in 'data' property. Data must be a valid JSON string." 
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
        } else {
            data = requestData.data;
        }        // Perform the merge
        let result;
        if (typeof template === 'string') {
            // Template is plain text - perform string replacement
            result = performStringTemplateReplacement(template, data);
        } else if (typeof template === 'object' && template !== null) {
            // Template is an object - check if it's field substitution or object merge
            if (isFieldSubstitutionTemplate(template, data)) {
                // Perform field substitution (mail-merge)
                result = performFieldSubstitution(template, data);
            } else {
                // Perform traditional object merge
                result = mergeObjects(template, data);
            }
        } else {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Template must be either a JSON object or a string." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Return the merged result as JSON string
        const resultString = typeof result === 'string' ? result : JSON.stringify(result);
        
        return {
            status: 200,
            body: resultString,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        };

    } catch (error) {
        context.error('Error in Merge function:', error);
        
        return {
            status: 500,
            body: JSON.stringify({ 
                error: "Internal server error occurred while merging data.",
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
}

/**
 * Performs string template replacement using data values
 * Replaces {{key}} placeholders with corresponding data values
 */
function performStringTemplateReplacement(template: string, data: any): string {
    let result = template;
    
    // Handle nested object paths with dot notation
    const replacePlaceholder = (obj: any, path: string): string => {
        const keys = path.split('.');
        let value = obj;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return `{{${path}}}`; // Return original placeholder if path not found
            }
        }
        
        return value !== null && value !== undefined ? String(value) : '';
    };
    
    // Replace {{key}} and {{key.nested.path}} patterns
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        return replacePlaceholder(data, trimmedKey);
    });
    
    return result;
}

/**
 * Deep merges two objects, with data values overriding template values
 */
function mergeObjects(template: any, data: any): any {
    if (typeof template !== 'object' || template === null) {
        return data !== undefined ? data : template;
    }
    
    if (typeof data !== 'object' || data === null) {
        return template;
    }
    
    const result = { ...template };
    
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (typeof result[key] === 'object' && result[key] !== null && 
                typeof data[key] === 'object' && data[key] !== null && 
                !Array.isArray(result[key]) && !Array.isArray(data[key])) {
                // Recursively merge nested objects
                result[key] = mergeObjects(result[key], data[key]);
            } else {
                // Override with data value
                result[key] = data[key];
            }
        }
    }
    
    return result;
}

/**
 * Determines if the template should use field substitution instead of object merging
 * Field substitution is used when template values are strings that match keys in the data object
 */
function isFieldSubstitutionTemplate(template: any, data: any): boolean {
    if (typeof template !== 'object' || template === null || 
        typeof data !== 'object' || data === null) {
        return false;
    }
    
    // Check if most template values are strings that exist as keys in data
    const templateValues = Object.values(template);
    const dataKeys = Object.keys(data);
    let matchingKeys = 0;
    let nonEmptyStringValues = 0;
    
    for (const value of templateValues) {
        if (typeof value === 'string' && value.trim() !== '') {
            nonEmptyStringValues++;
            if (dataKeys.includes(value)) {
                matchingKeys++;
            }
        }
    }
    
    // If at least 50% of non-empty string values in template are keys in data, 
    // assume this is field substitution
    return nonEmptyStringValues > 0 && (matchingKeys / nonEmptyStringValues) >= 0.5;
}

/**
 * Performs field substitution (mail-merge) operation
 * Replaces template field values with corresponding data values when the template value is a key in data
 */
function performFieldSubstitution(template: any, data: any): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(template)) {
        if (typeof value === 'string' && value.trim() !== '' && data.hasOwnProperty(value)) {
            // Template value is a key in data - substitute with data value
            result[key] = data[value];
        } else {
            // Keep original template value (handles empty strings, non-matching keys, etc.)
            result[key] = value;
        }
    }
    
    return result;
}

app.http('Merge', {
    methods: ['POST'],
    authLevel: 'admin',
    route: 'merge',
    handler: Merge
});
