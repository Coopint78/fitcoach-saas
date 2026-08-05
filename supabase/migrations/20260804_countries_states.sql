-- Countries table
CREATE TABLE IF NOT EXISTS public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  name_es text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_countries_code ON public.countries(code);

-- US States table
CREATE TABLE IF NOT EXISTS public.us_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  name_es text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_us_states_code ON public.us_states(code);

-- Insert countries (common ones)
INSERT INTO public.countries (code, name, name_es) VALUES
('US', 'United States', 'Estados Unidos'),
('MX', 'Mexico', 'México'),
('AR', 'Argentina', 'Argentina'),
('BR', 'Brazil', 'Brasil'),
('CO', 'Colombia', 'Colombia'),
('CL', 'Chile', 'Chile'),
('PE', 'Peru', 'Perú'),
('ES', 'Spain', 'España'),
('FR', 'France', 'Francia'),
('DE', 'Germany', 'Alemania'),
('IT', 'Italy', 'Italia'),
('GB', 'United Kingdom', 'Reino Unido'),
('CA', 'Canada', 'Canadá'),
('AU', 'Australia', 'Australia'),
('JP', 'Japan', 'Japón'),
('CN', 'China', 'China'),
('IN', 'India', 'India'),
('MX', 'Mexico', 'México'),
('VE', 'Venezuela', 'Venezuela'),
('EC', 'Ecuador', 'Ecuador'),
('BO', 'Bolivia', 'Bolivia'),
('PY', 'Paraguay', 'Paraguay'),
('UY', 'Uruguay', 'Uruguay')
ON CONFLICT (code) DO NOTHING;

-- Insert US States
INSERT INTO public.us_states (code, name, name_es) VALUES
('AL', 'Alabama', 'Alabama'),
('AK', 'Alaska', 'Alaska'),
('AZ', 'Arizona', 'Arizona'),
('AR', 'Arkansas', 'Arkansas'),
('CA', 'California', 'California'),
('CO', 'Colorado', 'Colorado'),
('CT', 'Connecticut', 'Connecticut'),
('DE', 'Delaware', 'Delaware'),
('FL', 'Florida', 'Florida'),
('GA', 'Georgia', 'Georgia'),
('HI', 'Hawaii', 'Hawái'),
('ID', 'Idaho', 'Idaho'),
('IL', 'Illinois', 'Illinois'),
('IN', 'Indiana', 'Indiana'),
('IA', 'Iowa', 'Iowa'),
('KS', 'Kansas', 'Kansas'),
('KY', 'Kentucky', 'Kentucky'),
('LA', 'Louisiana', 'Luisiana'),
('ME', 'Maine', 'Maine'),
('MD', 'Maryland', 'Maryland'),
('MA', 'Massachusetts', 'Massachusetts'),
('MI', 'Michigan', 'Michigan'),
('MN', 'Minnesota', 'Minnesota'),
('MS', 'Mississippi', 'Mississippi'),
('MO', 'Missouri', 'Missouri'),
('MT', 'Montana', 'Montana'),
('NE', 'Nebraska', 'Nebraska'),
('NV', 'Nevada', 'Nevada'),
('NH', 'New Hampshire', 'New Hampshire'),
('NJ', 'New Jersey', 'New Jersey'),
('NM', 'New Mexico', 'Nuevo México'),
('NY', 'New York', 'Nueva York'),
('NC', 'North Carolina', 'Carolina del Norte'),
('ND', 'North Dakota', 'Dakota del Norte'),
('OH', 'Ohio', 'Ohio'),
('OK', 'Oklahoma', 'Oklahoma'),
('OR', 'Oregon', 'Oregón'),
('PA', 'Pennsylvania', 'Pensilvania'),
('RI', 'Rhode Island', 'Rhode Island'),
('SC', 'South Carolina', 'Carolina del Sur'),
('SD', 'South Dakota', 'Dakota del Sur'),
('TN', 'Tennessee', 'Tennessee'),
('TX', 'Texas', 'Texas'),
('UT', 'Utah', 'Utah'),
('VT', 'Vermont', 'Vermont'),
('VA', 'Virginia', 'Virginia'),
('WA', 'Washington', 'Washington'),
('WV', 'West Virginia', 'Virginia Occidental'),
('WI', 'Wisconsin', 'Wisconsin'),
('WY', 'Wyoming', 'Wyoming'),
('DC', 'District of Columbia', 'Distrito de Columbia')
ON CONFLICT (code) DO NOTHING;
