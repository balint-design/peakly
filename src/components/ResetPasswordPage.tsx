import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../lib/auth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    // Check if we have a hash parameter in the URL (indicates password reset)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setShowForm(true);
    } else {
      // User navigated here directly without a reset link
      toast.error('Ungültiger oder abgelaufener Link');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }
    
    setLoading(true);
    
    try {
      await updatePassword(password);
      toast.success('Passwort erfolgreich geändert');
      
      // Check if user is now logged in
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Redirect to profile
        navigate('/profile');
      } else {
        // Redirect to login
        navigate('/');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
      setLoading(false);
    }
  };
  
  if (!showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Lädt...</h1>
          <p className="mt-2 text-gray-600">Überprüfe deinen Reset-Link</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Passwort zurücksetzen</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Neues Passwort
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            {loading ? 'Lädt...' : 'Passwort aktualisieren'}
          </button>
        </form>
      </div>
    </div>
  );
}