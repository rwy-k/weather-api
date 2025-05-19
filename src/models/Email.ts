import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { config } from '../config';

export class Email {
  private static initialized = false;

  private static initialize() {
    if (!this.initialized && config.email.sendgridApiKey) {
      sgMail.setApiKey(config.email.sendgridApiKey);
      this.initialized = true;
    }
  }

  static async sendEmail(to: string, subject: string, text: string, html?: string) {
    this.initialize();
    
    const msg: MailDataRequired = {
        to,
        from: {
            email: config.email.sender || 'noreply@weatherapp.com',
            name: 'Weather App'
        },
        subject,
        text,
        html: html || text
    };

    try {
        console.log('Sending email ', msg);
        await sgMail.send(msg);
        return true;
    } catch (error: any) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw error;
    }
  }
}