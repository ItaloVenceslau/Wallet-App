import React, { useState } from 'react';
import { projectService } from '../../services/projectService';
import toast from 'react-hot-toast';
import { FiPlusCircle } from 'react-icons/fi';

export const AddExpenseForm = ({ projectId, onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Valor deve ser positivo');
      return;
    }

    setLoading(true);
    try {
      await projectService.addExpense(projectId, amountNum);
      toast.success('Despesa adicionada com sucesso');
      setAmount('');
      onExpenseAdded();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao adicionar despesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Adicionar Despesa</h2>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              R$
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input pl-10"
              placeholder="0,00"
              step="0.01"
              min="0.01"
              required
              disabled={loading}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlusCircle /> {loading ? 'Adicionando...' : 'Adicionar'}
        </button>
      </form>
    </div>
  );
};