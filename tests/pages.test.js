/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';

// Mock loadPage function since we can't use fetch in tests
async function loadPage(pageName) {
    const filePath = path.join(process.cwd(), 'public_html', pageName);
    const html = fs.readFileSync(filePath, 'utf8');
    document.body.innerHTML = html;
}

describe('Page Loading and Navigation', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Home Page', () => {
        beforeEach(async () => {
            await loadPage('home.html');
        });

        test('loads navigation menu', () => {
            const nav = document.querySelector('nav');
            expect(nav).toBeTruthy();
            expect(nav.querySelectorAll('a').length).toBeGreaterThan(0);
        });

        test('displays services section', () => {
            const services = document.querySelectorAll('.service-link');
            expect(services.length).toBeGreaterThan(0);
        });
    });

    describe('About Us Page', () => {
        beforeEach(async () => {
            await loadPage('about_us.html');
        });

        test('displays company information', () => {
            const header = document.querySelector('header h1');
            expect(header.textContent).toContain('Kubadu');
        });

        test('shows footer information', () => {
            const footer = document.querySelector('footer');
            expect(footer.textContent).toContain('Kubadu Services');
        });
    });

    describe('Policies Page', () => {
        beforeEach(async () => {
            await loadPage('Policies.html');
        });

        test('has main content section', () => {
            const main = document.querySelector('main');
            expect(main).toBeTruthy();
        });

        test('shows footer', () => {
            const footer = document.querySelector('footer');
            expect(footer).toBeTruthy();
        });
    });

    describe('Request History Page', () => {
        beforeEach(async () => {
            await loadPage('requestHistory.html');
        });

        test('has header with company name', () => {
            const header = document.querySelector('header h1');
            expect(header).toBeTruthy();
            expect(header.textContent).toContain('Kubadu Services');
        });

        test('has container', () => {
            const container = document.querySelector('.container');
            expect(container).toBeTruthy();
        });
    });

    describe('Funeral Policy Page', () => {
        beforeEach(async () => {
            await loadPage('funeral_policy.html');
        });

        test('has container with form', () => {
            const container = document.querySelector('.container');
            expect(container).toBeTruthy();
            const form = container.querySelector('form');
            expect(form).toBeTruthy();
        });

        test('has policy application title', () => {
            const title = document.querySelector('h2');
            expect(title).toBeTruthy();
            expect(title.textContent).toContain('Funeral Policy Application');
        });
    });

    describe('Inquiries Page', () => {
        beforeEach(async () => {
            await loadPage('inquiries.html');
        });

        test('has main content section', () => {
            const main = document.querySelector('main');
            expect(main).toBeTruthy();
        });

        test('has navigation', () => {
            const nav = document.querySelector('nav');
            expect(nav).toBeTruthy();
        });
    });
});
