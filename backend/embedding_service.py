from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import numpy as np
 
app = Flask(__name__)
 
print("Loading AI model... (first run downloads ~90MB)")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded! Service ready.")
 
 
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model": "all-MiniLM-L6-v2"})
 
 
@app.route('/embed', methods=['POST'])
def embed():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' field"}), 400
 
    text = data['text'].strip()
    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400
 
    embedding = model.encode(text, normalize_embeddings=True)
    return jsonify({
        "embedding": embedding.tolist(),
        "dimensions": len(embedding)
    })
 
 
if __name__ == '__main__':
    print("\nAtithi Embedding Service running at http://localhost:8000")
    print("Keep this terminal open alongside your Node server.\n")
    app.run(host='0.0.0.0', port=8000, debug=False)
 