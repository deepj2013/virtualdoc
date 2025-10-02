import { Request, Response } from 'express';
import { DoctorService } from '../services/DoctorService';
import { SearchService } from '../services/SearchService';
import { NotificationService } from '../services/NotificationService';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/ApiResponse';

export class DoctorController {
  private doctorService: DoctorService;
  private searchService: SearchService;
  private notificationService: NotificationService;

  constructor() {
    this.doctorService = new DoctorService();
    this.searchService = new SearchService();
    this.notificationService = new NotificationService();
  }

  /**
   * Get all doctors with filters
   */
  public getDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        specialty,
        location,
        radius,
        insurance,
        priceMin,
        priceMax,
        rating,
        availability,
        page = 1,
        limit = 20,
        sortBy = 'rating',
        sortOrder = 'desc'
      } = req.query;

      const filters = {
        specialty: specialty as string,
        location: location as string,
        radius: radius ? parseInt(radius as string) : undefined,
        insurance: insurance as string,
        priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
        priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        availability: availability as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const result = await this.doctorService.getDoctors(filters);

      const response: ApiResponse = {
        success: true,
        data: result.doctors,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / filters.limit)
        },
        message: 'Doctors retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting doctors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctors',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get doctor by ID
   */
  public getDoctorById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const doctor = await this.doctorService.getDoctorById(id);

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: doctor,
        message: 'Doctor retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting doctor by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get doctor profile (public)
   */
  public getDoctorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const profile = await this.doctorService.getDoctorProfile(id);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: 'Doctor profile not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: profile,
        message: 'Doctor profile retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting doctor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctor profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get doctor availability
   */
  public getAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { date, duration } = req.query;

      const availability = await this.doctorService.getAvailability(
        id,
        date as string,
        duration ? parseInt(duration as string) : undefined
      );

      const response: ApiResponse = {
        success: true,
        data: availability,
        message: 'Availability retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve availability',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get doctor reviews
   */
  public getReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, rating } = req.query;

      const reviews = await this.doctorService.getReviews(
        id,
        parseInt(page as string),
        parseInt(limit as string),
        rating ? parseFloat(rating as string) : undefined
      );

      const response: ApiResponse = {
        success: true,
        data: reviews.reviews,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: reviews.total,
          totalPages: Math.ceil(reviews.total / parseInt(limit as string))
        },
        message: 'Reviews retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve reviews',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get doctor services
   */
  public getServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const services = await this.doctorService.getServices(id);

      const response: ApiResponse = {
        success: true,
        data: services,
        message: 'Services retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting services:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve services',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get doctor locations
   */
  public getLocations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const locations = await this.doctorService.getLocations(id);

      const response: ApiResponse = {
        success: true,
        data: locations,
        message: 'Locations retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting locations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve locations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get nearby doctors
   */
  public getNearbyDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { lat, lng, radius = 10, specialty } = req.query;

      if (!lat || !lng) {
        res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
        return;
      }

      const doctors = await this.doctorService.getNearbyDoctors(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseInt(radius as string),
        specialty as string
      );

      const response: ApiResponse = {
        success: true,
        data: doctors,
        message: 'Nearby doctors retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting nearby doctors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve nearby doctors',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get doctors by specialty
   */
  public getDoctorsBySpecialty = async (req: Request, res: Response): Promise<void> => {
    try {
      const { specialty } = req.params;
      const { location, page = 1, limit = 20 } = req.query;

      const doctors = await this.doctorService.getDoctorsBySpecialty(
        specialty,
        location as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      const response: ApiResponse = {
        success: true,
        data: doctors.doctors,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: doctors.total,
          totalPages: Math.ceil(doctors.total / parseInt(limit as string))
        },
        message: 'Doctors by specialty retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting doctors by specialty:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctors by specialty',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get doctors by insurance
   */
  public getDoctorsByInsurance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { insuranceId } = req.params;
      const { location, page = 1, limit = 20 } = req.query;

      const doctors = await this.doctorService.getDoctorsByInsurance(
        insuranceId,
        location as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      const response: ApiResponse = {
        success: true,
        data: doctors.doctors,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: doctors.total,
          totalPages: Math.ceil(doctors.total / parseInt(limit as string))
        },
        message: 'Doctors by insurance retrieved successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting doctors by insurance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve doctors by insurance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Create doctor profile
   */
  public createDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
      const doctorData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const doctor = await this.doctorService.createDoctor(userId, doctorData);

      const response: ApiResponse = {
        success: true,
        data: doctor,
        message: 'Doctor profile created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating doctor:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create doctor profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Update doctor profile
   */
  public updateDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const doctor = await this.doctorService.updateDoctor(id, userId, updateData);

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found or unauthorized'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: doctor,
        message: 'Doctor profile updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error updating doctor:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update doctor profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Update doctor availability
   */
  public updateAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const availabilityData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const availability = await this.doctorService.updateAvailability(
        id,
        userId,
        availabilityData
      );

      if (!availability) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found or unauthorized'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: availability,
        message: 'Availability updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error updating availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update availability',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Upload doctor profile image
   */
  public uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      const imageUrl = await this.doctorService.uploadProfileImage(
        id,
        userId,
        req.file
      );

      if (!imageUrl) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found or unauthorized'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: { imageUrl },
        message: 'Profile image uploaded successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error uploading profile image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete doctor profile
   */
  public deleteDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const deleted = await this.doctorService.deleteDoctor(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found or unauthorized'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Doctor profile deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error deleting doctor:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete doctor profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
