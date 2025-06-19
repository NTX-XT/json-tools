import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

/**
 * Generate Schema Function
 * 
 * Analyzes a JSON string and generates a comprehensive JSON schema definition.
 * Understands nested objects, arrays, and primitive types.
 * 
 * @param {HttpRequest} request - HTTP request containing a JSON string to analyze and optional parameters (treatAllAsStrings, treatAllAsRequired)
 * @param {InvocationContext} context - Function execution context
 * @returns {HttpResponseInit} - HTTP response with the generated JSON schema
 */
export async function GenerateSchema(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Generate Schema request for url "${request.url}"`);

    try {
        // Get the request body
        const requestBody = await request.text();
        
        if (!requestBody) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Request body is required. Please provide a JSON string to analyze." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        
        // Get the optional treatAllAsStrings parameter (defaults to true)
        // const treatAllAsStrings = requestData.treatAllAsStrings !== undefined ? requestData.treatAllAsStrings : true;
        const treatAllAsStrings = true
        // Get the optional treatAllAsRequired parameter (defaults to false)
        //const treatAllAsRequired = requestData.treatAllAsRequired !== undefined ? requestData.treatAllAsRequired : false;
        const treatAllAsRequired = false
        //context.log(`requestData: ${requestData}`);          // Parse the JSON string to analyze
        let jsonToAnalyze;
        try {
            jsonToAnalyze = JSON.parse(requestBody);
            // If the parsed JSON has a 'sample' property, use that as the JSON to analyze
            if (jsonToAnalyze.sample) {
                // If sample is a string, parse it again; if it's already an object, use it directly
                if (typeof jsonToAnalyze.sample === 'string') {
                    jsonToAnalyze = JSON.parse(jsonToAnalyze.sample);
                } else {
                    jsonToAnalyze = jsonToAnalyze.sample;
                }
            }
        } catch (parseError) {
            context.log(`JSON analysis error: ${parseError.message}`);
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Invalid JSON string. Unable to analyze." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };        }// Generate schema from the parsed JSON
        const schema = generateSchemaFromObject(jsonToAnalyze, treatAllAsStrings, treatAllAsRequired);
        
        // Wrap schema in the expected format
        const response = {
            schema: schema
        };
        
        context.log(`Successfully generated schema for JSON`);
        
        return {
            status: 200,
            body: JSON.stringify(response, null, 2),
            headers: {
                'Content-Type': 'application/json'
            }
        };

    } catch (error) {
        context.log(`Error processing request: ${error.message}`);
        return {
            status: 500,
            body: JSON.stringify({ 
                error: "Internal server error occurred while generating schema." 
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
}

/**
 * Generate JSON schema from a JavaScript object with enhanced property metadata
 */
function generateSchemaFromObject(obj: any, treatAllAsStrings: boolean = true, treatAllAsRequired: boolean = false): any {
    if (obj === null) {
        return { type: "null" };
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return {
                type: "array",
                items: { type: "string" }
            };
        }
        
        // Analyze first item to determine array item type
        const itemSchema = generateSchemaFromObject(obj[0], treatAllAsStrings, treatAllAsRequired);
        return {
            type: "array",
            items: itemSchema
        };
    }

    const type = typeof obj;

    switch (type) {
        case "string":
            return { type: "string" };
        case "number":
            return { type: treatAllAsStrings ? "string" : "number" };
        case "boolean":
            return { type: treatAllAsStrings ? "string" : "boolean" };
        case "object":
            const properties: any = {};
            const required: string[] = [];

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const propertySchema = generateSchemaFromObject(obj[key], treatAllAsStrings, treatAllAsRequired);
                    
                    // For primitive types, enhance with metadata
                    if (propertySchema.type && !propertySchema.properties && !propertySchema.items) {
                        properties[key] = {
                            name: key,
                            title: key,
                            description: null,
                            readonly: false,
                            type: propertySchema.type
                        };
                    } else {
                        // For complex types (objects, arrays), keep the original structure
                        properties[key] = propertySchema;
                    }
                    
                    if (treatAllAsRequired) {
                        required.push(key);
                    }
                }
            }

            return {
                type: "object",
                properties: properties,
                required: treatAllAsRequired && required.length > 0 ? required : undefined
            };
        default:
            return { type: "string" };
    }
}

app.http('GenerateSchema', {
    methods: ['POST'],
    authLevel: 'admin',
    route: 'generate-schema',
    handler: GenerateSchema
});
