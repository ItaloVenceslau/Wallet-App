import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';

export const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Budget Total',
      value: formatCurrency(stats?.totalBudget || 0),
      icon: FiDollarSign,
      color: 'bg-blue-500',
      bg: 'bg-blue-100',
      text: 'text-blue-600'
    },
    {
      title: 'Total Gasto',
      value: formatCurrency(stats?.totalSpent || 0),
      icon: FiTrendingDown,
      color: 'bg-red-500',
      bg: 'bg-red-100',
      text: 'text-red-600'
    },
    {
      title: 'Orçamento Restante',
      value: formatCurrency(stats?.remainingBudget || 0),
      icon: FiTrendingUp,
      color: 'bg-green-500',
      bg: 'bg-green-100',
      text: 'text-green-600'
    },
    {
      title: 'Projetos Ativos',
      value: stats?.activeProjects || 0,
      icon: FiActivity,
      color: 'bg-purple-500',
      bg: 'bg-purple-100',
      text: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`${card.bg} p-3 rounded-full`}>
              <card.icon className={`w-6 h-6 ${card.text}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};