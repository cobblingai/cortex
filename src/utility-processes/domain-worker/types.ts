export interface RequestMessage {
  id: string;
  service: string;
  action: string;
  args: any[];
}

export interface ResponseMessage {
  id: string;
  result?: any;
  error?: string;
}
