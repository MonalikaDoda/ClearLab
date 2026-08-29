import dotenv from 'dotenv';

dotenv.config();

const buildReminderPrompt = ({ patientName, totalAmount, amountPaid, amountPending, reminderCount }) => {
  const formattedTotal = Number(totalAmount).toFixed(2);
  const formattedPaid = Number(amountPaid).toFixed(2);
  const formattedPending = Number(amountPending).toFixed(2);

  let toneInstruction = '';

  if (amountPaid === 0 && reminderCount === 1) {
    toneInstruction = 'This is the first reminder, so keep it gentle, polite, and professional. Mention the full amount due without sounding harsh.';
  } else if (amountPaid > 0 && amountPaid < totalAmount) {
    toneInstruction = 'Acknowledge the partial payment already made and politely ask for the remaining balance without sounding pushy.';
  } else if (reminderCount >= 2) {
    toneInstruction = 'This is a follow-up reminder, so make the tone firmer and more urgent, but remain respectful and polite.';
  } else {
    toneInstruction = 'Keep the message brief, warm, and professional.';
  }

  return `Write a short payment reminder message for a patient named ${patientName}. The total amount due is $${formattedTotal}, the patient has paid $${formattedPaid}, and the remaining amount pending is $${formattedPending}. ${toneInstruction} Keep it to 2-4 sentences, easy to understand, and suitable for a healthcare billing context. Do not include extra formatting or bullets. Just return the message text.`;
};

const extractOpenRouterMessage = (payload) => {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => (typeof part === 'string' ? part : part?.text || ''))
      .join('');

    return text.trim();
  }

  return null;
};

const extractGeminiMessage = (payload) => {
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('')
    .trim();

  return text || null;
};

const callOpenRouter = async (prompt) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const message = extractOpenRouterMessage(data);

    if (!message) {
      throw new Error('OpenRouter response did not include message text');
    }

    return { message, generatedBy: 'openrouter' };
  } finally {
    clearTimeout(timeoutId);
  }
};

const callGemini = async (prompt) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }],
        }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const message = extractGeminiMessage(data);

  if (!message) {
    throw new Error('Gemini response did not include message text');
  }

  return { message, generatedBy: 'gemini' };
};

export const generateReminderMessage = async ({
  patientName,
  totalAmount,
  amountPaid,
  reminderCount,
}) => {
  try {
    const safeTotalAmount = Number(totalAmount) || 0;
    const safeAmountPaid = Number(amountPaid) || 0;
    const safeReminderCount = Number(reminderCount) || 1;
    const amountPending = safeTotalAmount - safeAmountPaid;

    const prompt = buildReminderPrompt({
      patientName: String(patientName || 'Patient'),
      totalAmount: safeTotalAmount,
      amountPaid: safeAmountPaid,
      amountPending,
      reminderCount: safeReminderCount,
    });

    try {
      const result = await callOpenRouter(prompt);
      return result;
    } catch (error) {
      const fallback = await callGemini(prompt);
      return fallback;
    }
  } catch (error) {
    return {
      message: null,
      generatedBy: null,
      error: true,
    };
  }
};

export default {
  generateReminderMessage,
};
