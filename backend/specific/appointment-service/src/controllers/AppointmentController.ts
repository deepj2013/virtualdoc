import { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/Appointment';

export class AppointmentController {
  private appointmentService: AppointmentService;

  constructor() {
    this.appointmentService = new AppointmentService();
  }

  public getAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, patientId, doctorId, status, appointmentType, startDate, endDate, sortBy = 'startTime', sortOrder = 'asc' } = req.query;
      
      const result = await this.appointmentService.getAppointments({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        patientId: patientId as string,
        doctorId: doctorId as string,
        status: status as string,
        appointmentType: appointmentType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      const response: ApiResponse = {
        success: true,
        message: 'Appointments retrieved successfully',
        data: {
          appointments: result.appointments,
          pagination: result.pagination
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get appointments error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve appointments',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public getAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const appointment = await this.appointmentService.getAppointmentById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Appointment retrieved successfully',
        data: { appointment }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get appointment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(404).json(response);
    }
  };

  public createAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const appointmentData = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      appointmentData.createdBy = userId;
      const appointment = await this.appointmentService.createAppointment(appointmentData);

      const response: ApiResponse = {
        success: true,
        message: 'Appointment created successfully',
        data: { appointment }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Create appointment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public updateAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const appointment = await this.appointmentService.updateAppointment(id, updateData);

      const response: ApiResponse = {
        success: true,
        message: 'Appointment updated successfully',
        data: { appointment }
      };

      res.json(response);
    } catch (error) {
      logger.error('Update appointment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public cancelAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      await this.appointmentService.cancelAppointment(id, reason);

      const response: ApiResponse = {
        success: true,
        message: 'Appointment cancelled successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Cancel appointment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to cancel appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public rescheduleAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newStartTime, newEndTime, reason } = req.body;
      
      const appointment = await this.appointmentService.rescheduleAppointment(id, newStartTime, newEndTime, reason);

      const response: ApiResponse = {
        success: true,
        message: 'Appointment rescheduled successfully',
        data: { appointment }
      };

      res.json(response);
    } catch (error) {
      logger.error('Reschedule appointment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to reschedule appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public getDoctorSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { doctorId } = req.params;
      const { date, startDate, endDate } = req.query;
      
      let appointments;
      if (date) {
        appointments = await this.appointmentService.getDoctorScheduleForDate(doctorId, new Date(date as string));
      } else if (startDate && endDate) {
        appointments = await this.appointmentService.getDoctorScheduleForRange(doctorId, new Date(startDate as string), new Date(endDate as string));
      } else {
        appointments = await this.appointmentService.getDoctorScheduleForDate(doctorId, new Date());
      }

      const response: ApiResponse = {
        success: true,
        message: 'Doctor schedule retrieved successfully',
        data: { appointments }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get doctor schedule error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve doctor schedule',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public getPatientAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { patientId } = req.params;
      const { status, startDate, endDate } = req.query;
      
      const appointments = await this.appointmentService.getPatientAppointments(patientId, {
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      const response: ApiResponse = {
        success: true,
        message: 'Patient appointments retrieved successfully',
        data: { appointments }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get patient appointments error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve patient appointments',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public checkAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { doctorId, startTime, endTime, duration } = req.query;
      
      const availability = await this.appointmentService.checkAvailability(
        doctorId as string,
        new Date(startTime as string),
        new Date(endTime as string),
        parseInt(duration as string) || 30
      );

      const response: ApiResponse = {
        success: true,
        message: 'Availability checked successfully',
        data: { availability }
      };

      res.json(response);
    } catch (error) {
      logger.error('Check availability error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to check availability',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
    try {
      const { doctorId, date, duration = 30 } = req.query;
      
      const slots = await this.appointmentService.getAvailableSlots(
        doctorId as string,
        new Date(date as string),
        parseInt(duration as string)
      );

      const response: ApiResponse = {
        success: true,
        message: 'Available slots retrieved successfully',
        data: { slots }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get available slots error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve available slots',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public createRecurringAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
      const appointmentData = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      appointmentData.createdBy = userId;
      const appointments = await this.appointmentService.createRecurringAppointments(appointmentData);

      const response: ApiResponse = {
        success: true,
        message: 'Recurring appointments created successfully',
        data: { appointments }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Create recurring appointments error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create recurring appointments',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public getAppointmentConflicts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { doctorId, startTime, endTime, excludeAppointmentId } = req.query;
      
      const conflicts = await this.appointmentService.checkConflicts(
        doctorId as string,
        new Date(startTime as string),
        new Date(endTime as string),
        excludeAppointmentId as string
      );

      const response: ApiResponse = {
        success: true,
        message: 'Conflicts checked successfully',
        data: { conflicts }
      };

      res.json(response);
    } catch (error) {
      logger.error('Check conflicts error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to check conflicts',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public sendReminders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;
      
      await this.appointmentService.sendAppointmentReminder(appointmentId);

      const response: ApiResponse = {
        success: true,
        message: 'Reminder sent successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Send reminder error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to send reminder',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public getAppointmentStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { doctorId, startDate, endDate } = req.query;
      
      const statistics = await this.appointmentService.getAppointmentStatistics(
        doctorId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const response: ApiResponse = {
        success: true,
        message: 'Appointment statistics retrieved successfully',
        data: { statistics }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get appointment statistics error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve appointment statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };
}



