import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function Deserialize(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Get the request body
        const requestBody = await request.text();
        
        if (!requestBody) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Request body is required. Please provide parameters for deserialization." 
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

        // Validate that the 'value' parameter is provided
        if (!requestData.value) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Missing required parameter 'value'. Please provide a JSON string to deserialize." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Deserialize the JSON string to an object
        let deserializedObject;
        try {
            deserializedObject = JSON.parse(requestData.value);
        } catch (parseError) {
            context.log(`JSON deserialization error: ${parseError.message}`);
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Invalid JSON string in 'value' parameter. Unable to deserialize." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        
        context.log(`Successfully deserialized JSON string`);
        
        return {
            status: 200,
            body: JSON.stringify(deserializedObject),
            headers: {
                'Content-Type': 'application/json'
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

app.http('Deserialize', {
    methods: ['POST'],
    authLevel: 'admin',
    route: 'deserialize',
    handler: Deserialize
});
