import React from 'react';
import { useShipments, useTasks } from '../hooks/useSupabaseData';
import { CheckCircle } from 'lucide-react';
import type { Priority } from '../types';

const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case 'Alta': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    case 'Media': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    case 'Bassa': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    default: return 'text-muted-foreground bg-muted';
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
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Spedizioni Totali</h3>
          <p className="text-3xl font-bold text-blue-500">{shipments.length}</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Spedizioni Oggi</h3>
          <p className="text-3xl font-bold text-green-500">{todayShipments.length}</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Task Attivi</h3>
          <p className="text-3xl font-bold text-orange-500">{pendingTasks.length}</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Task Completati</h3>
          <p className="text-3xl font-bold text-purple-500">{completedTasks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Spedizioni Recenti</h3>
          <div className="space-y-3">
            {shipments.slice(0, 5).map((shipment) => (
              <div key={shipment.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div>
                  <p className="font-medium">{shipment.order_number}</p>
                  <p className="text-sm text-muted-foreground">{shipment.customer?.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(shipment.priority)}`}>
                  {shipment.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Task Recenti</h3>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};