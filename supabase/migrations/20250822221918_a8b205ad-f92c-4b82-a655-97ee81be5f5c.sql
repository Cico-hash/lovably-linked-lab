-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE public.priority_level AS ENUM ('Alta', 'Media', 'Bassa');
CREATE TYPE public.shipment_status AS ENUM ('Spedizioni Ferme', 'Spedizioni Future', 'Ritira il Cliente');
CREATE TYPE public.event_type AS ENUM ('shipment', 'task', 'pickup', 'meeting');
CREATE TYPE public.attachment_type AS ENUM ('document', 'image');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments table
CREATE TABLE public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    tracking_number TEXT,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id),
    due_date TIMESTAMPTZ,
    priority priority_level DEFAULT 'Media',
    status shipment_status DEFAULT 'Spedizioni Ferme',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipment products (many-to-many)
CREATE TABLE public.shipment_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(shipment_id, product_id)
);

-- Tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id),
    due_date TIMESTAMPTZ,
    priority priority_level DEFAULT 'Media',
    tags TEXT[],
    category TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sub tasks table
CREATE TABLE public.sub_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments table
CREATE TABLE public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type attachment_type NOT NULL,
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT attachment_belongs_to_one CHECK (
        (shipment_id IS NOT NULL AND task_id IS NULL) OR 
        (shipment_id IS NULL AND task_id IS NOT NULL)
    )
);

-- Comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    type event_type NOT NULL,
    resource_id UUID, -- Can reference shipments, tasks, etc.
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emails table
CREATE TABLE public.emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender TEXT NOT NULL,
    subject TEXT NOT NULL,
    snippet TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    gmail_id TEXT UNIQUE,
    received_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    notebook TEXT DEFAULT 'General',
    is_shared BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for customers (accessible to all authenticated users)
CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON public.customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete customers" ON public.customers FOR DELETE TO authenticated USING (true);

-- RLS Policies for products (accessible to all authenticated users)
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE TO authenticated USING (true);

-- RLS Policies for shipments (accessible to all authenticated users)
CREATE POLICY "Authenticated users can view shipments" ON public.shipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert shipments" ON public.shipments FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Authenticated users can update shipments" ON public.shipments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete shipments" ON public.shipments FOR DELETE TO authenticated USING (true);

-- RLS Policies for shipment_products
CREATE POLICY "Authenticated users can view shipment products" ON public.shipment_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert shipment products" ON public.shipment_products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update shipment products" ON public.shipment_products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete shipment products" ON public.shipment_products FOR DELETE TO authenticated USING (true);

-- RLS Policies for tasks
CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (true);

-- RLS Policies for sub_tasks
CREATE POLICY "Authenticated users can view sub tasks" ON public.sub_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sub tasks" ON public.sub_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sub tasks" ON public.sub_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete sub tasks" ON public.sub_tasks FOR DELETE TO authenticated USING (true);

-- RLS Policies for attachments
CREATE POLICY "Authenticated users can view attachments" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert attachments" ON public.attachments FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Authenticated users can update attachments" ON public.attachments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete attachments" ON public.attachments FOR DELETE TO authenticated USING (true);

-- RLS Policies for comments
CREATE POLICY "Authenticated users can view comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authenticated users can update own comments" ON public.comments FOR UPDATE TO authenticated USING (author_id = auth.uid());
CREATE POLICY "Authenticated users can delete own comments" ON public.comments FOR DELETE TO authenticated USING (author_id = auth.uid());

-- RLS Policies for calendar events
CREATE POLICY "Authenticated users can view calendar events" ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert calendar events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Authenticated users can update calendar events" ON public.calendar_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete calendar events" ON public.calendar_events FOR DELETE TO authenticated USING (true);

-- RLS Policies for emails (accessible to all authenticated users)
CREATE POLICY "Authenticated users can view emails" ON public.emails FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert emails" ON public.emails FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update emails" ON public.emails FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete emails" ON public.emails FOR DELETE TO authenticated USING (true);

-- RLS Policies for notes
CREATE POLICY "Users can view shared notes and own notes" ON public.notes FOR SELECT TO authenticated USING (is_shared = true OR created_by = auth.uid());
CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for critical tables
ALTER TABLE public.shipments REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.calendar_events REPLICA IDENTITY FULL;
ALTER TABLE public.notes REPLICA IDENTITY FULL;

-- Add tables to real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;