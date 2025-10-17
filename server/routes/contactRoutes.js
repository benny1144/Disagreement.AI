// server/routes/contactRoutes.js

import express from 'express';
import fetch from 'node-fetch';
import { notifyTeam } from '../controllers/contactController.js'

const router = express.Router();

// Behavior toggles and logging controls
const STRICT = String(process.env.N8N_CONTACT_WEBHOOK_STRICT || '').toLowerCase() === 'true';
const AUTOFALLBACK = String(process.env.N8N_CONTACT_WEBHOOK_AUTOFALLBACK || 'true').toLowerCase() !== 'false';
const WARN_INTERVAL_MS = Number(process.env.CONTACT_WEBHOOK_WARN_INTERVAL_MS || 60000);
const DEFAULT_MODE = String(process.env.N8N_CONTACT_DEFAULT_MODE || '').toLowerCase(); // 'test' to force using /webhook-test in dev
let lastWarnAt = 0;

function warnDebounced(message) {
    const now = Date.now();
    if (now - lastWarnAt > WARN_INTERVAL_MS) {
        console.warn(message);
        lastWarnAt = now;
    }
}

function toTestUrlIfNeeded(url) {
    try {
        if (!url) return url;
        if (DEFAULT_MODE === 'test' && url.includes('/webhook/') && !url.includes('/webhook-test/')) {
            return url.replace('/webhook/', '/webhook-test/');
        }
        return url;
    } catch (_) {
        return url;
    }
}

// Defines the endpoint at POST /api/contact
router.post('/contact', notifyTeam, async (req, res) => {
    const { fullName, email, message } = req.body;

    // Webhook URL from env if provided; otherwise fallback to the new, clean URL.
    const N8N_WEBHOOK_URL = process.env.N8N_CONTACT_WEBHOOK_URL || 'https://disagreementai.app.n8n.cloud/webhook/contact-form-submissions';
    const EFFECTIVE_URL = toTestUrlIfNeeded(N8N_WEBHOOK_URL);

    // Basic validation to ensure we have data
    if (!fullName || !email || !message) {
        return res.status(400).json({ success: false, message: 'Missing form data.' });
    }

    const attempts = [];

    try {
        // Forward the data to your n8n workflow (effective URL may be test or prod based on env)
        const response = await fetch(EFFECTIVE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, message }),
        });

        // If success on primary URL
        if (response.ok) {
            return res.status(200).json({ success: true, message: 'Form submitted successfully.' });
        }

        attempts.push(`${EFFECTIVE_URL} -> ${response.status}`);

        // If primary URL failed, consider auto-fallback to test webhook (non-strict only)
        const is404 = response.status === 404;
        const isProdWebhook = typeof EFFECTIVE_URL === 'string' && EFFECTIVE_URL.includes('/webhook/') && !EFFECTIVE_URL.includes('/webhook-test/');
        if (!STRICT && AUTOFALLBACK && is404) {
            const explicitTestUrl = process.env.N8N_CONTACT_WEBHOOK_TEST_URL;
            const candidates = [];
            if (explicitTestUrl) candidates.push(explicitTestUrl);
            if (isProdWebhook) candidates.push(EFFECTIVE_URL.replace('/webhook/', '/webhook-test/'));

            for (const testUrl of candidates) {
                try {
                    const retry = await fetch(testUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fullName, email, message, _meta: { source: 'contact-form', mode: 'autofallback', attempted: testUrl } }),
                    });
                    if (retry.ok) {
                        warnDebounced(`[contact] Primary webhook 404 at ${EFFECTIVE_URL}. Retried fallback successfully at: ${testUrl}. If you want production runs, activate the workflow so /webhook works, or set N8N_CONTACT_DEFAULT_MODE=test (or N8N_CONTACT_WEBHOOK_URL to the /webhook-test URL) while testing (and click "Execute Workflow" in n8n).`);
                        return res.status(200).json({ success: true, message: 'Form submitted successfully (fallback webhook).' });
                    } else {
                        attempts.push(`${testUrl} -> ${retry.status}`);
                    }
                } catch (e) {
                    attempts.push(`${testUrl} -> network_error`);
                }
            }
        }

        // If STRICT, fail fast; otherwise accept and warn (debounced)
        if (STRICT) {
            console.error(`[contact] n8n webhook responded ${response.status} (STRICT=true). Returning error to client.`);
            return res.status(502).json({ success: false, message: 'Upstream contact webhook error.', status: response.status });
        }
        const tried = attempts.length ? ` Tried: ${attempts.join(' | ')}` : '';
        warnDebounced(`[contact] n8n webhook responded ${response.status}. Proceeding with 202 Accepted.${tried} Fix: Activate the workflow for /webhook, or use /webhook-test and press "Execute Workflow" in n8n before submitting. You can also set N8N_CONTACT_WEBHOOK_TEST_URL to override the fallback.`);
        return res.status(202).json({ success: true, message: 'Form received. Thank you!' });
    } catch (error) {
        if (STRICT) {
            console.error('[contact] Error submitting contact form (STRICT=true):', error);
            return res.status(502).json({ success: false, message: 'Upstream contact webhook error.' });
        }
        warnDebounced('[contact] Error submitting contact form to n8n. Proceeding with 202 Accepted.');
        return res.status(202).json({ success: true, message: 'Form received. Thank you!' });
    }
});

// Diagnostics endpoint to check webhook statuses quickly
router.get('/contact/diagnostics', async (req, res) => {
    const prodUrl = process.env.N8N_CONTACT_WEBHOOK_URL || 'https://disagreementai.app.n8n.cloud/webhook/contact-form-submissions';
    const testUrl = (process.env.N8N_CONTACT_WEBHOOK_TEST_URL) || (prodUrl.includes('/webhook/') ? prodUrl.replace('/webhook/', '/webhook-test/') : undefined);
    const effective = toTestUrlIfNeeded(prodUrl);

    const results = { effective, prodUrl, testUrl, STRICT, AUTOFALLBACK, DEFAULT_MODE };
    const payload = { ping: true, _meta: { source: 'diagnostics' } };

    async function probe(url) {
        if (!url) return { status: 'n/a' };
        try {
            const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            return { status: r.status };
        } catch (e) {
            return { status: 'network_error' };
        }
    }

    results.prod = await probe(prodUrl);
    results.test = await probe(testUrl);

    return res.status(200).json(results);
});

export default router;