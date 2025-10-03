import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Interfaces for the hook parameters
export interface FinancialTransactionInput {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  user_id: string;
}

interface BudgetInput {
  category: string;
  monthly_limit: number;
  user_id: string;
}

export interface FinancialGoalInput {
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  user_id: string;
}

// Simple interfaces that match our database schema
export interface FinancialTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  spent: number;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

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
  refresh: () => Promise<void>;
}

export const useFinancialData = (userId: string): FinancialStats => {
  const [stats, setStats] = useState<FinancialStats>({
    totalIncome: 0,
    totalExpenses: 0,
    totalEcoSavings: 0,
    netSavings: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyEcoSavings: 0,
    transactions: [],
    budgets: [],
    goals: [],
    categorySpending: {},
    loading: true,
    error: null,
    refresh: async () => {}
  });

  const fetchFinancialData = useCallback(async () => {
    if (!userId) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Try to fetch from Supabase first
      let transactionList: FinancialTransaction[] = [];
      let budgetList: Budget[] = [];
      let goalList: FinancialGoal[] = [];

      try {
        // Fetch transactions
        const { data: transactions, error: transactionError } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        // Fetch budgets
        const { data: budgets, error: budgetError } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId);

        // Fetch goals
        const { data: goals, error: goalError } = await supabase
          .from('financial_goals')
          .select('*')
          .eq('user_id', userId);

        if (!transactionError && !budgetError && !goalError) {
          transactionList = (transactions || []) as FinancialTransaction[];
          budgetList = (budgets || []) as Budget[];
          goalList = (goals || []) as FinancialGoal[];
        } else {
          throw new Error('Supabase data fetch failed');
        }
      } catch (supabaseError) {
        console.error('Supabase error, falling back to localStorage:', supabaseError);
        
        // Fallback to localStorage
        const storageKey = `financial_data_${userId}`;
        const existingData = localStorage.getItem(storageKey);
        if (existingData) {
          const data = JSON.parse(existingData);
          transactionList = data.transactions || [];
          budgetList = data.budgets || [];
          goalList = data.goals || [];
        }
      }

      // Calculate current month date range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const firstDayStr = firstDay.toISOString().split('T')[0];
      const lastDayStr = lastDay.toISOString().split('T')[0];

      // Calculate statistics

      const totalIncome = transactionList
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactionList
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyTransactions = transactionList.filter(
        t => t.date >= firstDayStr && t.date <= lastDayStr
      );

      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate category spending
      const categorySpending: { [key: string]: number } = {};
      transactionList
        .filter(t => t.type === 'expense')
        .forEach(t => {
          categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });

      // For now, we'll assume eco savings is 0 (will be integrated with eco activities later)
      const totalEcoSavings = 0;
      const monthlyEcoSavings = 0;

      setStats({
        totalIncome,
        totalExpenses,
        totalEcoSavings,
        netSavings: totalIncome - totalExpenses + totalEcoSavings,
        monthlyIncome,
        monthlyExpenses,
        monthlyEcoSavings,
        transactions: transactionList,
        budgets: budgetList,
        goals: goalList,
        categorySpending,
        loading: false,
        error: null,
        refresh: fetchFinancialData
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const transactionSubscription = supabase
      .channel('financial_transactions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'financial_transactions', filter: `user_id=eq.${userId}` },
        () => fetchFinancialData()
      )
      .subscribe();

    const budgetSubscription = supabase
      .channel('budgets_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${userId}` },
        () => fetchFinancialData()
      )
      .subscribe();

    const goalSubscription = supabase
      .channel('financial_goals_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'financial_goals', filter: `user_id=eq.${userId}` },
        () => fetchFinancialData()
      )
      .subscribe();

    // Listen for custom events from localStorage fallback
    const handleCustomUpdate = () => {
      fetchFinancialData();
    };
    window.addEventListener('financialDataUpdated', handleCustomUpdate);

    return () => {
      supabase.removeChannel(transactionSubscription);
      supabase.removeChannel(budgetSubscription);
      supabase.removeChannel(goalSubscription);
      window.removeEventListener('financialDataUpdated', handleCustomUpdate);
    };
  }, [userId, fetchFinancialData]);

  return stats;
};

// Helper functions for CRUD operations
export const addTransaction = async (transaction: FinancialTransactionInput): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('financial_transactions')
      .insert([transaction]);
    
    if (error) {
      console.error('Supabase error:', error);
      // Fallback to localStorage if Supabase fails
      return addTransactionToLocalStorage(transaction);
    }
    return true;
  } catch (error) {
    console.error('Error adding transaction:', error);
    // Fallback to localStorage if Supabase fails
    return addTransactionToLocalStorage(transaction);
  }
};

// Fallback localStorage functions
const addTransactionToLocalStorage = (transaction: FinancialTransactionInput): boolean => {
  try {
    const storageKey = `financial_data_${transaction.user_id}`;
    const existingData = localStorage.getItem(storageKey);
    let data = existingData ? JSON.parse(existingData) : { transactions: [], budgets: [], goals: [] };
    
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.transactions = data.transactions || [];
    data.transactions.push(newTransaction);
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    // Trigger a custom event to update the UI
    window.dispatchEvent(new CustomEvent('financialDataUpdated'));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const addBudget = async (budget: BudgetInput): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('budgets')
      .insert([budget]);
    
    if (error) {
      console.error('Supabase error:', error);
      return addBudgetToLocalStorage(budget);
    }
    return true;
  } catch (error) {
    console.error('Error adding budget:', error);
    return addBudgetToLocalStorage(budget);
  }
};

const addBudgetToLocalStorage = (budget: BudgetInput): boolean => {
  try {
    const storageKey = `financial_data_${budget.user_id}`;
    const existingData = localStorage.getItem(storageKey);
    let data = existingData ? JSON.parse(existingData) : { transactions: [], budgets: [], goals: [] };
    
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
      spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.budgets = data.budgets || [];
    data.budgets.push(newBudget);
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('financialDataUpdated'));
    return true;
  } catch (error) {
    console.error('Error saving budget to localStorage:', error);
    return false;
  }
};

export const addGoal = async (goal: FinancialGoalInput): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('financial_goals')
      .insert([goal]);
    
    if (error) {
      console.error('Supabase error:', error);
      return addGoalToLocalStorage(goal);
    }
    return true;
  } catch (error) {
    console.error('Error adding goal:', error);
    return addGoalToLocalStorage(goal);
  }
};

const addGoalToLocalStorage = (goal: FinancialGoalInput): boolean => {
  try {
    const storageKey = `financial_data_${goal.user_id}`;
    const existingData = localStorage.getItem(storageKey);
    let data = existingData ? JSON.parse(existingData) : { transactions: [], budgets: [], goals: [] };
    
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      current_amount: goal.current_amount || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.goals = data.goals || [];
    data.goals.push(newGoal);
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('financialDataUpdated'));
    return true;
  } catch (error) {
    console.error('Error saving goal to localStorage:', error);
    return false;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

export const updateTransaction = async (id: string, updates: Partial<FinancialTransactionInput>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
};