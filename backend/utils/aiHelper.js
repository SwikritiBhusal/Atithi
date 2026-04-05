/**
 * aiHelper.js
 * -----------
 * Calls the local Python embedding service.
 * Make sure embedding_service.py is running in another terminal.
 */

const PYTHON_SERVICE = 'http://localhost:8000';

// Convert text to 384-dimension vector
export async function generateEmbedding(text) {
  try {
    const response = await fetch(`${PYTHON_SERVICE}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.toLowerCase().trim() })
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding; // array of 384 numbers

  } catch (error) {
    console.error('generateEmbedding failed:', error.message);
    console.error('Is Python service running? → python embedding_service.py');
    throw error;
  }
}

// Compare two vectors — returns 0.0 to 1.0
// Works because Python service normalizes embeddings
export function cosineSimilarity(embedding1, embedding2) {
  if (!Array.isArray(embedding1) || !Array.isArray(embedding2)) {
    throw new Error('Both embeddings must be arrays');
  }
  if (embedding1.length !== embedding2.length) {
    throw new Error(`Dimension mismatch: ${embedding1.length} vs ${embedding2.length}`);
  }

  let dot = 0;
  for (let i = 0; i < embedding1.length; i++) {
    dot += embedding1[i] * embedding2[i];
  }
  return Math.min(Math.max(dot, 0), 1);
}

// Check if Python service is up — call on server start
export async function checkEmbeddingService() {
  try {
    const response = await fetch(`${PYTHON_SERVICE}/health`);
    const data = await response.json();
    console.log('Embedding service running:', data.model);
    return true;
  } catch {
    console.error('Embedding service NOT running! Start with: python embedding_service.py');
    return false;
  }
}