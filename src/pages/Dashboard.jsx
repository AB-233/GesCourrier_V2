import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

const Dashboard = () => {
  const [incomingCount, setIncomingCount] = useState(0);
  const [outgoingCount, setOutgoingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const incoming = JSON.parse(localStorage.getItem('gescourrier_incoming_mails') || '[]');
    const outgoing = JSON.parse(localStorage.getItem('gescourrier_outgoing_mails') || '[]');
    const users = JSON.parse(localStorage.getItem('gescourrier_users') || '[]');
    setIncomingCount(incoming.length);
    setOutgoingCount(outgoing.length);
    setPendingCount(incoming.filter(m => m.status === 'pending').length);
    setUserCount(users.length);
  }, []);

  return (
    <>
      <Helmet>
        <title>Tableau de bord - GesCourrier</title>
        <meta name="description" content="Tableau de bord principal de l'application GesCourrier." />
      </Helmet>
      <div className="text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-4">Tableau de bord</h1>
        <p className="mb-8">Bienvenue sur GesCourrier !</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg bg-blue-600/80 text-white shadow">
            <div className="text-lg font-semibold">Courriers arrivés</div>
            <div className="text-3xl font-bold">{incomingCount}</div>
          </div>
          <div className="p-6 rounded-lg bg-green-600/80 text-white shadow">
            <div className="text-lg font-semibold">Courriers départ</div>
            <div className="text-3xl font-bold">{outgoingCount}</div>
          </div>
          <div className="p-6 rounded-lg bg-yellow-500/80 text-white shadow">
            <div className="text-lg font-semibold">Courriers à traiter</div>
            <div className="text-3xl font-bold">{pendingCount}</div>
          </div>
          <div className="p-6 rounded-lg bg-purple-600/80 text-white shadow">
            <div className="text-lg font-semibold">Utilisateurs</div>
            <div className="text-3xl font-bold">{userCount}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
