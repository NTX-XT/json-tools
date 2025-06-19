import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function SwaggerUI(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Swagger UI request for url "${request.url}"`);

    // Adjust the URL if your swagger.json is served elsewhere
    const swaggerJsonUrl = "/api/swagger.json";
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Swagger UI</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
        <script>
        window.onload = function() {
            SwaggerUIBundle({
                url: '${swaggerJsonUrl}',
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "StandaloneLayout"
            });
        };
        </script>
    </body>
    </html>
    `;
    return {
        status: 200,
        headers: { "Content-Type": "text/html" },
        body: html
    };
}

app.http('SwaggerUI', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'swagger',
    handler: SwaggerUI
});