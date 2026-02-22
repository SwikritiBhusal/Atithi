import upload from '../Middleware/upload.js';
import express from 'express';

import {
  submitHomestay,
  getAllHomestays,
  getHomestayById,
  getPendingHomestays,
  approveHomestay,
  rejectHomestay,
  getApprovedHomestays,
  getMyHomestay, 
  updateHomestay
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

// approve/reject by admin
router.put('/approve/:id', approveHomestay);
router.put('/reject/:id', rejectHomestay);

// GET: Get homestay by ID (admin)
router.get('/:id', getHomestayById);

// GET: Get host's own homestay
router.get('/my-homestay/:userId', getMyHomestay);

// PUT: Update homestay (host edit)
router.put('/update/:id', updateHomestay);


export default router;