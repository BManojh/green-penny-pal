import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type aliases for cleaner code
type FinancialTransaction = Database['public']['Tables']['financial_transactions']['Row'];
type FinancialTransactionInsert = Database['public']['Tables']['financial_transactions']['Insert'];
type Budget = Database['public']['Tables']['budgets']['Row'];
type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
type FinancialGoal = Database['public']['Tables']['financial_goals']['Row'];
type FinancialGoalInsert = Database['public']['Tables']['financial_goals']['Insert'];

interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  totalEcoSavings: number;
  netSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyEcoSavings: number;
  transactions: FinancialTransaction[];
  budgets: Budget[];
  goals: FinancialGoal[];
  categorySpending: { [key: string]: number };
  loading: boolean;
  error: string | null;
}

export const useFinancialData = (userId: string): FinancialStats => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (transactionsError) throw transactionsError;

        // Fetch budgets
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId);

        if (budgetsError) throw budgetsError;

        // Fetch goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('financial_goals')
          .select('*')
          .eq('user_id', userId);

        if (goalsError) throw goalsError;

        setTransactions(transactionsData || []);
        setBudgets(budgetsData || []);
        setGoals(goalsData || []);

      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError('Failed to load financial data');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();

    // Subscribe to real-time changes
    const transactionsChannel = supabase
      .channel('financial_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_transactions',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchFinancialData()
      )
      .subscribe();

    const budgetsChannel = supabase
      .channel('budgets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchFinancialData()
      )
      .subscribe();

    const goalsChannel = supabase
      .channel('goals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_goals',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchFinancialData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(budgetsChannel);
      supabase.removeChannel(goalsChannel);
    };
  }, [userId]);

  // Calculate financial statistics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEcoSavings = 0; // Will be calculated from eco activities in future

  const netSavings = totalIncome - totalExpenses + totalEcoSavings;

  const monthlyIncome = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'income' && 
             date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && 
             date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyEcoSavings = 0; // Will be calculated from eco activities

  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as { [key: string]: number });

  return {
    totalIncome,
    totalExpenses,
    totalEcoSavings,
    netSavings,
    monthlyIncome,
    monthlyExpenses,
    monthlyEcoSavings,
    transactions,
    budgets,
    goals,
    categorySpending,
    loading,
    error
  };
};

// CRUD operations
export const addTransaction = async (userId: string, transaction: FinancialTransactionInsert) => {
  try {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert([{ ...transaction, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const addBudget = async (userId: string, budget: BudgetInsert) => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .insert([{ ...budget, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
};

export const addGoal = async (userId: string, goal: FinancialGoalInsert) => {
  try {
    const { data, error } = await supabase
      .from('financial_goals')
      .insert([{ ...goal, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

export const updateTransaction = async (id: string, updates: Partial<FinancialTransactionInsert>) => {
  try {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string) => {
  try {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const updateBudget = async (id: string, updates: Partial<BudgetInsert>) => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

export const deleteBudget = async (id: string) => {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

export const updateGoal = async (id: string, updates: Partial<FinancialGoalInsert>) => {
  try {
    const { data, error } = await supabase
      .from('financial_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (id: string) => {
  try {
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};