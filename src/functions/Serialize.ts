import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

/**
 * Serialize Function
 * 
 * Converts a JavaScript object to its JSON string representation.
 * 
 * @param {HttpRequest} request - HTTP request containing an object to serialize in the body
 * @param {InvocationContext} context - Function execution context
 * @returns {HttpResponseInit} - HTTP response with the serialized JSON string (Content-Type: text/plain)
 */
export async function Serialize(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Get the request body
        const requestBody = await request.text();
        
        if (!requestBody) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Request body is required. Please provide an object to serialize." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Parse the request body to get the parameters
        let requestData;
        try {
            requestData = JSON.parse(requestBody);
        } catch (parseError) {
            context.log(`JSON parsing error: ${parseError.message}`);
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Invalid JSON format in request body." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Validate that the 'object' parameter is provided
        if (!requestData.object) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Missing required parameter 'object'. Please provide an object to serialize." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Serialize the object to a JSON string
        const serializedJson = JSON.stringify(requestData.object);
        
        context.log(`Successfully serialized object`);
        
        return {
            status: 200,
            body: serializedJson,
            headers: {
                'Content-Type': 'text/plain'
            }
        };

    } catch (error) {
        context.log(`Error processing request: ${error.message}`);
        return {
            status: 500,
            body: JSON.stringify({ 
                error: "Internal server error occurred while processing the request." 
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};

app.http('Serialize', {
    methods: ['POST'],
    authLevel: 'admin',
    route: 'serialize',
    handler: Serialize
});
