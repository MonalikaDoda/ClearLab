import test from 'node:test';
import assert from 'node:assert/strict';

import Invoice from '../models/Invoice.js';
import { generateReminder } from '../controllers/invoiceController.js';
import { generateReminderMessage } from '../services/aiService.js';
import invoiceRoutes from '../routes/invoices.js';

test('Invoice schema includes reminderCount and reminder route is registered', () => {
  assert.ok(Invoice.schema.paths.reminderCount, 'reminderCount field should exist on Invoice schema');
  assert.equal(Invoice.schema.paths.reminderCount.defaultValue, 0, 'reminderCount should default to 0');

  const routes = invoiceRoutes.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }));

  assert.ok(routes.some((route) => route.path === '/:id/reminder' && route.methods.includes('post')),
    'POST /:id/reminder route should be registered');
  assert.equal(typeof generateReminder, 'function', 'generateReminder controller should be exported');
});

test('returns a user-facing busy message when all AI providers fail', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('timeout');
  };

  try {
    const result = await generateReminderMessage({
      patientName: 'Jane Doe',
      totalAmount: 100,
      amountPaid: 25,
      reminderCount: 1,
    });

    assert.equal(
      result.message,
      'The AI service is temporarily unavailable. Please try again in a moment.'
    );
    assert.equal(result.generatedBy, null);
  } finally {
    global.fetch = originalFetch;
  }
});
