import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiActivity } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';
import { projectService } from '../../services/projectService';
import toast from 'react-hot-toast';

const statusColors = {
  planning: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  planning: 'Planejamento',
  active: 'Ativo',
  completed: 'Concluído',
  cancelled: 'Cancelado'
};

export const ProjectCard = ({ project, onRefresh }) => {
  const [deleting, setDeleting] = useState(false);
  const percentage = (project.spent / project.budget) * 100;

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
      setDeleting(true);
      try {
        await projectService.delete(project._id);
        toast.success('Projeto excluído com sucesso');
        onRefresh();
      } catch (error) {
        toast.error('Erro ao excluir projeto');
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="card hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
          {project.description && (
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
          <span className="flex items-center gap-1">
            <FiActivity className="w-3 h-3" />
            {statusLabels[project.status]}
          </span>
        </span>
      </div>

      <div className="space-y-3 mt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Orçamento:</span>
          <span className="font-semibold">{formatCurrency(project.budget)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Gasto:</span>
          <span className="font-semibold text-red-600">{formatCurrency(project.spent)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Restante:</span>
          <span className="font-semibold text-green-600">{formatCurrency(project.budget - project.spent)}</span>
        </div>

        <div className="relative pt-1">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${Math.min(percentage, 100)}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% utilizado</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
        <Link
          to={`/projects/${project._id}`}
          className="text-blue-600 hover:text-blue-700 p-1"
          title="Ver detalhes"
        >
          <FiEdit2 className="w-5 h-5" />
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
          title="Excluir"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};