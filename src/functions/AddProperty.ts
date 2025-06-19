import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

/**
 * AddProperty Function
 * 
 * Adds a property to a serialized JSON string and returns the modified JSON string.
 * This function takes a JSON string, a property name, and a value, then adds the property
 * to the JSON object and returns the updated JSON string.
 * 
 * @param {HttpRequest} request - HTTP request containing json, key, and value in the body
 * @param {InvocationContext} context - Function execution context
 * @returns {HttpResponseInit} - HTTP response with the modified JSON string (Content-Type: text/plain)
 */
export async function AddProperty(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Get the request body
        const requestBody = await request.text();
        
        if (!requestBody) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Request body is required. Please provide 'json', 'key', and 'value' properties." 
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
                    error: "Invalid JSON in request body. Please provide valid JSON with 'json', 'key', and 'value' properties." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Validate required properties
        if (!requestData.json) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Missing 'json' property. Please provide a JSON string to modify." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        if (!requestData.key) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Missing 'key' property. Please provide the name of the property to add." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        if (requestData.value === undefined || requestData.value === null) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Missing 'value' property. Please provide the value for the property to add." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Validate types
        if (typeof requestData.json !== 'string') {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Property 'json' must be a string containing valid JSON." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        if (typeof requestData.key !== 'string') {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Property 'key' must be a string." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        if (typeof requestData.value !== 'string') {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Property 'value' must be a string." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Parse the JSON string
        let jsonObject;
        try {
            jsonObject = JSON.parse(requestData.json);
        } catch (parseError) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Invalid JSON in 'json' property. Please provide a valid JSON string." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Ensure the parsed JSON is an object (not array or primitive)
        if (typeof jsonObject !== 'object' || jsonObject === null || Array.isArray(jsonObject)) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "The 'json' property must contain a valid JSON object, not an array or primitive value." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Parse the value - attempt to parse as JSON first, otherwise treat as string
        let parsedValue;
        try {
            parsedValue = JSON.parse(requestData.value);
        } catch {
            // If JSON parsing fails, treat as a literal string
            parsedValue = requestData.value;
        }

        // Add the property to the object
        const modifiedObject = { ...jsonObject };
        modifiedObject[requestData.key] = parsedValue;

        // Return the modified JSON string
        const resultString = JSON.stringify(modifiedObject);
        
        return {
            status: 200,
            body: resultString,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        };

    } catch (error) {
        context.error('Error in AddProperty function:', error);
        
        return {
            status: 500,
            body: JSON.stringify({ 
                error: "Internal server error occurred while adding property to JSON.",
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
}

app.http('AddProperty', {
    methods: ['POST'],
    authLevel: 'admin',
    route: 'add-property',
    handler: AddProperty
});
