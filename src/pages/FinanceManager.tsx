import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialData, addTransaction, addBudget, addGoal } from "@/hooks/useFinancialData";
import { useUserStats } from "@/hooks/useUserStats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Target, 
  Plus,
  DollarSign,
  Calendar,
  BarChart3,
  Leaf,
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react";

const FinanceManager = () => {
  const { user } = useAuth();
  const { totalCO2Saved, totalMoneySaved } = useUserStats(user?.id || '');
  const {
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
    loading
  } = useFinancialData(user?.id || '');

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [newBudget, setNewBudget] = useState({
    category: '',
    monthly_limit: ''
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    target_date: '',
    category: ''
  });

  if (!user) return null;

  const handleAddTransaction = async () => {
    console.log('handleAddTransaction called');
    console.log('Transaction data:', newTransaction);
    console.log('User ID:', user?.id);
    console.log('User object:', user);
    
    // Use fallback user ID for testing if no authenticated user
    const userId = user?.id || 'test-user-123';
    console.log('Using user ID:', userId);
    
    console.log('Validation check:');
    console.log('- Category:', newTransaction.category);
    console.log('- Amount:', newTransaction.amount);
    console.log('- Description:', newTransaction.description);
    
    if (!newTransaction.category) {
      console.error('Missing category');
      return;
    }
    if (!newTransaction.amount) {
      console.error('Missing amount');
      return;
    }
    if (!newTransaction.description) {
      console.error('Missing description');
      return;
    }
    
    try {
      const transactionData = {
        type: newTransaction.type as 'income' | 'expense',
        category: newTransaction.category,
        amount: parseFloat(newTransaction.amount),
        description: newTransaction.description,
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        user_id: userId
      };
      
      console.log('Calling addTransaction with:', transactionData);
      
      const success = await addTransaction(transactionData);
      
      console.log('addTransaction result:', success);
      
      if (success) {
        console.log('Transaction added successfully, clearing form');
        setNewTransaction({
          type: 'expense',
          category: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleAddBudget = async () => {
    if (newBudget.category && newBudget.monthly_limit) {
      try {
        const success = await addBudget({
          ...newBudget,
          user_id: user.id,
          monthly_limit: parseFloat(newBudget.monthly_limit)
        });
        
        if (success) {
          setNewBudget({
            category: '',
            monthly_limit: ''
          });
        }
      } catch (error) {
        console.error('Error adding budget:', error);
      }
    }
  };

  const handleAddGoal = async () => {
    if (newGoal.title && newGoal.target_amount && newGoal.target_date && newGoal.category) {
      try {
        const success = await addGoal({
          ...newGoal,
          user_id: user.id,
          target_amount: parseFloat(newGoal.target_amount),
          current_amount: 0
        });
        
        if (success) {
          setNewGoal({
            title: '',
            target_amount: '',
            target_date: '',
            category: ''
          });
        }
      } catch (error) {
        console.error('Error adding goal:', error);
      }
    }
  };

  // Download functions
  const downloadTransactionsCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.type,
        t.category,
        `"${t.description}"`,
        t.amount
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadTransactionsPDF = () => {
    // Create a comprehensive HTML content for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Financial Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .summary { display: flex; justify-content: space-between; margin: 20px 0; }
          .stat-box { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; width: 23%; }
          .stat-value { font-size: 24px; font-weight: bold; }
          .stat-label { font-size: 12px; color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .income { color: #059669; }
          .expense { color: #dc2626; }
          .eco-savings { color: #0891b2; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Financial Report</h1>
        <p><strong>Report Period:</strong> All Time | <strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <div class="summary">
          <div class="stat-box">
            <div class="stat-value income">₹${totalIncome.toLocaleString()}</div>
            <div class="stat-label">Total Income</div>
          </div>
          <div class="stat-box">
            <div class="stat-value expense">₹${totalExpenses.toLocaleString()}</div>
            <div class="stat-label">Total Expenses</div>
          </div>
          <div class="stat-box">
            <div class="stat-value eco-savings">₹${totalMoneySaved.toLocaleString()}</div>
            <div class="stat-label">Eco Savings</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">₹${netSavings.toLocaleString()}</div>
            <div class="stat-label">Net Savings</div>
          </div>
        </div>

        <h2>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.slice(0, 20).map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td class="${t.type}">${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
                <td>${t.category}</td>
                <td>${t.description}</td>
                <td class="${t.type}">₹${t.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${budgets.length > 0 ? `
        <h2>Budget Overview</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Budget</th>
              <th>Spent</th>
              <th>Remaining</th>
              <th>Usage %</th>
            </tr>
          </thead>
          <tbody>
            ${budgets.map(b => {
              const percentage = (b.spent / b.monthly_limit) * 100;
              return `
                <tr>
                  <td>${b.category}</td>
                  <td>₹${b.monthly_limit.toLocaleString()}</td>
                  <td class="expense">₹${b.spent.toLocaleString()}</td>
                  <td>₹${(b.monthly_limit - b.spent).toLocaleString()}</td>
                  <td>${percentage.toFixed(1)}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ` : ''}

        ${goals.length > 0 ? `
        <h2>Financial Goals</h2>
        <table>
          <thead>
            <tr>
              <th>Goal</th>
              <th>Target Amount</th>
              <th>Current Amount</th>
              <th>Progress %</th>
              <th>Target Date</th>
            </tr>
          </thead>
          <tbody>
            ${goals.map(g => {
              const percentage = (g.current_amount / g.target_amount) * 100;
              return `
                <tr>
                  <td>${g.title}</td>
                  <td>₹${g.target_amount.toLocaleString()}</td>
                  <td class="income">₹${g.current_amount.toLocaleString()}</td>
                  <td>${percentage.toFixed(1)}%</td>
                  <td>${new Date(g.target_date).toLocaleDateString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ` : ''}

        <div class="footer">
          <p>Generated by Green Penny Pal Finance Manager</p>
        </div>
      </body>
      </html>
    `;
    
    // Open in new window for printing/saving as PDF
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.print();
    }
  };

  const downloadBudgetsCSV = () => {
    const headers = ['Category', 'Monthly Limit', 'Spent', 'Remaining', 'Usage Percentage'];
    const csvContent = [
      headers.join(','),
      ...budgets.map(b => {
        const percentage = (b.spent / b.monthly_limit) * 100;
        return [
          b.category,
          b.monthly_limit,
          b.spent,
          b.monthly_limit - b.spent,
          `${percentage.toFixed(1)}%`
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `budgets_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadGoalsCSV = () => {
    const headers = ['Goal Title', 'Category', 'Target Amount', 'Current Amount', 'Progress Percentage', 'Target Date'];
    const csvContent = [
      headers.join(','),
      ...goals.map(g => {
        const percentage = (g.current_amount / g.target_amount) * 100;
        return [
          `"${g.title}"`,
          g.category,
          g.target_amount,
          g.current_amount,
          `${percentage.toFixed(1)}%`,
          g.target_date
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `goals_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Finance Manager</h1>
            <p className="text-muted-foreground">Manage your money and track your eco-savings</p>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-900">₹{totalIncome.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-900">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Eco Savings</p>
              <p className="text-2xl font-bold text-blue-900">₹{totalMoneySaved.toLocaleString()}</p>
              <p className="text-xs text-blue-600">From {totalCO2Saved.toFixed(1)}kg CO₂ saved</p>
            </div>
            <Leaf className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Net Savings</p>
              <p className="text-2xl font-bold text-purple-900">₹{netSavings.toLocaleString()}</p>
            </div>
            <PiggyBank className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">This Month's Summary</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Monthly Income</p>
            <p className="text-xl font-bold text-green-600">₹{monthlyIncome.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Monthly Expenses</p>
            <p className="text-xl font-bold text-red-600">₹{monthlyExpenses.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Eco Savings This Month</p>
            <p className="text-xl font-bold text-blue-600">₹{monthlyEcoSavings.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Transaction
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select value={newTransaction.type} onValueChange={(value: 'income' | 'expense') => 
                    setNewTransaction(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Category</Label>
                  <Select value={newTransaction.category} onValueChange={(value) => 
                    setNewTransaction(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {newTransaction.type === 'income' ? (
                        <>
                          <SelectItem value="Salary">Salary</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Investment">Investment</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      ) : (
                        categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="Transaction description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <Button onClick={handleAddTransaction} className="w-full">
                  Add Transaction
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={downloadTransactionsCSV}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Download CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadTransactionsPDF}>
                      <FileText className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 6).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <DollarSign className={`h-4 w-4 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">{transaction.category}</div>
                      </div>
                    </div>
                    <div className={`text-right font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Budget
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select value={newBudget.category} onValueChange={(value) => 
                    setNewBudget(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Monthly Limit</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newBudget.monthly_limit}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, monthly_limit: e.target.value }))}
                  />
                </div>

                <Button onClick={handleAddBudget} className="w-full">
                  Add Budget
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Budget Overview</h3>
                <Button variant="outline" size="sm" onClick={downloadBudgetsCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <div className="space-y-4">
                {budgets.map((budget, index) => {
                  const percentage = (budget.spent / budget.monthly_limit) * 100;
                  const isOverBudget = percentage > 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{budget.category}</span>
                        <Badge variant={isOverBudget ? "destructive" : percentage > 80 ? "default" : "secondary"}>
                          ₹{budget.spent.toLocaleString()} / ₹{budget.monthly_limit.toLocaleString()}
                        </Badge>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : percentage > 80 ? '[&>div]:bg-yellow-500' : ''}`}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{percentage.toFixed(1)}% used</span>
                        <span>₹{(budget.monthly_limit - budget.spent).toLocaleString()} remaining</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Financial Goal
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Goal Title</Label>
                  <Input
                    placeholder="e.g., Emergency Fund"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Target Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_amount: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => 
                    setNewGoal(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Savings">Savings</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Purchase">Purchase</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAddGoal} className="w-full">
                  Add Goal
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Financial Goals</h3>
                <Button variant="outline" size="sm" onClick={downloadGoalsCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <div className="space-y-6">
                {goals.map((goal, index) => {
                  const percentage = (goal.current_amount / goal.target_amount) * 100;
                  const isCompleted = percentage >= 100;
                  
                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {goal.title}
                            {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </h4>
                          <p className="text-sm text-muted-foreground">{goal.category}</p>
                        </div>
                        <Badge variant="outline">
                          {new Date(goal.target_date).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      <Progress value={Math.min(percentage, 100)} className="h-3" />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                        </span>
                        <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-foreground'}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Export Financial Data</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={downloadTransactionsCSV}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Transactions CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadBudgetsCSV}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Budgets CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadGoalsCSV}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Goals CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadTransactionsPDF}>
                      <FileText className="h-4 w-4 mr-2" />
                      Complete Report PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground">
                Download your financial data for record keeping, tax preparation, or analysis in external tools.
              </p>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Spending by Category
              </h3>
              <div className="space-y-4">
                {Object.entries(categorySpending).map(([category, amount]) => {
                  const percentage = (amount / totalExpenses) * 100;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{category}</span>
                        <span>₹{amount.toLocaleString()}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-sm text-muted-foreground text-right">
                        {percentage.toFixed(1)}% of total expenses
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                Eco Impact Integration
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Environmental Savings</span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    Your eco-friendly activities have saved you money while helping the planet!
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 font-semibold">₹{totalMoneySaved.toFixed(0)}</span>
                      <p className="text-green-600">Total saved</p>
                    </div>
                    <div>
                      <span className="text-green-600 font-semibold">{totalCO2Saved.toFixed(1)}kg</span>
                      <p className="text-green-600">CO₂ reduced</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Financial Health</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Savings Rate:</span>
                      <span className="font-semibold">{((netSavings / totalIncome) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Eco Contribution:</span>
                      <span className="font-semibold">{((totalEcoSavings / netSavings) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceManager;