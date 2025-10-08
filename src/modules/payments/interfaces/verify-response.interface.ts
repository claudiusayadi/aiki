export interface IPaymentVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    fees: number;
    currency: string;
    customer: any;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    ip_address: string;
    metadata: any;
    authorization: any;
    plan: any;
  };
}
