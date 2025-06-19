import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

/**
 * Join Function
 * 
 * Joins two JSON strings into a single object and returns a JSON string.
 * This function takes two JSON objects as strings and combines them into one object.
 * If both objects have the same property, the second object's value will override the first.
 * 
 * @param {HttpRequest} request - HTTP request containing first and second JSON strings in the body
 * @param {InvocationContext} context - Function execution context
 * @returns {HttpResponseInit} - HTTP response with the joined result as JSON string (Content-Type: text/plain)
 */
export async function Join(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Get the request body
        const requestBody = await request.text();
        
        if (!requestBody) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Request body is required. Please provide 'first' and 'second' JSON strings to join." 
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
                    error: "Invalid JSON in request body. Please provide valid JSON with 'first' and 'second' properties." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Extract first and second JSON strings
        const { first, second } = requestData;

        // Validate that we have at least one JSON string to work with
        if (!first && !second) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "At least one of 'first' or 'second' properties must be provided." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Parse first JSON string
        let firstObject = {};
        if (first) {
            if (typeof first !== 'string') {
                return {
                    status: 400,
                    body: JSON.stringify({ 
                        error: "Property 'first' must be a JSON string." 
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }

            try {
                firstObject = JSON.parse(first);
                if (typeof firstObject !== 'object' || firstObject === null || Array.isArray(firstObject)) {
                    return {
                        status: 400,
                        body: JSON.stringify({ 
                            error: "Property 'first' must be a valid JSON object string, not an array or primitive value." 
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                }
            } catch (parseError) {
                return {
                    status: 400,
                    body: JSON.stringify({ 
                        error: "Invalid JSON in 'first' property. Please provide a valid JSON object string." 
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
        }

        // Parse second JSON string
        let secondObject = {};
        if (second) {
            if (typeof second !== 'string') {
                return {
                    status: 400,
                    body: JSON.stringify({ 
                        error: "Property 'second' must be a JSON string." 
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }

            try {
                secondObject = JSON.parse(second);
                if (typeof secondObject !== 'object' || secondObject === null || Array.isArray(secondObject)) {
                    return {
                        status: 400,
                        body: JSON.stringify({ 
                            error: "Property 'second' must be a valid JSON object string, not an array or primitive value." 
                        }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                }
            } catch (parseError) {
                return {
                    status: 400,
                    body: JSON.stringify({ 
                        error: "Invalid JSON in 'second' property. Please provide a valid JSON object string." 
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
            }
        }

        // Join the objects - second object properties override first object properties
        const joinedObject = { ...firstObject, ...secondObject };

        // Return the joined result as JSON string
        const resultString = JSON.stringify(joinedObject);
        
        return {
            status: 200,
            body: resultString,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        };

    } catch (error) {
        context.error('Error in Join function:', error);
        
        return {
            status: 500,
            body: JSON.stringify({ 
                error: "Internal server error occurred while joining JSON objects.",
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
}

app.http('Join', {
    methods: ['POST'],
    authLevel: 'admin',
    route: 'join',
    handler: Join
});
