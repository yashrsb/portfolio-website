import BaseCrudService from './BaseCrudService';

/**
 * Contact messages service — list, view, status update, delete.
 * Backed by: /api/v1/admin/contact-messages
 *
 * There is no create endpoint for contact messages (they are submitted via
 * the public /api/v1/contact endpoint), so the inherited `create` and
 * `reorder` methods are simply never called.
 */
class ContactMessagesService extends BaseCrudService {
  constructor() {
    super('contact-messages');
  }
}

const contactMessagesService = new ContactMessagesService();

export default contactMessagesService;
