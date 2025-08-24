import React from 'react';
import { useShipments, useTasks } from '../hooks/useSupabaseData';
import { CheckCircle } from 'lucide-react';
import type { Priority } from '../types';

const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case 'Alta': return 'text-destructive bg-destructive/10 border border-destructive/20';
    case 'Media': return 'text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 dark:text-yellow-500';
    case 'Bassa': return 'text-green-600 bg-green-500/10 border border-green-500/20 dark:text-green-500';
    default: return 'text-muted-foreground bg-muted border border-border';
  }
};

export const DashboardView: React.FC = () => {
  const { shipments, loading: shipmentsLoading } = useShipments();
  const { tasks, loading: tasksLoading } = useTasks();
  
  if (shipmentsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Caricamento dati...</div>
      </div>
    );
  }

  const todayShipments = shipments.filter(s => 
    s.due_date && new Date(s.due_date).toDateString() === new Date().toDateString()
  );
  
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="elegant-card p-6 hover:glow-shadow transition-all duration-300 group">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Spedizioni Totali</h3>
          <p className="text-3xl font-bold text-primary group-hover:text-primary/80 transition-colors">{shipments.length}</p>
        </div>
        
        <div className="elegant-card p-6 hover:glow-shadow transition-all duration-300 group">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Spedizioni Oggi</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-500 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">{todayShipments.length}</p>
        </div>
        
        <div className="elegant-card p-6 hover:glow-shadow transition-all duration-300 group">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Task Attivi</h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-500 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">{pendingTasks.length}</p>
        </div>
        
        <div className="elegant-card p-6 hover:glow-shadow transition-all duration-300 group">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Task Completati</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-500 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">{completedTasks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="elegant-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">Spedizioni Recenti</h3>
          <div className="space-y-3">
            {shipments.length > 0 ? shipments.slice(0, 5).map((shipment) => (
              <div key={shipment.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:bg-muted/20 -mx-2 px-2 rounded transition-colors">
                <div>
                  <p className="font-medium text-card-foreground">{shipment.order_number}</p>
                  <p className="text-sm text-muted-foreground">{shipment.customer?.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityClass(shipment.priority)}`}>
                  {shipment.priority}
                </span>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-8">Nessuna spedizione trovata</p>
            )}
          </div>
        </div>

        <div className="elegant-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">Task Recenti</h3>
          <div className="space-y-3">
            {tasks.length > 0 ? tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:bg-muted/20 -mx-2 px-2 rounded transition-colors">
                <div>
                  <p className="font-medium text-card-foreground">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.completed && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />}
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-8">Nessun task trovato</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};