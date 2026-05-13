import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { AddExpenseForm } from './AddExpenseForm';
import { formatCurrency } from '../../utils/formatCurrency';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projectService.getById(id);
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await projectService.updateStatus(id, newStatus);
      await loadProject();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return <div className="text-center py-12">Projeto não encontrado</div>;

  const remaining = project.budget - project.spent;
  const percentage = (project.spent / project.budget) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft /> Voltar para Dashboard
      </button>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-500 mt-2">{project.description}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="planning">Planejamento</option>
              <option value="active">Ativo</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FiDollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Orçamento</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(project.budget)}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <FiTrendingDown className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Gasto</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(project.spent)}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FiTrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Restante</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(remaining)}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso de gastos</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
          <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${Math.min(percentage, 100)}%` }}
              className={`${
                percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            ></div>
          </div>
        </div>
      </div>

      <AddExpenseForm projectId={id} onExpenseAdded={loadProject} />
    </div>
  );
};