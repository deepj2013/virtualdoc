import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Document, CreateDocumentData } from '../types/Document';
import { logger } from '../utils/logger';

export class DocumentRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'virtualdoc',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });
  }

  public async findByPatientId(patientId: string): Promise<Document[]> {
    try {
      const query = `
        SELECT * FROM documents 
        WHERE patient_id = $1 AND is_active = true
        ORDER BY uploaded_at DESC
      `;
      const result = await this.pool.query(query, [patientId]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding documents by patient ID:', error);
      throw error;
    }
  }

  public async create(data: CreateDocumentData & { patientId: string }): Promise<Document> {
    try {
      const id = uuidv4();
      const now = new Date();

      const query = `
        INSERT INTO documents (
          id, patient_id, file_name, original_file_name, file_type, file_size,
          file_path, document_type, description, uploaded_by, uploaded_at,
          is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        ) RETURNING *
      `;

      const values = [
        id,
        data.patientId,
        data.fileName,
        data.originalFileName,
        data.fileType,
        data.fileSize,
        data.filePath,
        data.documentType,
        data.description || null,
        data.uploadedBy,
        now,
        true,
        now,
        now
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating document:', error);
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const query = `
        UPDATE documents 
        SET is_active = false, updated_at = $1
        WHERE id = $2
      `;
      await this.pool.query(query, [new Date(), id]);
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw error;
    }
  }
}

