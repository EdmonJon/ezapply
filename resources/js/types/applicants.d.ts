export type Application = {
  id: number;
  status: string;
  desired_location?: string | null;
  deadline_date?: string | null; 
  user?: {
    id: number;
    email: string;
    basicinfo?:{
      id: number;
      first_name: string | null;
      last_name: string | null;
    };
  };
  company?: {
    id: number;
    company_name: string;
  };
};
