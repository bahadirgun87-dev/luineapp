import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import ProgressBar from '../components/ProgressBar';

// ... (Interfaces remain the same)
interface Checklist {
  id: number;
  title: string;
  user_id: string;
  tasks?: Task[];
}

interface Task {
  id: number;
  title: string;
  is_complete: boolean;
  checklist_id: number;
}


const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ... (Data fetching and handlers remain the same)
  const fetchChecklistsWithTasks = useCallback(async (userId: string) => {
    setLoading(true);
    const { data: checklistsData, error: checklistsError } = await supabase
      .from('checklists')
      .select('*, tasks(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (checklistsError) {
      setError(checklistsError.message);
    } else {
      setChecklists(checklistsData || []);
      if (selectedChecklist) {
        const updatedSelected = checklistsData?.find(c => c.id === selectedChecklist.id) || null;
        setSelectedChecklist(updatedSelected);
      }
    }
    setLoading(false);
  }, [selectedChecklist]);

  useEffect(() => {
    const getUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchChecklistsWithTasks(user.id);
      }
      setLoading(false);
    };
    getUserAndData();
  }, [fetchChecklistsWithTasks]);

  const handleSelectChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistName.trim() || !user) return;
    const { error } = await supabase.from('checklists').insert({ title: newChecklistName, user_id: user.id });
    if (error) setError(error.message);
    else {
      setNewChecklistName('');
      await fetchChecklistsWithTasks(user.id);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !selectedChecklist || !user) return;
    const { error } = await supabase.from('tasks').insert({ title: newTaskName, checklist_id: selectedChecklist.id, user_id: user.id });
    if (error) setError(error.message);
    else {
      setNewTaskName('');
      await fetchChecklistsWithTasks(user.id);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const { error } = await supabase.from('tasks').update({ is_complete: !task.is_complete }).eq('id', task.id);
    if (error) setError(error.message);
    else await fetchChecklistsWithTasks(user!.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const calculateCompletion = (checklist: Checklist) => {
    if (!checklist.tasks || checklist.tasks.length === 0) return 0;
    const completedTasks = checklist.tasks.filter(t => t.is_complete).length;
    return (completedTasks / checklist.tasks.length) * 100;
  };


  if (loading && !checklists.length) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading...</div>;
  }

  // New JSX with the professional SaaS UI including Empty States
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/marketplace')}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-md text-sm transition-colors border border-slate-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Explore Templates
              </button>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">

          <aside className="md:col-span-1 lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">My Lists</h2>
            <form onSubmit={handleCreateChecklist} className="mb-6">
              <input type="text" value={newChecklistName} onChange={(e) => setNewChecklistName(e.target.value)} placeholder="New list name..." className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              <button type="submit" className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                Create New List
              </button>
            </form>

            {checklists.length > 0 ? (
                <ul className="space-y-3">
                    {checklists.map(list => {
                        const percentage = calculateCompletion(list);
                        return (
                        <li
                            key={list.id}
                            onClick={() => handleSelectChecklist(list)}
                            className={`bg-white p-4 rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.02] ${selectedChecklist?.id === list.id ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'}`}
                        >
                            <div className="flex justify-between items-center">
                            <p className="font-semibold text-slate-800">{list.title}</p>
                            <p className="text-sm font-medium text-slate-500">{percentage.toFixed(0)}%</p>
                            </div>
                            <ProgressBar percentage={percentage} />
                        </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-center bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-slate-500">You haven't created any lists yet. Add one to get started!</p>
                </div>
            )}
          </aside>

          <section className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
            {selectedChecklist ? (
              <div>
                {/* ... Task rendering logic ... */}
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedChecklist.title}</h2>
                <form onSubmit={handleAddTask} className="mb-6 flex gap-2">
                   <input type="text" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} placeholder="Add a new task..." className="flex-grow w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Add</button>
                </form>
                <ul className="space-y-3">
                  {(selectedChecklist.tasks || []).map(task => (
                    <li
                      key={task.id}
                      onClick={() => handleToggleTask(task)}
                      className="flex items-center p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-300 mr-3">
                         {task.is_complete && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                      </div>
                      <span className={`${task.is_complete ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-xl font-semibold text-slate-800">
                  {checklists.length > 0 ? 'Select a List' : 'Create Your First List'}
                </h3>
                <p className="mt-1">
                  {checklists.length > 0 ? 'Choose a list from the left to see its tasks.' : 'Get started by creating your first professional checklist.'}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      {error && <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg">{error}</div>}
    </div>
  );
};

export default DashboardPage;
