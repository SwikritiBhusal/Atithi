
import natural from 'natural'; 

// TF-IDF for text embeddings
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// GENERATE TEXT EMBEDDING using TF-IDF
export async function generateEmbedding(text) {
  // Clean and tokenize text
  const cleanText = text.toLowerCase().trim();
  const tokens = tokenizer.tokenize(cleanText);

  // Create TF-IDF instance
  const tfidf = new TfIdf();
  tfidf.addDocument(cleanText);

  // Get term frequencies
  const embedding = {};
  tokens.forEach(token => {
    const tf = tfidf.tfidf(token, 0);
    if (tf > 0) {
      embedding[token] = tf;
    }
  });

  return embedding;
}

//  CALCULATE COSINE SIMILARITY between two embeddings
export function cosineSimilarity(embedding1, embedding2) {
  // Get all unique terms
  const allTerms = new Set([
    ...Object.keys(embedding1),
    ...Object.keys(embedding2)
  ]);

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  allTerms.forEach(term => {
    const val1 = embedding1[term] || 0;
    const val2 = embedding2[term] || 0;

    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

// ALTERNATIVE: Simple word overlap similarity (faster but less accurate)
export function wordOverlapSimilarity(text1, text2) {
  const tokens1 = new Set(tokenizer.tokenize(text1.toLowerCase()));
  const tokens2 = new Set(tokenizer.tokenize(text2.toLowerCase()));

  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
}

//  EXTRACT KEYWORDS from text
export function extractKeywords(text, topN = 10) {
  const tfidf = new TfIdf();
  tfidf.addDocument(text.toLowerCase());

  const keywords = [];
  tfidf.listTerms(0).slice(0, topN).forEach(item => {
    keywords.push({ term: item.term, score: item.tfidf });
  });

  return keywords;
}

//  SENTIMENT ANALYSIS (for reviews)
export function analyzeSentiment(text) {
  const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
  const tokens = tokenizer.tokenize(text);
  const score = analyzer.getSentiment(tokens);

  // Convert to 0-100 scale
  const normalizedScore = ((score + 5) / 10) * 100;

  return {
    score: normalizedScore,
    sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
  };
}