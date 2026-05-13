import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { StatsCards } from './StatsCards';
import { BudgetChart } from './BudgetChart';
import { ProjectList } from '../Projects/ProjectList';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, statsData] = await Promise.all([
        projectService.getAll(),
        projectService.getStats()
      ]);
      setProjects(projectsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral dos seus projetos</p>
        </div>
        <Link to="/projects/new" className="btn-primary flex items-center gap-2">
          <FiPlus /> Novo Projeto
        </Link>
      </div>

      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BudgetChart projects={projects} />
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo Rápido</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Projetos totais:</span>
              <span className="font-semibold">{projects.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Projetos concluídos:</span>
              <span className="font-semibold text-green-600">
                {projects.filter(p => p.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Budget médio:</span>
              <span className="font-semibold">
                {stats?.totalBudget && projects.length 
                  ? (stats.totalBudget / projects.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'R$ 0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Seus Projetos</h2>
        <ProjectList projects={projects} onRefresh={loadData} />
      </div>
    </div>
  );
};