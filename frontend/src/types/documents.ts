export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  variables: TemplateVariable[];
  preview: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: string[];
  default_value?: string;
}

export interface DocumentGenerateRequest {
  template_id: string;
  variables: Record<string, string>;
}

export interface GeneratedDocument {
  id: string;
  template_id: string;
  template_name: string;
  content: string;
  generated_at: string;
  format: string;
  download_url: string;
  disclaimer: string;
}
