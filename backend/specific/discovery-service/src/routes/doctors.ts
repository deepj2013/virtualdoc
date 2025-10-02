import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { doctorSchemas } from '../schemas/doctorSchemas';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
const doctorController = new DoctorController();

// Get all doctors with filters
router.get('/', 
  rateLimiter,
  validateRequest(doctorSchemas.getDoctors),
  doctorController.getDoctors
);

// Get doctor by ID
router.get('/:id', 
  rateLimiter,
  validateRequest(doctorSchemas.getDoctorById),
  doctorController.getDoctorById
);

// Get doctor profile (public)
router.get('/:id/profile', 
  rateLimiter,
  validateRequest(doctorSchemas.getDoctorProfile),
  doctorController.getDoctorProfile
);

// Get doctor availability
router.get('/:id/availability', 
  rateLimiter,
  validateRequest(doctorSchemas.getAvailability),
  doctorController.getAvailability
);

// Get doctor reviews
router.get('/:id/reviews', 
  rateLimiter,
  validateRequest(doctorSchemas.getReviews),
  doctorController.getReviews
);

// Get doctor services
router.get('/:id/services', 
  rateLimiter,
  validateRequest(doctorSchemas.getServices),
  doctorController.getServices
);

// Get doctor locations
router.get('/:id/locations', 
  rateLimiter,
  validateRequest(doctorSchemas.getLocations),
  doctorController.getLocations
);

// Get nearby doctors
router.get('/nearby/search', 
  rateLimiter,
  validateRequest(doctorSchemas.getNearbyDoctors),
  doctorController.getNearbyDoctors
);

// Get doctors by specialty
router.get('/specialty/:specialty', 
  rateLimiter,
  validateRequest(doctorSchemas.getDoctorsBySpecialty),
  doctorController.getDoctorsBySpecialty
);

// Get doctors by insurance
router.get('/insurance/:insuranceId', 
  rateLimiter,
  validateRequest(doctorSchemas.getDoctorsByInsurance),
  doctorController.getDoctorsByInsurance
);

// Create doctor profile (authenticated)
router.post('/', 
  authMiddleware,
  rateLimiter,
  validateRequest(doctorSchemas.createDoctor),
  doctorController.createDoctor
);

// Update doctor profile (authenticated)
router.put('/:id', 
  authMiddleware,
  rateLimiter,
  validateRequest(doctorSchemas.updateDoctor),
  doctorController.updateDoctor
);

// Update doctor availability (authenticated)
router.put('/:id/availability', 
  authMiddleware,
  rateLimiter,
  validateRequest(doctorSchemas.updateAvailability),
  doctorController.updateAvailability
);

// Upload doctor profile image (authenticated)
router.post('/:id/upload-image', 
  authMiddleware,
  rateLimiter,
  doctorController.uploadProfileImage
);

// Delete doctor profile (authenticated)
router.delete('/:id', 
  authMiddleware,
  rateLimiter,
  validateRequest(doctorSchemas.deleteDoctor),
  doctorController.deleteDoctor
);

export default router;
