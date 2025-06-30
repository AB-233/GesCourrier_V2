
import React from 'react';
import { Helmet } from 'react-helmet';

const Users = () => {
  return (
    <>
      <Helmet>
        <title>Gestion des Utilisateurs - GesCourrier</title>
        <meta name="description" content="Page pour la gestion des utilisateurs." />
      </Helmet>
      <div className="text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-4">Gestion des Utilisateurs</h1>
        <p>Cette page permettra à l'administrateur de gérer les utilisateurs.</p>
      </div>
    </>
  );
};

export default Users;
  