import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Checklist {
  id: number;
  title: string;
  user_id: string;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklists = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setChecklists(data || []);
    }
  }, []);

  useEffect(() => {
    const getUserAndChecklists = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchChecklists(user.id);
      }
      setLoading(false);
    };
    getUserAndChecklists();
  }, [fetchChecklists]);

  const fetchTasks = async (checklistId: number) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('created_at', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setTasks(data || []);
    }
  };

  const handleSelectChecklist = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    fetchTasks(checklist.id);
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistName.trim() || !user) return;

    const { data, error } = await supabase
      .from('checklists')
      .insert({ title: newChecklistName, user_id: user.id })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setChecklists([data, ...checklists]);
      setNewChecklistName('');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !selectedChecklist || !user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: newTaskName, checklist_id: selectedChecklist.id, user_id: user.id })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setTasks([...tasks, data]);
      setNewTaskName('');
    }
  };

  const handleToggleTask = async (task: Task) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_complete: !task.is_complete })
      .eq('id', task.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else if (data) {
      setTasks(tasks.map(t => (t.id === task.id ? data : t)));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // App component will handle redirect
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
        >
          Logout
        </button>
      </header>
      <main className="p-4 md:p-8 grid md:grid-cols-3 gap-8">
        <aside className="md:col-span-1 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">My Lists</h2>
          <form onSubmit={handleCreateChecklist} className="mb-6">
            <input
              type="text"
              value={newChecklistName}
              onChange={(e) => setNewChecklistName(e.target.value)}
              placeholder="New list name..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Create New List
            </button>
          </form>
          <ul className="space-y-2">
            {checklists.map(list => (
              <li
                key={list.id}
                onClick={() => handleSelectChecklist(list)}
                className={`p-3 rounded-md cursor-pointer ${selectedChecklist?.id === list.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {list.title}
              </li>
            ))}
          </ul>
        </aside>

        <section className="md:col-span-2 bg-gray-800 p-6 rounded-lg">
          {selectedChecklist ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">{selectedChecklist.title}</h2>
              <form onSubmit={handleAddTask} className="mb-6">
                 <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
                >
                  Add Task
                </button>
              </form>
              <ul className="space-y-3">
                {tasks.map(task => (
                  <li
                    key={task.id}
                    onClick={() => handleToggleTask(task)}
                    className="flex items-center p-3 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600"
                  >
                    <span className={`mr-3 w-5 h-5 rounded-full ${task.is_complete ? 'bg-green-500' : 'border-2 border-gray-500'}`}></span>
                    <span className={`${task.is_complete ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Select a list to see its tasks, or create a new one.</p>
            </div>
          )}
        </section>
      </main>
      {error && <div className="fixed bottom-4 right-4 bg-red-600 p-4 rounded-lg shadow-lg">{error}</div>}
    </div>
  );
};

export default DashboardPage;
