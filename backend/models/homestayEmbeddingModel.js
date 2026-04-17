import mongoose from 'mongoose';
 

const homestayEmbeddingSchema = new mongoose.Schema({
 
  homestayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homestay',
    required: true,
    unique: true
  },
 
  // 384 numbers representing the full meaning of the homestay
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) { return v.length === 384; },
      message: 'Embedding must have exactly 384 dimensions'
    }
  },
 
  // Text that was embedded — for debugging
  sourceText: {
    type: String,
    required: true
  },
 
  modelVersion: {
    type: String,
    default: 'all-MiniLM-L6-v2'
  },
 
  generatedAt: {
    type: Date,
    default: Date.now
  }
 
}, { timestamps: true });
 
homestayEmbeddingSchema.index({ homestayId: 1 });
 
const HomestayEmbedding = mongoose.model('HomestayEmbedding', homestayEmbeddingSchema);
export default HomestayEmbedding;