import BaseCrudService from './BaseCrudService';

/**
 * Certificate service — CRUD + reorder for the certificates resource.
 * Backed by: /api/v1/admin/certificates
 */
class CertificateService extends BaseCrudService {
  constructor() {
    super('certificates');
  }
}

const certificateService = new CertificateService();

export default certificateService;
