const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');

    if (!fs.existsSync(envPath)) {
        return;
    }

    const envLines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    envLines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            return;
        }

        const separatorIndex = trimmed.indexOf('=');
        if (separatorIndex === -1) {
            return;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();

        if (!process.env[key]) {
            process.env[key] = value;
        }
    });
}

loadEnvFile();

const PORT = Number(process.env.PORT) || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || '';
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || '';
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
};

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    response.end(JSON.stringify(payload));
}

function sendFile(response, filePath) {
    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            sendJson(response, 404, { message: 'File not found.' });
            return;
        }

        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content);
    });
}

function isSafePath(requestPath) {
    const resolvedPath = path.normalize(path.join(PUBLIC_DIR, requestPath));
    return resolvedPath.startsWith(PUBLIC_DIR);
}

function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';

        request.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 1_000_000) {
                reject(new Error('Request body too large.'));
                request.destroy();
            }
        });

        request.on('end', () => resolve(body));
        request.on('error', reject);
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function validateContactPayload(payload) {
    const trimmed = {
        name: String(payload.name || '').trim(),
        email: String(payload.email || '').trim(),
        subject: String(payload.subject || '').trim(),
        message: String(payload.message || '').trim()
    };
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (trimmed.name.length < 2) {
        return { error: 'Please enter your name.', trimmed };
    }
    if (!emailPattern.test(trimmed.email)) {
        return { error: 'Please enter a valid email address.', trimmed };
    }
    if (trimmed.subject.length < 3) {
        return { error: 'Please enter a subject.', trimmed };
    }
    if (trimmed.message.length < 10) {
        return { error: 'Please enter a longer message.', trimmed };
    }

    return { error: '', trimmed };
}

async function sendContactEmail({ name, email, subject, message }) {
    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
        throw new Error('Email configuration is missing.');
    }

    const text = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        'Message:',
        message
    ].join('\n');

    const html = `
        <h2>New portfolio contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: CONTACT_FROM_EMAIL,
            to: [CONTACT_TO_EMAIL],
            reply_to: email,
            subject: `Portfolio Contact: ${subject}`,
            text,
            html
        })
    });

    if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        throw new Error(`Resend error: ${errorText}`);
    }
}

const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === 'POST' && requestUrl.pathname === '/api/contact') {
        try {
            const body = await readRequestBody(request);
            const payload = JSON.parse(body);
            const { error, trimmed } = validateContactPayload(payload);

            if (error) {
                sendJson(response, 400, { message: error });
                return;
            }

            await sendContactEmail(trimmed);
            sendJson(response, 200, { message: 'Message sent successfully.' });
        } catch (error) {
            console.error(error);
            sendJson(response, 500, {
                message: 'Sorry, your message could not be sent right now.'
            });
        }
        return;
    }

    if (request.method !== 'GET') {
        sendJson(response, 405, { message: 'Method not allowed.' });
        return;
    }

    const requestPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;

    if (!isSafePath(requestPath)) {
        sendJson(response, 403, { message: 'Forbidden.' });
        return;
    }

    sendFile(response, path.join(PUBLIC_DIR, requestPath));
});

server.listen(PORT, () => {
    console.log(`Portfolio server running at http://localhost:${PORT}`);
});
