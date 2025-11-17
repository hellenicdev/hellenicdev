// netlify/functions/search.js
import fetch from 'node-fetch';

export async function handler(event, context) {
  const query = event.queryStringParameters.q;
  if (!query) return { statusCode: 400, body: 'Missing query parameter' };

  const apiKey = process.env.GOOGLE_API_KEY; // from environment vars
  const cx = process.env.GOOGLE_CSE_ID;

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
