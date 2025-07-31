/**
 * Obtém o token CSRF do meta tag
 */
export function getCSRFToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    console.log('CSRF Token:', token);
    return token;
}

/**
 * Recarrega o token CSRF fazendo uma requisição para obter um novo token
 */
export async function refreshCSRFToken(): Promise<string> {
    try {
        console.log('Recarregando token CSRF...');
        const response = await fetch('/api/csrf-token', {
            method: 'GET',
            credentials: 'same-origin',
        });
        
        if (response.ok) {
            const data = await response.json();
            const newToken = data.token;
            
            // Atualizar o meta tag
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', newToken);
            }
            
            console.log('Token CSRF recarregado:', newToken);
            return newToken;
        }
    } catch (error) {
        console.error('Erro ao recarregar token CSRF:', error);
    }
    
    // Fallback para o token atual
    return getCSRFToken();
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
    console.log('Setting up CSRF interceptor...');
    setupCSRF();
    console.log('CSRF interceptor setup complete');
}
