import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import toast from 'react-hot-toast';

export const ProjectForm = ({ project, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    budget: project?.budget || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || formData.name.length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres');
      return;
    }
    
    const budgetNum = parseFloat(formData.budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      toast.error('Budget deve ser um valor positivo');
      return;
    }

    setLoading(true);
    try {
      if (project) {
        await projectService.update(project._id, {
          name: formData.name,
          description: formData.description,
          budget: budgetNum
        });
        toast.success('Projeto atualizado com sucesso');
      } else {
        await projectService.create({
          name: formData.name,
          description: formData.description,
          budget: budgetNum
        });
        toast.success('Projeto criado com sucesso');
      }
      if (onSuccess) onSuccess();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar projeto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {project ? 'Editar Projeto' : 'Novo Projeto'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Projeto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Ex: Website, App, Reforma..."
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="3"
              placeholder="Descreva o projeto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orçamento Total *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="input pl-10"
                placeholder="0,00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Salvando...' : (project ? 'Atualizar' : 'Criar Projeto')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};