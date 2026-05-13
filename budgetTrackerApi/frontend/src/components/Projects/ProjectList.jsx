import React, { useState } from 'react';
import { ProjectCard } from './ProjectCard';

export const ProjectList = ({ projects, onRefresh }) => {
  const [filter, setFilter] = useState('all');

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'planning', label: 'Planejamento' },
    { value: 'active', label: 'Ativos' },
    { value: 'completed', label: 'Concluídos' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  if (projects.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Nenhum projeto cadastrado ainda.</p>
        <p className="text-gray-400 text-sm mt-2">Clique em "Novo Projeto" para começar</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard key={project._id} project={project} onRefresh={onRefresh} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">Nenhum projeto encontrado com este status</p>
        </div>
      )}
    </div>
  );
};