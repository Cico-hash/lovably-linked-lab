import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './use-toast';

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  email?: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
}

export interface Shipment {
  id: string;
  order_number: string;
  tracking_number?: string;
  customer_id: string;
  assigned_to?: string;
  due_date?: string;
  priority: 'Alta' | 'Media' | 'Bassa';
  status: 'Spedizioni Ferme' | 'Spedizioni Future' | 'Ritira il Cliente';
  created_by?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  assignedUser?: Profile;
  products?: Array<{ product: Product; quantity: number }>;
}

export interface Task {
  id: string;
  title: string;
  assigned_to?: string;
  due_date?: string;
  priority: 'Alta' | 'Media' | 'Bassa';
  tags?: string[];
  category?: string;
  completed: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  assignedUser?: Profile;
  subTasks?: Array<{ id: string; text: string; completed: boolean }>;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  notebook: string;
  is_shared: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: 'shipment' | 'task' | 'pickup' | 'meeting';
  resource_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Custom hooks for each data type
export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('profiles')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        fetchProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i profili utente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { profiles, loading, refetch: fetchProfiles };
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i clienti",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => [...prev, data]);
      toast({
        title: "Successo",
        description: "Cliente creato con successo"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il cliente",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  return { customers, loading, createCustomer, refetch: fetchCustomers };
};

export const useShipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchShipments();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('shipments')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'shipments' 
        }, () => {
          fetchShipments();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          customer:customers(*),
          assignedUser:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le spedizioni",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert({
          ...shipment,
          created_by: user?.id
        })
        .select(`
          *,
          customer:customers(*),
          assignedUser:profiles(*)
        `)
        .single();

      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Spedizione creata con successo"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare la spedizione",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateShipment = async (id: string, updates: Partial<Shipment>) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customer:customers(*),
          assignedUser:profiles(*)
        `)
        .single();

      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Spedizione aggiornata con successo"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la spedizione",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  return { 
    shipments, 
    loading, 
    createShipment, 
    updateShipment,
    refetch: fetchShipments 
  };
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('tasks')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'tasks' 
        }, () => {
          fetchTasks();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignedUser:profiles(*),
          subTasks:sub_tasks(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i task",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          created_by: user?.id
        })
        .select(`
          *,
          assignedUser:profiles(*),
          subTasks:sub_tasks(*)
        `)
        .single();

      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Task creato con successo"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il task",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          assignedUser:profiles(*),
          subTasks:sub_tasks(*)
        `)
        .single();

      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Task aggiornato con successo"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il task",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  return { 
    tasks, 
    loading, 
    createTask, 
    updateTask,
    refetch: fetchTasks 
  };
};

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotes();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('notes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notes' 
        }, () => {
          fetchNotes();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le note",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...note,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Nota creata con successo"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare la nota",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Successo",
        description: "Nota aggiornata con successo"
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la nota",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  return { 
    notes, 
    loading, 
    createNote, 
    updateNote,
    refetch: fetchNotes 
  };
};