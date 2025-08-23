import React from 'react';

export const TodoView: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-card p-8 rounded-lg border text-center">
        <h3 className="text-lg font-semibold mb-2">Vista Task</h3>
        <p className="text-muted-foreground">Gestione task in sviluppo</p>
      </div>
    </div>
  );
};