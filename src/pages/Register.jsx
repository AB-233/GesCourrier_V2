
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Register = () => {
  const { toast } = useToast();
  const roles = ["ADMIN", "DN", "DNA", "BAOC", "CPDI", "DFS", "DMS", "DPES", "DSS", "COMPTABILITE", "SECRETARIAT"];

  const handleRegister = (e) => {
    e.preventDefault();
    toast({
      title: "Fonctionnalité en cours de développement",
      description: "🚧 Cette fonctionnalité n'est pas encore implémentée—mais ne vous inquiétez pas ! Vous pouvez la demander dans votre prochain prompt ! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Inscription - GesCourrier</title>
        <meta name="description" content="Page d'inscription à GesCourrier." />
      </Helmet>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <img src="https://imagedelivery.net/LqiWLm-3MGbYHtFuUbcBtA/119580eb-abd9-4191-b93a-f01938786700/public" alt="GesCourrier Logo" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un compte</h1>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                <input type="text" id="firstName" name="firstName" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 dark:text-white" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">NOM</label>
                <input type="text" id="lastName" name="lastName" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 dark:text-white" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" id="email" name="email" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 dark:text-white" />
            </div>
             <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
              <select id="role" name="role" required className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md text-gray-900 dark:text-white">
                {roles.map(role => <option key={role}>{role}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
              <input type="password" id="password" name="password" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmation du mot de passe</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-900 dark:text-white" />
            </div>
            <div>
              <Button type="submit" className="w-full">
                S'inscrire
              </Button>
            </div>
            <div className="text-center">
                <Link to="/login" className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300">
                    Déjà un compte ? Se connecter
                </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
  