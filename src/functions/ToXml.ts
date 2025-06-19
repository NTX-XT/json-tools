import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

/**
 * ToXml Function
 * 
 * Converts a JSON string to XML format with optional encoding.
 * This function takes a JSON string and transforms it into XML structure,
 * making it compatible with XML-based systems and workflows.
 * 
 * @param {HttpRequest} request - HTTP request containing serializedJson and optional encode flag in the body
 * @param {InvocationContext} context - Function execution context
 * @returns {HttpResponseInit} - HTTP response with the XML string (Content-Type: text/plain)
 */
export async function ToXml(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // Get the request body
        const requestBody = await request.text();
        
        if (!requestBody) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Request body is required. Please provide 'serializedJson' property." 
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
                    error: "Invalid JSON in request body. Please provide valid JSON with 'serializedJson' property." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Validate required properties
        if (!requestData.serializedJson) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Missing 'serializedJson' property. Please provide a JSON string to convert to XML." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        if (typeof requestData.serializedJson !== 'string') {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Property 'serializedJson' must be a string containing valid JSON." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Parse the JSON string to ensure it's valid
        let jsonObject;
        try {
            jsonObject = JSON.parse(requestData.serializedJson);
        } catch (parseError) {
            return {
                status: 400,
                body: JSON.stringify({ 
                    error: "Invalid JSON in 'serializedJson' property. Please provide a valid JSON string." 
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }

        // Get the encode flag (defaults to false)
        const encode = requestData.encode === true;

        // Convert JSON to XML
        const xmlString = jsonToXml(jsonObject);

        // Apply encoding if requested
        const result = encode ? encodeXml(xmlString) : xmlString;
        
        return {
            status: 200,
            body: result,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            }
        };

    } catch (error) {
        context.error('Error in ToXml function:', error);
        
        return {
            status: 500,
            body: JSON.stringify({ 
                error: "Internal server error occurred while converting JSON to XML.",
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
}

/**
 * Converts a JSON object to XML string
 * @param obj - The JSON object to convert
 * @param rootElement - The root element name (defaults to 'root')
 * @returns XML string representation
 */
function jsonToXml(obj: any, rootElement: string = 'root'): string {
    if (obj === null) {
        return `<${rootElement}></${rootElement}>`;
    }

    if (typeof obj !== 'object') {
        // For primitive values, wrap in root element
        return `<${rootElement}>${escapeXml(String(obj))}</${rootElement}>`;
    }

    if (Array.isArray(obj)) {
        // For arrays, create multiple elements or a wrapper
        if (obj.length === 0) {
            return `<${rootElement}></${rootElement}>`;
        }
        
        // Create wrapper element for array
        const items = obj.map((item, index) => 
            jsonToXml(item, 'item')
        ).join('');
        
        return `<${rootElement}>${items}</${rootElement}>`;
    }

    // For objects
    const elements = Object.entries(obj).map(([key, value]) => {
        const sanitizedKey = sanitizeElementName(key);
        
        if (value === null) {
            return `<${sanitizedKey}></${sanitizedKey}>`;
        }
        
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return `<${sanitizedKey}></${sanitizedKey}>`;
                }
                const arrayItems = value.map(item => 
                    jsonToXml(item, 'item')
                ).join('');
                return `<${sanitizedKey}>${arrayItems}</${sanitizedKey}>`;
            } else {
                const nestedXml = Object.entries(value).map(([nestedKey, nestedValue]) => 
                    jsonToXml(nestedValue, sanitizeElementName(nestedKey))
                ).join('');
                return `<${sanitizedKey}>${nestedXml}</${sanitizedKey}>`;
            }
        }
        
        return `<${sanitizedKey}>${escapeXml(String(value))}</${sanitizedKey}>`;
    }).join('');

    if (rootElement === 'root') {
        return elements;
    }
    
    return `<${rootElement}>${elements}</${rootElement}>`;
}

/**
 * Escapes XML special characters
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Sanitizes element names to be valid XML
 * @param name - Element name to sanitize
 * @returns Sanitized element name
 */
function sanitizeElementName(name: string): string {
    // Remove invalid characters and ensure it starts with a letter or underscore
    let sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Ensure it starts with a letter or underscore
    if (!/^[a-zA-Z_]/.test(sanitized)) {
        sanitized = '_' + sanitized;
    }
    
    return sanitized || '_element';
}

/**
 * Encodes XML for safe transmission
 * @param xml - XML string to encode
 * @returns Encoded XML string
 */
function encodeXml(xml: string): string {
    return encodeURIComponent(xml);
}

app.http('ToXml', {
    methods: ['POST'],
    authLevel: 'admin',
    route: 'to-xml',
    handler: ToXml
});
