
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Mail, Send, Users, FileCheck, FileCog, Archive } from 'lucide-react';

const Sidebar = () => {
  const navLinkClasses = "flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200";
  const activeNavLinkClasses = "bg-purple-600 text-white";

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 p-4 shadow-lg flex flex-col">
      <div className="flex items-center mb-8 shrink-0">
        <img src="https://imagedelivery.net/LqiWLm-3MGbYHtFuUbcBtA/119580eb-abd9-4191-b93a-f01938786700/public" alt="GesCourrier Logo" className="h-10 w-auto" />
        <span className="ml-3 text-2xl font-bold text-gray-800 dark:text-white">GesCourrier</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li><NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} end><Home className="h-5 w-5 mr-3" />Tableau de bord</NavLink></li>
          <li><NavLink to="/courriers-arrives" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><Mail className="h-5 w-5 mr-3" />Courriers Arrivés</NavLink></li>
          <li><NavLink to="/courriers-departs" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><Send className="h-5 w-5 mr-3" />Courriers Départs</NavLink></li>
          <li><NavLink to="/affectation" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><FileCheck className="h-5 w-5 mr-3" />Affectation</NavLink></li>
          <li><NavLink to="/traitement" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><FileCog className="h-5 w-5 mr-3" />Traitement</NavLink></li>
          <li><NavLink to="/archivage" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><Archive className="h-5 w-5 mr-3" />Archivage</NavLink></li>
          <li><NavLink to="/utilisateurs" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><Users className="h-5 w-5 mr-3" />Utilisateurs</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
  