import { Router } from 'express';
import { DoctorController } from '../controllers/DoctorController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { doctorSchemas } from '../schemas/doctorSchemas';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
const doctorController = new DoctorController();

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors with filters
 *     description: Retrieve a list of doctors with optional filtering and pagination
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of doctors per page
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filter by medical specialty
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: insurance
 *         schema:
 *           type: string
 *         description: Filter by accepted insurance
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by availability date
 *     responses:
 *       200:
 *         description: List of doctors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Doctors retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     doctors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 123e4567-e89b-12d3-a456-426614174000
 *                           firstName:
 *                             type: string
 *                             example: Dr. John
 *                           lastName:
 *                             type: string
 *                             example: Smith
 *                           specialty:
 *                             type: string
 *                             example: Cardiology
 *                           rating:
 *                             type: number
 *                             example: 4.8
 *                           reviewCount:
 *                             type: integer
 *                             example: 150
 *                           location:
 *                             type: string
 *                             example: New York, NY
 *                           profileImage:
 *                             type: string
 *                             example: https://example.com/profile.jpg
 *                           isAvailable:
 *                             type: boolean
 *                             example: true
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', 
  rateLimiter,
  validateRequest(doctorSchemas.getDoctors),
  doctorController.getDoctors
);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     description: Retrieve detailed information about a specific doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor's unique identifier
 *     responses:
 *       200:
 *         description: Doctor details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Doctor retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     firstName:
 *                       type: string
 *                       example: Dr. John
 *                     lastName:
 *                       type: string
 *                       example: Smith
 *                     specialty:
 *                       type: string
 *                       example: Cardiology
 *                     bio:
 *                       type: string
 *                       example: Experienced cardiologist with 15 years of practice
 *                     rating:
 *                       type: number
 *                       example: 4.8
 *                     reviewCount:
 *                       type: integer
 *                       example: 150
 *                     location:
 *                       type: object
 *                       properties:
 *                         address:
 *                           type: string
 *                           example: 123 Main St, New York, NY 10001
 *                         coordinates:
 *                           type: object
 *                           properties:
 *                             lat:
 *                               type: number
 *                               example: 40.7128
 *                             lng:
 *                               type: number
 *                               example: -74.0060
 *                     profileImage:
 *                       type: string
 *                       example: https://example.com/profile.jpg
 *                     education:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Harvard Medical School", "Johns Hopkins Residency"]
 *                     certifications:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Board Certified Cardiologist", "Fellowship in Interventional Cardiology"]
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["English", "Spanish"]
 *                     insuranceAccepted:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Aetna", "Blue Cross", "Cigna"]
 *                     isAvailable:
 *                       type: boolean
 *                       example: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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
