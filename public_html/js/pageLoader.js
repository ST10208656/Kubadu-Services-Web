/**
 * Utility function to load HTML pages and inject them into the DOM for testing
 * @param {string} pageName - Name of the HTML file to load
 * @returns {Promise<void>}
 */
export async function loadPage(pageName) {
    try {
        const response = await fetch(`/public_html/${pageName}`);
        const html = await response.text();
        document.body.innerHTML = html;
    } catch (error) {
        console.error(`Failed to load page ${pageName}:`, error);
        throw error;
    }
}
