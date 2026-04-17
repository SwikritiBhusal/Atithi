import upload from '../Middleware/upload.js';
import express from 'express';
import userAuth from '../Middleware/auth.middleware.js';

import {
  submitHomestay,
  getAllHomestays,
  getHomestayById,
  getPendingHomestays,
  approveHomestay,
  rejectHomestay,
  getApprovedHomestays,
  getMyHomestay,
  getHomestayAvailability,
  updateHomestay,
  addReview,getUniqueFacilities,regenerateAllEmbeddings,checkExistingHomestay
} from '../Controller/homestayController.js';

const router = express.Router();

// submit
router.post(
  '/submit',
  upload.fields([
    { name: 'citizenshipFiles', maxCount: 2 },
    { name: 'tourismRegistration', maxCount: 1 },
    { name: 'homestayPhotos', maxCount: 10 },  
  { name: 'ownerPhoto', maxCount: 1 }  
  ]),
  submitHomestay
);

// admin
router.get('/all', getAllHomestays);
router.get('/pending', getPendingHomestays);

// GET: Get approved homestays for public listings
router.get('/approved', getApprovedHomestays);

// GET: Get availability for selected dates
router.get('/:id/availability', getHomestayAvailability);

// approve/reject by admin
router.put('/approve/:id', approveHomestay);
router.put('/reject/:id', rejectHomestay);

// GET: Get host's own homestay
router.get('/my-homestay/:userId', getMyHomestay);

router.get('/unique-facilities', getUniqueFacilities);

// GET: Get homestay by ID (admin)
router.get('/:id', getHomestayById);

// POST: Add or update review for homestay
router.post('/:id/review', userAuth, addReview);

// PUT: Update homestay (host edit)
router.put(
  '/update/:id',
  upload.fields([{ name: 'homestayPhotos', maxCount: 10 }]),
  updateHomestay
);

router.post('/regenerate-embeddings', regenerateAllEmbeddings);

router.get('/check-existing/:userId', checkExistingHomestay);

// router.get('/status-by-email', async (req, res) => {
//   try {
//     const { email } = req.query;
//     const homestay = await Homestay.findOne({ email }).sort({ createdAt: -1 });
//     if (!homestay) {
//       return res.json({ success: false, message: 'No homestay found' });
//     }
//     return res.json({ success: true, status: homestay.status });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// });

export default router;
