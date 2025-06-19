import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as fs from 'fs';
import * as path from 'path';

export async function SwaggerJson(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Swagger JSON request for url "${request.url}"`);

    try {
        // Read the swagger.json file
        const swaggerPath = path.join(process.cwd(), 'swagger.json');
        
        try {
            const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
            const swaggerSpec = JSON.parse(swaggerContent);
            
            // Update the host to match the current request
            const hostHeader = request.headers.get('host');
            if (hostHeader) {
                swaggerSpec.host = hostHeader;
            }
              // Update schemes to only allow HTTPS for security
            const protocol = request.headers.get('x-forwarded-proto') || 
                           (request.url.startsWith('https') ? 'https' : 'http');
            
            // Force HTTPS only for security
            swaggerSpec.schemes = ['https'];
            
            return {
                status: 200,
                body: JSON.stringify(swaggerSpec, null, 2),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            };
            
        } catch (fileError) {
            context.log(`Error reading swagger.json: ${fileError.message}`);
            return {
                status: 404,
                body: JSON.stringify({ 
                    error: "Swagger specification not found. Please ensure swagger.json exists in the root directory." 
                }),
                headers: { 'Content-Type': 'application/json' }
            };
        }

    } catch (error) {
        context.log(`Error serving Swagger JSON: ${error.message}`);
        return {
            status: 500,
            body: JSON.stringify({ 
                error: "Internal server error occurred while serving Swagger specification" 
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
}

app.http('SwaggerJson', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'swagger.json',
    handler: SwaggerJson
});