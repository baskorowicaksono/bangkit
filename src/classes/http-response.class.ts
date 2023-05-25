import { HttpResponseInterface } from '@interfaces/classes/http-response.interface';

export class HttpResponse {
  status: number;
  data?: any;
  message: string;

  constructor(status: number, message: string, data?: any) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  get(): HttpResponseInterface {
    return {
      status: this.status,
      data: this.data || null,
      message: this.message,
    };
  }
}
