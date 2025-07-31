/**
 * Obtém o token CSRF do meta tag
 */
export function getCSRFToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

/**
 * Configura o token CSRF para todas as requisições fetch
 */
export function setupCSRF() {
    // Intercepta todas as requisições fetch para adicionar o CSRF token
    const originalFetch = window.fetch;

    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
        // Se não há init, cria um objeto vazio
        const options = init || {};

        // Se não há headers, cria um objeto vazio
        const headers = options.headers || {};

        // Adiciona o CSRF token se não estiver presente
        const token = getCSRFToken();
        if (token) {
            if (typeof headers === 'object' && !Array.isArray(headers)) {
                const headersObj = headers as Record<string, string>;
                if (!headersObj['X-CSRF-TOKEN'] && !headersObj['x-csrf-token']) {
                    headersObj['X-CSRF-TOKEN'] = token;
                }
            } else {
                // Se headers é um Headers object ou array, cria um novo objeto
                const newHeaders = new Headers(headers);
                if (!newHeaders.has('X-CSRF-TOKEN') && !newHeaders.has('x-csrf-token')) {
                    newHeaders.set('X-CSRF-TOKEN', token);
                    options.headers = newHeaders;
                }
            }
        }

        return originalFetch.call(this, input, options);
    };
}

// Configura automaticamente quando o módulo é carregado
if (typeof window !== 'undefined') {
    setupCSRF();
}
